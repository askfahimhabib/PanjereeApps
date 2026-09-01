import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, School, QrCode, Phone, ShieldCheck, Award } from 'lucide-react'
import type { Teacher } from '../../types'
import { DESIGNATION_LABELS } from '../../types'

interface Props {
  open: boolean
  teacher: Teacher | null
  onClose: () => void
}

function getAvatarColor(id: string) {
  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-purple-600 to-violet-600',
    'from-slate-700 to-zinc-900',
  ]
  return colors[id.charCodeAt(id.length - 1) % colors.length]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function TeacherIdCardModal({ open, teacher, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !teacher) return null

  const deptName = teacher.department ? teacher.department.replace(/_/g, ' ') : (teacher.specialization || 'General')
  const phoneNo = teacher.phone || teacher.alternativePhone || 'N/A'

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      window.print()
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Teacher ID Card - ${teacher.fullName}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: auto; margin: 10mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { display: flex; gap: 20px; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
          .card { width: 320px; height: 490px; border-radius: 16px; border: 2px solid #0f172a; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #fff; }
          .front-header { background: linear-gradient(135deg, #1e3a8a, #0f172a); color: #fff; padding: 16px 12px; text-align: center; }
          .front-header h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .front-header p { font-size: 9px; opacity: 0.9; margin-top: 2px; }
          .avatar-box { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #1e3a8a; margin: 16px auto 10px auto; display: flex; align-items: center; justify-content: center; background: #f1f5f9; font-size: 26px; font-weight: 800; color: #1e3a8a; }
          .name { text-align: center; font-size: 15px; font-weight: 800; color: #0f172a; padding: 0 10px; }
          .desig-pill { text-align: center; font-size: 11px; font-weight: 700; color: #1e3a8a; background: #eff6ff; display: inline-block; padding: 3px 12px; border-radius: 9999px; margin: 6px auto 12px auto; }
          .meta-table { width: 85%; margin: 0 auto; font-size: 11px; border-collapse: collapse; }
          .meta-table td { padding: 4px 0; color: #334155; }
          .meta-table td.label { font-weight: 600; color: #64748b; width: 45%; }
          .meta-table td.val { font-weight: 700; color: #0f172a; font-family: monospace; font-size: 11.5px; }
          .footer-front { position: absolute; bottom: 0; left: 0; right: 0; background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 8px 12px; text-align: center; font-size: 9px; font-weight: 600; color: #64748b; }
          .back-header { background: #0f172a; color: #fff; padding: 12px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .back-body { padding: 16px; font-size: 10px; color: #334155; line-height: 1.5; }
          .sig-box { display: flex; justify-content: space-between; margin-top: 50px; font-size: 9px; text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; width: 90px; margin: 0 auto 3px auto; }
        </style>
      </head>
      <body>
        <!-- Front Side -->
        <div class="card">
          <div class="front-header">
            <h2>Estudy Model Academy</h2>
            <p>Faculty & Staff Identity Card</p>
          </div>
          <div class="avatar-box">
            ${getInitials(teacher.fullName)}
          </div>
          <div class="name">${teacher.fullName}</div>
          <div style="text-align: center;">
            <span class="desig-pill">${DESIGNATION_LABELS[teacher.designation] || 'Teacher'}</span>
          </div>
          <table class="meta-table">
            <tr><td class="label">Teacher ID:</td><td class="val">${teacher.teacherId}</td></tr>
            <tr><td class="label">Department:</td><td class="val">${deptName}</td></tr>
            <tr><td class="label">Blood Group:</td><td class="val">${teacher.bloodGroup || 'N/A'}</td></tr>
            <tr><td class="label">Joining Date:</td><td class="val">${teacher.joiningDate || '2023-01-01'}</td></tr>
            <tr><td class="label">Contact:</td><td class="val">${phoneNo}</td></tr>
          </table>
          <div class="footer-front">
            Official Faculty ID • Valid till 2027
          </div>
        </div>

        <!-- Back Side -->
        <div class="card">
          <div class="back-header">Faculty Identity Card</div>
          <div class="back-body">
            <p>• This official identification card remains the property of Estudy International Model Academy.</p>
            <p>• Unauthorized possession or duplicate reproduction is strictly prohibited by law.</p>
            <div style="margin-top: 14px; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p><strong>Campus Helpline:</strong> +880 1700-000000</p>
              <p><strong>Emergency Email:</strong> admin@estudy.edu.bd</p>
              <p><strong>Campus Address:</strong> Sector 4, Uttara, Dhaka</p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <div style="font-family: monospace; font-size: 14px; font-weight: 800; letter-spacing: 3px; background: #f1f5f9; padding: 6px; border-radius: 6px;">
                *${teacher.teacherId}*
              </div>
            </div>
            <div class="sig-box">
              <div>
                <div class="sig-line"></div>
                Cardholder Sign
              </div>
              <div>
                <div class="sig-line"></div>
                Chairman / Principal
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-indigo-50 via-zinc-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Faculty Identity Card</h3>
              <p className="text-[11px] text-zinc-500">Official staff identity badge & credential</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              <Printer size={14} /> Print Faculty ID Card
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Card Previews */}
        <div className="p-8 bg-zinc-100/60 overflow-y-auto max-h-[75vh]">
          <div className="flex flex-wrap gap-6 justify-center items-center">
            {/* Front Card Preview */}
            <div className="w-[280px] h-[430px] rounded-3xl bg-white shadow-xl border border-zinc-200/80 overflow-hidden relative flex flex-col justify-between">
              <div>
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-center text-white">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <School size={16} />
                    <h4 className="text-xs font-extrabold tracking-wide uppercase">Estudy Faculty</h4>
                  </div>
                  <p className="text-[9px] opacity-85">Uttara Model Town, Dhaka-1230</p>
                </div>

                <div className="p-4 text-center">
                  <div className={`w-20 h-20 rounded-full mx-auto bg-gradient-to-br ${getAvatarColor(teacher.id)} flex items-center justify-center text-white text-2xl font-black shadow-md border-4 border-white -mt-2`}>
                    {getInitials(teacher.fullName)}
                  </div>
                  <h3 className="font-extrabold text-zinc-900 text-sm mt-2.5 truncate px-2">{teacher.fullName}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {DESIGNATION_LABELS[teacher.designation]}
                  </span>

                  <div className="mt-3.5 space-y-1.5 text-left bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Teacher ID:</span>
                      <span className="font-mono font-bold text-zinc-800">{teacher.teacherId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Department:</span>
                      <span className="font-bold text-zinc-700">{deptName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Blood Group:</span>
                      <span className="font-bold text-rose-600">{teacher.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Phone:</span>
                      <span className="font-mono text-zinc-700">{phoneNo}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 border-t border-zinc-100 p-2 text-center text-[9px] font-semibold text-zinc-500">
                Official Faculty ID • Valid till 2027
              </div>
            </div>

            {/* Back Card Preview */}
            <div className="w-[280px] h-[430px] rounded-3xl bg-white shadow-xl border border-zinc-200/80 overflow-hidden relative flex flex-col justify-between">
              <div>
                <div className="bg-zinc-900 p-3.5 text-center text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-400" /> Faculty Credential
                </div>

                <div className="p-4 space-y-3 text-[10px] text-zinc-600 leading-relaxed">
                  <p>• This identification card is strictly for institutional usage and campus access.</p>
                  <p>• If misplaced, please return to administrative desk immediately.</p>

                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 space-y-1">
                    <p className="font-bold text-zinc-800">Campus Contact:</p>
                    <p className="flex items-center gap-1 text-zinc-600">
                      <Phone size={11} className="text-indigo-600" /> +880 1700-000000
                    </p>
                    <p className="text-[9px] text-zinc-500 truncate">Uttara Sector 4, Dhaka-1230</p>
                  </div>

                  <div className="text-center pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 font-mono text-xs font-bold text-zinc-800">
                      <QrCode size={14} /> {teacher.teacherId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-zinc-100 flex justify-between items-center text-[9px] text-zinc-500 text-center">
                <div>
                  <div className="w-16 border-t border-zinc-300 mx-auto mb-0.5" />
                  Cardholder Sign
                </div>
                <div>
                  <div className="w-16 border-t border-zinc-300 mx-auto mb-0.5" />
                  Principal Sign
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
