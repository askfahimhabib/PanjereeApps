import { MessageSquare, Mail, PhoneCall } from 'lucide-react'
import type { Student } from '../../types'

export function CommunicationTab({ student }: { student: Student }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Communication Logs</h4>
        <div className="flex gap-2">
          <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <MessageSquare size={12} /> SMS
          </button>
          <button className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Mail size={12} /> Email
          </button>
        </div>
      </div>

      <div className="relative border-l border-slate-700/50 ml-4 space-y-6 pb-4">
        {[
          { type: 'sms', date: '15 Mar 2024, 10:30 AM', title: 'Fee Reminder SMS', recipient: 'Father (01711-XXXXXX)', content: 'Dear Parent, tuition fee for March is due. Please pay by 20th Mar.' },
          { type: 'email', date: '01 Mar 2024, 08:00 AM', title: 'Monthly Progress Report', recipient: student.email || 'Student Email', content: 'Attached is the monthly progress report for February.' },
          { type: 'call', date: '25 Feb 2024, 02:15 PM', title: 'Absentee Call', recipient: 'Mother (01811-XXXXXX)', content: 'Called mother regarding 3 days continuous absence. Reason: Sickness.' },
        ].map((log, i) => (
          <div key={i} className="relative pl-6">
            <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center ${
              log.type === 'sms' ? 'bg-blue-500/20 text-blue-400' :
              log.type === 'email' ? 'bg-purple-500/20 text-purple-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {log.type === 'sms' && <MessageSquare size={10} />}
              {log.type === 'email' && <Mail size={10} />}
              {log.type === 'call' && <PhoneCall size={10} />}
            </div>
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-semibold text-slate-200">{log.title}</h5>
                <span className="text-[10px] text-slate-500">{log.date}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">To: {log.recipient}</p>
              <p className="text-xs text-slate-300 bg-slate-800/50 p-2 rounded-lg italic">
                "{log.content}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
