import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, School, QrCode, Phone, ShieldCheck, Sparkles } from 'lucide-react'
import type { Student } from '../../types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface Props {
  open: boolean
  student: Student | null
  onClose: () => void
}

function getAvatarColor(id: string) {
  const colors = [
    'from-emerald-600 to-teal-500',
    'from-indigo-600 to-blue-500',
    'from-purple-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-cyan-600 to-blue-600',
  ]
  return colors[id.charCodeAt(id.length - 1) % colors.length]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function StudentIdCardModal({ open, student, onClose }: Props) {
  const inst = getInstitutionInfo()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !student) return null

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
        <title>Student ID Card - ${student.fullNameEn}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: auto; margin: 10mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { display: flex; gap: 20px; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
          .card { width: 320px; height: 490px; border-radius: 16px; border: 2px solid #0f172a; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #fff; }
          .front-header { background: linear-gradient(135deg, #047857, #0f766e); color: #fff; padding: 16px 12px; text-align: center; }
          .front-header h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .front-header p { font-size: 9px; opacity: 0.9; margin-top: 2px; }
          .avatar-box { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #047857; margin: 16px auto 10px auto; display: flex; align-items: center; justify-content: center; background: #f1f5f9; font-size: 26px; font-weight: 800; color: #047857; }
          .name { text-align: center; font-size: 15px; font-weight: 800; color: #0f172a; padding: 0 10px; }
          .class-pill { text-align: center; font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; display: inline-block; padding: 3px 12px; border-radius: 9999px; margin: 6px auto 12px auto; }
          .meta-table { width: 85%; margin: 0 auto; font-size: 11px; border-collapse: collapse; }
          .meta-table td { padding: 4px 0; color: #334155; }
          .meta-table td.label { font-weight: 600; color: #64748b; width: 45%; }
          .meta-table td.val { font-weight: 700; color: #0f172a; font-family: monospace; font-size: 11.5px; }
          .footer-front { position: absolute; bottom: 0; left: 0; right: 0; background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 8px 12px; text-align: center; font-size: 9px; font-weight: 600; color: #64748b; }
          .back-header { background: #0f172a; color: #fff; padding: 12px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .back-body { padding: 16px; font-size: 10px; color: #334155; line-height: 1.5; }
          .back-rules { list-style: disc; padding-left: 16px; margin: 10px 0; font-size: 9.5px; }
          .barcode-box { text-align: center; margin-top: 20px; }
          .sig-box { display: flex; justify-content: space-between; margin-top: 30px; font-size: 9px; text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; width: 90px; margin: 0 auto 3px auto; }
        </style>
      </head>
      <body>
        <!-- Front Side -->
        <div class="card">
          <div class="front-header">
            <h2>${inst.name}</h2>
            <p>${inst.address} • EIIN: ${inst.eiin}</p>
          </div>
          <div class="avatar-box">
            ${getInitials(student.fullNameEn)}
          </div>
          <div class="name">${student.fullNameEn}</div>
          <div style="text-align: center;">
            <span class="class-pill">${student.className || 'Class'} • Sec ${student.sectionName || 'A'}</span>
          </div>
          <table class="meta-table">
            <tr>
              <td class="label">Student ID:</td>
              <td class="val">${student.studentId}</td>
            </tr>
            <tr>
              <td class="label">Roll Number:</td>
              <td class="val">${student.rollNumber}</td>
            </tr>
            <tr>
              <td class="label">Blood Group:</td>
              <td class="val" style="color: #e11d48">${student.bloodGroup || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Emergency:</td>
              <td class="val">${student.mobile || student.father?.mobile || inst.phone}</td>
            </tr>
          </table>
          <div class="footer-front">
            Session: ${student.session || inst.session} • Valid Card
          </div>
        </div>

        <!-- Back Side -->
        <div class="card">
          <div class="back-header">Terms & Instructions</div>
          <div class="back-body">
            <p>1. This card is non-transferable and must be carried at all times on campus premises.</p>
            <p>2. If found, please return to the school administration office or contact the phone below.</p>
            <div style="margin-top: 14px; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p><strong>Guardian:</strong> ${student.father?.name || student.mother?.name || 'Guardian'}</p>
              <p><strong>Address:</strong> ${student.presentAddress || 'Dhaka, Bangladesh'}</p>
              <p><strong>Helpline:</strong> ${inst.phone}</p>
            </div>
            <div class="barcode-box">
              <div style="font-family: monospace; font-size: 14px; font-weight: 800; letter-spacing: 3px; background: #f1f5f9; padding: 6px; border-radius: 6px;">
                *${student.studentId}*
              </div>
            </div>
            <div class="sig-box" style="margin-top: 45px;">
              <div>
                <div class="sig-line"></div>
                Student Sign
              </div>
              <div>
                <div class="sig-line"></div>
                ${inst.principalDesignation}
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 via-zinc-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Official Student ID Card</h3>
              <p className="text-[11px] text-zinc-500">High-resolution print-ready student identity card</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              <Printer size={14} /> Print ID Card (Front & Back)
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
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 text-center text-white">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <School size={16} />
                    <h4 className="text-xs font-extrabold tracking-wide uppercase">{inst.name}</h4>
                  </div>
                  <p className="text-[9px] opacity-85">{inst.address}</p>
                </div>

                <div className="p-4 text-center">
                  <div className={`w-20 h-20 rounded-full mx-auto bg-gradient-to-br ${getAvatarColor(student.id)} flex items-center justify-center text-white text-2xl font-black shadow-md border-4 border-white -mt-2`}>
                    {getInitials(student.fullNameEn)}
                  </div>
                  <h3 className="font-extrabold text-zinc-900 text-sm mt-2.5 truncate px-2">{student.fullNameEn}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {student.className} • Section {student.sectionName || 'A'}
                  </span>

                  <div className="mt-3.5 space-y-1.5 text-left bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Student ID:</span>
                      <span className="font-mono font-bold text-zinc-800">{student.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Roll No:</span>
                      <span className="font-mono font-bold text-zinc-800">{student.rollNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Blood Group:</span>
                      <span className="font-bold text-rose-600">{student.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Emergency:</span>
                      <span className="font-mono text-zinc-700">{student.mobile || student.father?.mobile || inst.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 border-t border-zinc-100 p-2 text-center text-[9px] font-semibold text-zinc-500">
                Session: {student.session || inst.session} • EIIN: {inst.eiin}
              </div>
            </div>

            {/* Back Card Preview */}
            <div className="w-[280px] h-[430px] rounded-3xl bg-white shadow-xl border border-zinc-200/80 overflow-hidden relative flex flex-col justify-between">
              <div>
                <div className="bg-zinc-900 p-3.5 text-center text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" /> Terms of Usage
                </div>

                <div className="p-4 space-y-3 text-[10px] text-zinc-600 leading-relaxed">
                  <p>• This identity card is institutional property and mandatory for campus entry & exams.</p>
                  <p>• In case of emergency or loss, please return to school office or call helpline.</p>

                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 space-y-1">
                    <p className="font-bold text-zinc-800">Guardian Contact:</p>
                    <p className="flex items-center gap-1 text-zinc-600">
                      <Phone size={11} className="text-emerald-600" /> {student.father?.mobile || student.mobile || 'N/A'}
                    </p>
                    <p className="text-[9px] text-zinc-500 truncate">{student.presentAddress || 'Dhaka, Bangladesh'}</p>
                  </div>

                  <div className="text-center pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 font-mono text-xs font-bold text-zinc-800">
                      <QrCode size={14} /> {student.studentId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-zinc-100 flex justify-between items-center text-[9px] text-zinc-500 text-center">
                <div>
                  <div className="w-16 border-t border-zinc-300 mx-auto mb-0.5" />
                  Student Sign
                </div>
                <div>
                  <div className="w-16 border-t border-zinc-300 mx-auto mb-0.5" />
                  {inst.principalDesignation}
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
