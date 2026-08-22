import { useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { useProfileStore } from '../../../store/profile'

export function AvatarUpload() {
  const { fullName, avatarUrl, updateProfile } = useProfileStore()
  const [dragging, setDragging] = useState(false)

  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      updateProfile({ avatarUrl: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div className="flex items-center gap-6">
      {/* Avatar preview */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <label
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all"
          title="Upload photo"
        >
          <Camera size={13} className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </label>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
        }`}
      >
        <Upload size={18} className="mx-auto mb-2 text-slate-500" />
        <p className="text-sm text-slate-400">Drag & drop or <label className="text-indigo-400 cursor-pointer hover:underline">
          browse
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }} />
        </label></p>
        <p className="text-[11px] text-slate-600 mt-1">PNG, JPG up to 5MB</p>
      </div>

      {avatarUrl && (
        <button
          onClick={() => updateProfile({ avatarUrl: '' })}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  )
}
