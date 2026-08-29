import { FileText, ExternalLink, FolderOpen } from 'lucide-react'
import type { Teacher } from '../../types'
import { DOCUMENT_TYPE_LABELS } from '../../types'

interface Props { teacher: Teacher }

const DOC_ICONS: Record<string, string> = {
  NID:               '🪪',
  BIRTH_CERT:        '📋',
  DEGREE_CERT:       '🎓',
  EXPERIENCE_LETTER: '📄',
  PHOTO:             '🖼️',
  SIGNATURE:         '✍️',
  OTHER:             '📁',
}

export function DocumentsTab({ teacher }: Props) {
  if (teacher.documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <FolderOpen size={36} className="text-zinc-800" />
        <p className="text-zinc-600">No documents uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-2">
        <FileText size={14} /> Documents ({teacher.documents.length})
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {teacher.documents.map(doc => (
          <div
            key={doc.id}
            className="bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl p-4 flex items-start gap-3 hover:border-zinc-100 transition-colors"
          >
            <span className="text-2xl">{DOC_ICONS[doc.type] || DOC_ICONS.OTHER}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 truncate">{doc.name}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{DOCUMENT_TYPE_LABELS[doc.type]}</p>
              <p className="text-xs text-zinc-800 mt-1">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors shrink-0"
              title="Open document"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
