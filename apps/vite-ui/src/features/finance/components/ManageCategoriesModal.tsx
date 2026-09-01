import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Trash2, Tag, Sparkles } from 'lucide-react'
import { useExpenseCategories, useCreateExpenseCategory, useDeleteExpenseCategory } from '../hooks/useExpenses'

interface ManageCategoriesModalProps {
  open: boolean
  onClose: () => void
}

export function ManageCategoriesModal({ open, onClose }: ManageCategoriesModalProps) {
  const { data: categories = [] } = useExpenseCategories()
  const createCategory = useCreateExpenseCategory()
  const deleteCategory = useDeleteExpenseCategory()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color] = useState('indigo')

  if (!open) return null

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createCategory.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: 'Tag',
        color,
      },
      {
        onSuccess: () => {
          setName('')
          setDescription('')
        },
      }
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Tag size={16} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 text-sm">Expense Categories</h2>
              <p className="text-[11px] text-zinc-500">Manage standard & custom expense categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Add New Category Form */}
          <form onSubmit={handleAdd} className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/70 space-y-2.5">
            <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-600" />
              Create Custom Category
            </p>
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sports Equipment, Examination Center..."
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description (optional)..."
                className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={createCategory.isPending || !name.trim()}
              className="w-full py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Add Category
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Available Categories ({categories.length})
            </p>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-50/70 transition-colors text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <p className="font-semibold text-zinc-900 truncate">{cat.name}</p>
                    {cat.is_custom && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                        Custom
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate pl-3.5">
                      {cat.description}
                    </p>
                  )}
                </div>

                {cat.is_custom && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"?`)) {
                        deleteCategory.mutate(cat.id)
                      }
                    }}
                    title="Delete Category"
                    className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
