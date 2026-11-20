import { act, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { marketingPlaybackStore } from '../components/marketing/marketing-playback';
import { useMarketingAnimation } from './use-marketing-animation';

const controls = vi.hoisted(() => ({
  start: vi.fn<() => Promise<void>>(),
  stop: vi.fn(),
  set: vi.fn(),
}));

vi.mock('motion/react', () => ({ useAnimationControls: () => controls }));

function Panel({ page = 'login' }: { page?: string }) {
  const { panelRef, initial } = useMarketingAnimation();
  return (
    <aside ref={panelRef} aria-label="Marketing" data-initial={initial}>
      {page}
    </aside>
  );
}

class VisibilityObserver {
  static instances: VisibilityObserver[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(private callback: IntersectionObserverCallback) {
    VisibilityObserver.instances.push(this);
  }
  emit(visible: boolean, ratio = visible ? 1 : 0) {
    this.callback(
      [
        {
          isIntersecting: visible,
          intersectionRatio: ratio,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

let media: EventTarget & { matches: boolean };
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
function pendingPlayback() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

let playback: ReturnType<typeof pendingPlayback>;

function observer() {
  return VisibilityObserver.instances.at(-1)!;
}

function flushFrame() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
}

function setReducedMotion(matches: boolean) {
  act(() => {
    media.matches = matches;
    media.dispatchEvent(new Event('change'));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  marketingPlaybackStore.setState(marketingPlaybackStore.getInitialState());
  VisibilityObserver.instances = [];
  frames = new Map();
  frameId = 0;
  playback = pendingPlayback();
  controls.start.mockReturnValue(playback.promise);
  media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
  vi.stubGlobal('IntersectionObserver', VisibilityObserver);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});

afterEach(() => vi.unstubAllGlobals());

describe('marketing animation playback', () => {
  it('waits for visibility, starts once, and finishes without restarting on auth navigation', async () => {
    const { rerender, unmount } = render(<Panel />);
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-initial',
      'hidden',
    );
    observer().emit(false);
    expect(frames.size).toBe(0);
    observer().emit(true, 0);
    expect(frames.size).toBe(0);
    observer().emit(true);
    observer().emit(true);
    expect(frames.size).toBe(1);
    flushFrame();
    expect(controls.start).toHaveBeenCalledExactlyOnceWith('enter');
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-animation-state',
      'playing',
    );
    rerender(<Panel page="signup" />);
    observer().emit(true);
    expect(frames.size).toBe(0);
    expect(controls.start).toHaveBeenCalledOnce();
    await act(async () => {
      playback.resolve();
      await playback.promise;
    });
    expect(controls.set).toHaveBeenLastCalledWith('complete');
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-animation-state',
      'complete',
    );
    unmount();
  });

  it('displays the final panel after leaving auth and returning during playback', async () => {
    const { unmount } = render(<Panel />);
    observer().emit(true);
    flushFrame();
    unmount();
    const updates = controls.set.mock.calls.length;
    await act(async () => {
      playback.resolve();
      await playback.promise;
    });
    expect(controls.set).toHaveBeenCalledTimes(updates);
    render(<Panel />);
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-initial',
      'complete',
    );
    expect(controls.start).toHaveBeenCalledOnce();
    expect(controls.set).toHaveBeenLastCalledWith('complete');
  });

  it('does not consume playback when unmounted before its first frame', () => {
    const { unmount } = render(<Panel />);
    const visibility = observer();
    visibility.emit(true);
    unmount();
    expect(frames.size).toBe(0);
    expect(visibility.disconnect).toHaveBeenCalled();
    visibility.emit(true);
    flushFrame();
    expect(controls.start).not.toHaveBeenCalled();
    expect(marketingPlaybackStore.getState().started).toBe(false);
    render(<Panel />);
    observer().emit(true);
    flushFrame();
    expect(controls.start).toHaveBeenCalledOnce();
  });

  it('plays once under Strict Mode and cleans up observers, frames, listeners and controls', () => {
    const removeListener = vi.spyOn(media, 'removeEventListener');
    const { unmount } = render(
      <StrictMode>
        <Panel />
      </StrictMode>,
    );
    expect(VisibilityObserver.instances).toHaveLength(2);
    expect(VisibilityObserver.instances[0]?.disconnect).toHaveBeenCalled();
    VisibilityObserver.instances[0]?.emit(true);
    expect(frames.size).toBe(0);
    observer().emit(true);
    flushFrame();
    expect(controls.start).toHaveBeenCalledOnce();
    unmount();
    expect(frames.size).toBe(0);
    expect(observer().disconnect).toHaveBeenCalled();
    expect(removeListener).toHaveBeenCalledTimes(2);
    const stops = controls.stop.mock.calls.length;
    setReducedMotion(true);
    expect(controls.stop).toHaveBeenCalledTimes(stops);
  });

  it('renders the final state immediately for an initial reduced-motion preference', () => {
    media.matches = true;
    render(<Panel />);
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-initial',
      'complete',
    );
    expect(VisibilityObserver.instances).toHaveLength(0);
    expect(controls.start).not.toHaveBeenCalled();
    expect(controls.set).toHaveBeenCalledWith('complete');
  });

  it('completes immediately when reduced motion is enabled during playback', () => {
    render(<Panel />);
    observer().emit(true);
    flushFrame();
    controls.stop.mockClear();
    setReducedMotion(true);
    expect(controls.stop).toHaveBeenCalledOnce();
    expect(controls.set).toHaveBeenLastCalledWith('complete');
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-animation-state',
      'complete',
    );
    setReducedMotion(false);
    observer().emit(true);
    flushFrame();
    expect(controls.start).toHaveBeenCalledOnce();
  });

  it('cancels pending playback when reduced motion is enabled before the first frame', () => {
    render(<Panel />);
    observer().emit(true);
    setReducedMotion(true);
    expect(frames.size).toBe(0);
    flushFrame();
    expect(controls.start).not.toHaveBeenCalled();
    expect(controls.set).toHaveBeenLastCalledWith('complete');
    expect(observer().disconnect).toHaveBeenCalled();
  });

  it('shows the completed panel when viewport observation is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Panel />);
    expect(screen.getByRole('complementary')).toHaveAttribute(
      'data-initial',
      'complete',
    );
    expect(controls.set).toHaveBeenCalledWith('complete');
    expect(controls.start).not.toHaveBeenCalled();
  });
});
