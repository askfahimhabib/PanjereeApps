import React from 'react'
import type { CertificateData } from '../types'
import { CERTIFICATE_TYPES, CERTIFICATE_THEMES } from '../types'
import { ShieldCheck, Award } from 'lucide-react'

interface Props {
  data: CertificateData
}

export const CertificatePreview: React.FC<Props> = ({ data }) => {
  const typeConfig = CERTIFICATE_TYPES.find(t => t.type === data.certificateType) || CERTIFICATE_TYPES[0]
  const themeConfig = CERTIFICATE_THEMES.find(t => t.theme === data.theme) || CERTIFICATE_THEMES[0]

  return (
    <div className="w-full aspect-[1.414/1] bg-white rounded-lg shadow-2xl relative select-none overflow-hidden text-slate-800 border border-slate-200 flex flex-col justify-between p-6 md:p-8">
      {/* Outer Border with theme color */}
      <div
        className="absolute inset-2 md:inset-3 border-2 md:border-4 rounded-sm pointer-events-none transition-colors duration-300"
        style={{ borderColor: themeConfig.borderColor }}
      />
      {/* Inner Dashed Border */}
      <div
        className="absolute inset-3.5 md:inset-5 border border-dashed rounded-sm pointer-events-none transition-colors duration-300 opacity-60"
        style={{ borderColor: themeConfig.accentColor }}
      />

      {/* Corner Embellishments */}
      <div
        className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 pointer-events-none"
        style={{ borderColor: themeConfig.borderColor }}
      />
      <div
        className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 pointer-events-none"
        style={{ borderColor: themeConfig.borderColor }}
      />
      <div
        className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 pointer-events-none"
        style={{ borderColor: themeConfig.borderColor }}
      />
      <div
        className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 pointer-events-none"
        style={{ borderColor: themeConfig.borderColor }}
      />

      {/* Watermark Crest Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Award className="w-72 h-72 text-slate-900" />
      </div>

      {/* ── 1. HEADER ── */}
      <div className="relative z-10 text-center space-y-0.5 mt-1">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" style={{ color: themeConfig.borderColor }} />
        </div>
        <h1
          className="text-base md:text-xl font-extrabold uppercase tracking-widest font-serif leading-tight transition-colors duration-300"
          style={{ color: themeConfig.primaryColor }}
        >
          {data.institutionName || 'PANJEREE MODEL ACADEMY'}
        </h1>
        <p
          className="text-[9px] md:text-xs font-semibold tracking-wider uppercase"
          style={{ color: themeConfig.secondaryColor }}
        >
          {data.institutionTagline || 'Excellence in Education'}
        </p>
        <p className="text-[8px] md:text-[10px] text-slate-500">
          {data.institutionAddress || 'Dhaka, Bangladesh'}
        </p>
      </div>

      {/* ── 2. TITLE BANNER ── */}
      <div className="relative z-10 text-center my-1">
        <div
          className="inline-block px-4 md:px-8 py-0.5 md:py-1 border-y-2 border-double"
          style={{ borderColor: themeConfig.borderColor }}
        >
          <span
            className="text-xs md:text-sm lg:text-base font-bold tracking-[0.2em] font-serif uppercase"
            style={{ color: themeConfig.primaryColor }}
          >
            {typeConfig.title}
          </span>
        </div>
        <p className="text-[9px] md:text-[11px] text-slate-500 italic mt-0.5">
          {typeConfig.subtitle}
        </p>
      </div>

      {/* ── 3. STUDENT RECIPIENT ── */}
      <div className="relative z-10 text-center my-0.5">
        <p className="text-[10px] md:text-xs italic text-slate-600">This is proudly presented to</p>
        <div className="inline-block mt-0.5 border-b-2 pb-0.5 px-6" style={{ borderColor: themeConfig.borderColor }}>
          <h2
            className="text-sm md:text-lg lg:text-xl font-bold font-serif tracking-wide"
            style={{ color: themeConfig.primaryColor }}
          >
            {data.studentNameEn || 'Student Name'}
          </h2>
        </div>
        {data.showBengali && data.studentNameBn && (
          <p className="text-[10px] md:text-xs font-medium text-slate-700 mt-0.5">
            {data.studentNameBn}
          </p>
        )}
      </div>

      {/* ── 4. NARRATIVE BODY ── */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto my-1">
        <p className="text-[10px] md:text-[12px] leading-relaxed text-slate-700">
          {data.certificateType === 'TESTIMONIAL' ? (
            <>
              son/daughter of <strong className="font-semibold text-slate-900">{data.fatherName || '—'}</strong> &{' '}
              <strong className="font-semibold text-slate-900">{data.motherName || '—'}</strong>, Student ID:{' '}
              <strong className="font-semibold text-slate-900">{data.studentIdCode || '—'}</strong>, has been a bonafide student of{' '}
              <strong className="font-semibold text-slate-900">{data.classOrBatch || '—'}</strong>
              {data.group ? ` (${data.group} Group)` : ''} during the academic session{' '}
              <strong className="font-semibold text-slate-900">{data.session || '—'}</strong>. During their tenure, their moral character and conduct have been{' '}
              <strong className="font-semibold" style={{ color: themeConfig.secondaryColor }}>{data.conduct || 'Exemplary'}</strong>.
            </>
          ) : data.certificateType === 'TRANSFER' ? (
            <>
              son/daughter of <strong className="font-semibold text-slate-900">{data.fatherName || '—'}</strong> &{' '}
              <strong className="font-semibold text-slate-900">{data.motherName || '—'}</strong>, Student ID:{' '}
              <strong className="font-semibold text-slate-900">{data.studentIdCode || '—'}</strong>, was a student in{' '}
              <strong className="font-semibold text-slate-900">{data.classOrBatch || '—'}</strong> during session{' '}
              <strong className="font-semibold text-slate-900">{data.session || '—'}</strong>. All institutional fees and dues are cleared up to date.
            </>
          ) : data.certificateType === 'MERIT' ? (
            <>
              son/daughter of <strong className="font-semibold text-slate-900">{data.fatherName || '—'}</strong> &{' '}
              <strong className="font-semibold text-slate-900">{data.motherName || '—'}</strong>, Student ID:{' '}
              <strong className="font-semibold text-slate-900">{data.studentIdCode || '—'}</strong>, has demonstrated extraordinary academic brilliance securing{' '}
              <strong className="font-semibold" style={{ color: themeConfig.secondaryColor }}>{data.gpa || 'GPA 5.00'}</strong> in{' '}
              <strong className="font-semibold text-slate-900">{data.classOrBatch || '—'}</strong> during session{' '}
              <strong className="font-semibold text-slate-900">{data.session || '—'}</strong>.
            </>
          ) : (
            <>
              son/daughter of <strong className="font-semibold text-slate-900">{data.fatherName || '—'}</strong> and{' '}
              <strong className="font-semibold text-slate-900">{data.motherName || '—'}</strong>, Student ID:{' '}
              <strong className="font-semibold text-slate-900">{data.studentIdCode || '—'}</strong>, has successfully fulfilled all academic requirements for completion of{' '}
              <strong className="font-semibold text-slate-900">{data.classOrBatch || '—'}</strong>
              {data.group ? ` (${data.group} Group)` : ''} in the academic session{' '}
              <strong className="font-semibold text-slate-900">{data.session || '—'}</strong>.
            </>
          )}
        </p>

        {data.customRemarks && (
          <p className="text-[9px] md:text-[11px] italic text-slate-500 mt-1">
            "{data.customRemarks}"
          </p>
        )}
      </div>

      {/* ── 5. CREDENTIALS STRIP ── */}
      <div className="relative z-10 flex items-center justify-center gap-4 text-[8px] md:text-[10px] text-slate-500 font-sans font-medium">
        <span>No: <strong className="text-slate-800">{data.certificateNo || 'PCC-2024-001'}</strong></span>
        <span>•</span>
        <span>Roll: <strong className="text-slate-800">{data.rollNumber || '01'}</strong></span>
        <span>•</span>
        <span>Result: <strong className="text-slate-800 font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">{data.gpa || 'GPA 5.00'}</strong></span>
        <span>•</span>
        <span>Date: <strong className="text-slate-800">{data.issueDate || '—'}</strong></span>
      </div>

      {/* ── 6. SIGNATURES & MEDALLION SEAL ── */}
      <div className="relative z-10 flex items-end justify-between px-4 pt-2 border-t border-slate-100">
        {/* Left Signature */}
        <div className="text-center w-28 md:w-36">
          <div className="h-6 flex items-end justify-center mb-0.5">
            <span className="font-serif italic text-xs md:text-sm text-slate-600 font-medium">
              {data.teacherName}
            </span>
          </div>
          <div className="w-full h-px bg-slate-300 mb-1" />
          <p className="text-[9px] md:text-[11px] font-bold font-serif text-slate-800">{data.teacherName || 'Class Teacher'}</p>
          <p className="text-[7px] md:text-[9px] text-slate-500">{data.teacherTitle || 'Academic In-charge'}</p>
        </div>

        {/* Center Medallion Seal */}
        <div className="relative flex flex-col items-center justify-center -mb-2">
          {/* Ribbons */}
          <div
            className="absolute -top-1 -left-2 w-3.5 h-6 opacity-90 transform -rotate-12"
            style={{ backgroundColor: themeConfig.secondaryColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
          />
          <div
            className="absolute -top-1 -right-2 w-3.5 h-6 opacity-90 transform rotate-12"
            style={{ backgroundColor: themeConfig.secondaryColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
          />
          {/* Circular Gold Seal */}
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-dashed border-white shadow-md flex flex-col items-center justify-center text-white relative z-10"
            style={{ background: themeConfig.badgeBg }}
          >
            <span className="text-[8px] text-amber-200">★</span>
            <span className="text-[5px] font-bold tracking-widest uppercase">SEAL OF</span>
            <span className="text-[7px] font-extrabold tracking-wider uppercase">MERIT</span>
          </div>
        </div>

        {/* Right Signature */}
        <div className="text-center w-28 md:w-36">
          <div className="h-6 flex items-end justify-center mb-0.5">
            <span className="font-serif italic text-xs md:text-sm text-blue-900 font-bold">
              {data.principalName}
            </span>
          </div>
          <div className="w-full h-px bg-slate-300 mb-1" />
          <p className="text-[9px] md:text-[11px] font-bold font-serif text-slate-800">{data.principalName || 'Principal'}</p>
          <p className="text-[7px] md:text-[9px] text-slate-500">{data.principalTitle || 'Head of Institution'}</p>
        </div>
      </div>
    </div>
  )
}
