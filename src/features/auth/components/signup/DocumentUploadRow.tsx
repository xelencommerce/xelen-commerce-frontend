import { CircleCheck, X } from 'lucide-react';
import { useId, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { DOCUMENT_ACCEPT } from '../../constants/signup';
import { formatFileSize } from '../../lib/document-preview';
import type { DocumentPreview } from '../../types/signup';

export interface DocumentUploadRowProps {
  label: string;
  help: string;
  icon: LucideIcon;
  document: DocumentPreview;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export function DocumentUploadRow({
  label,
  help,
  icon: Icon,
  document,
  onSelect,
  onRemove,
}: DocumentUploadRowProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const selected =
    document.status === 'ready' || document.status === 'processing';
  const description = selected
    ? `${document.file.name} · ${document.status === 'processing' ? `${formatFileSize((document.file.size * document.progress) / 100)} of ` : ''}${formatFileSize(document.file.size)}`
    : document.status === 'error'
      ? document.message
      : help;

  return (
    <div
      className="signup-document-row"
      data-status={document.status}
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <input
        ref={input}
        id={`${id}-file`}
        type="file"
        accept={DOCUMENT_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`${label} file`}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onSelect(file);
          event.currentTarget.value = '';
        }}
      />
      <span className="signup-document-icon">
        {document.status === 'ready' ? (
          <CircleCheck size={24} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
        )}
      </span>
      <div className="signup-document-copy">
        <p id={`${id}-label`}>{label}</p>
        <p
          id={`${id}-description`}
          role={document.status === 'error' ? 'alert' : undefined}
        >
          {description}
        </p>
        {document.status === 'processing' && (
          <progress
            value={document.progress}
            max={100}
            aria-label={`Local preview progress for ${label}`}
          />
        )}
      </div>
      {document.status === 'processing' ? (
        <button
          type="button"
          className="signup-document-cancel"
          aria-label={`Cancel local preview for ${label}`}
          onClick={onRemove}
        >
          <X size={24} strokeWidth={1.5} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          className="signup-document-action"
          aria-label={`${document.status === 'ready' ? 'Remove' : document.status === 'error' ? 'Try again for' : 'Upload'} ${label}`}
          aria-describedby={`${id}-description`}
          onClick={
            document.status === 'ready'
              ? onRemove
              : () => input.current?.click()
          }
        >
          {document.status === 'ready'
            ? 'Remove'
            : document.status === 'error'
              ? 'Try again'
              : 'Upload'}
        </button>
      )}
    </div>
  );
}
