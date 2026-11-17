import { Check, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  searchText?: string;
}
interface SearchableSelectProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
  error?: string | undefined;
}

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  compact = false,
  error,
}: SearchableSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const selected = options.find((option) => option.value === value);
  const ToggleIcon = compact ? ChevronDown : ChevronsUpDown;
  const filtered = options.filter((option) =>
    `${option.label} ${option.searchText ?? ''} ${option.value}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !container.current?.contains(event.target)
      )
        setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useEffect(() => {
    if (open)
      optionRefs.current[active]?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function choose(option: SelectOption) {
    onChange(option.value);
    close();
  }
  function show() {
    setQuery('');
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setOpen(true);
  }
  function onSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') setOpen(false);
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) =>
        filtered.length
          ? (index + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) %
            filtered.length
          : 0,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[active];
      if (option) choose(option);
    } else if (event.key === 'Home' || event.key === 'End') {
      if (event.ctrlKey) {
        event.preventDefault();
        setActive(event.key === 'Home' ? 0 : Math.max(0, filtered.length - 1));
      }
    }
  }

  return (
    <div
      ref={container}
      className={`signup-select${compact ? ' signup-select--compact' : ''}`}
    >
      {!compact && (
        <label htmlFor={`${id}-trigger`} className="signup-label">
          {label}
        </label>
      )}
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        className="signup-select-trigger"
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => {
          if (open) close();
          else show();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            show();
          }
        }}
      >
        <span data-placeholder={!selected}>
          {compact
            ? (selected?.value ?? placeholder)
            : (selected?.label ?? placeholder)}
        </span>
        <ToggleIcon size={24} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="signup-select-menu">
          <div className="signup-select-search">
            <Search size={24} strokeWidth={1.5} aria-hidden="true" />
            <input
              ref={search}
              role="combobox"
              aria-label={`Search ${label.toLowerCase()}`}
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-activedescendant={
                filtered[active] ? `${id}-option-${active}` : undefined
              }
              autoComplete="off"
              placeholder="Search..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKey}
            />
          </div>
          <ul
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            className="signup-select-options"
          >
            {filtered.map((option, index) => (
              <li
                key={option.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                data-active={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check size={20} aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="signup-select-empty" role="status">
              No results found.
            </p>
          )}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="auth-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
