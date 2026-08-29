import type { CertificateData } from '../types'
import { CERTIFICATE_TYPES, CERTIFICATE_THEMES } from '../types'

/**
 * Opens a print-optimized window rendering a high-resolution,
 * authentic academic certificate ready for printing or saving as PDF.
 */
export function printCertificate(data: CertificateData): void {
  const typeConfig = CERTIFICATE_TYPES.find(t => t.type === data.certificateType) || CERTIFICATE_TYPES[0]
  const themeConfig = CERTIFICATE_THEMES.find(t => t.theme === data.theme) || CERTIFICATE_THEMES[0]

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.studentNameEn} - ${typeConfig.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      width: 297mm;
      height: 210mm;
      margin: 0 auto;
      background: #fdfbf7;
      font-family: 'Cormorant Garamond', 'Georgia', serif;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* Master Frame Container */
    .certificate-page {
      width: 287mm;
      height: 200mm;
      background: #ffffff;
      position: relative;
      padding: 10mm;
      border: 2px solid ${themeConfig.secondaryColor};
      box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.03);
    }

    /* Outer Ornamental Guilloche Frame */
    .outer-border {
      position: absolute;
      inset: 4mm;
      border: 4px solid ${themeConfig.borderColor};
      outline: 1px dashed ${themeConfig.accentColor};
      outline-offset: -5px;
      pointer-events: none;
    }

    .inner-border {
      position: absolute;
      inset: 8mm;
      border: 1px solid ${themeConfig.borderColor};
      pointer-events: none;
    }

    /* Corner Embellishments (SVG) */
    .corner-decor {
      position: absolute;
      width: 32mm;
      height: 32mm;
      color: ${themeConfig.borderColor};
      pointer-events: none;
    }
    .corner-tl { top: 3.5mm; left: 3.5mm; }
    .corner-tr { top: 3.5mm; right: 3.5mm; transform: scaleX(-1); }
    .corner-bl { bottom: 3.5mm; left: 3.5mm; transform: scaleY(-1); }
    .corner-br { bottom: 3.5mm; right: 3.5mm; transform: scale(-1); }

    /* Watermark Background */
    .watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.035;
      pointer-events: none;
      z-index: 1;
    }
    .watermark svg {
      width: 140mm;
      height: 140mm;
    }

    /* Main Content Layer */
    .content-layer {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 4mm 12mm;
    }

    /* Header Section */
    .cert-header {
      margin-bottom: 2mm;
    }
    .crest-icon {
      width: 16mm;
      height: 16mm;
      margin: 0 auto 1.5mm;
      color: ${themeConfig.borderColor};
    }
    .institution-name {
      font-family: 'Cinzel', serif;
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 2px;
      color: ${themeConfig.primaryColor};
      text-transform: uppercase;
      line-height: 1.1;
    }
    .institution-tagline {
      font-family: 'Montserrat', sans-serif;
      font-size: 7.5pt;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: ${themeConfig.secondaryColor};
      font-weight: 600;
      margin-top: 1mm;
    }
    .institution-address {
      font-family: 'Montserrat', sans-serif;
      font-size: 7pt;
      color: #64748b;
      margin-top: 0.5mm;
    }

    /* Title Ribbon */
    .title-banner {
      margin: 2mm auto 3mm;
      position: relative;
      display: inline-block;
    }
    .cert-title {
      font-family: 'Cinzel', serif;
      font-size: 16pt;
      font-weight: 800;
      letter-spacing: 3px;
      color: ${themeConfig.primaryColor};
      text-transform: uppercase;
      padding: 1.5mm 10mm;
      border-top: 2px double ${themeConfig.borderColor};
      border-bottom: 2px double ${themeConfig.borderColor};
      display: inline-block;
    }
    .cert-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 11pt;
      color: #475569;
      margin-top: 1mm;
    }

    /* Student Recipient Block */
    .presentation-line {
      font-size: 11.5pt;
      font-style: italic;
      color: #475569;
    }
    .student-name-container {
      margin: 2mm 0;
    }
    .student-name-en {
      font-family: 'Cinzel', serif;
      font-size: 20pt;
      font-weight: 800;
      color: ${themeConfig.primaryColor};
      letter-spacing: 1.5px;
      text-decoration: none;
      display: inline-block;
      border-bottom: 2px solid ${themeConfig.borderColor};
      padding: 0 8mm 1mm;
    }
    .student-name-bn {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 13pt;
      color: #334155;
      margin-top: 1mm;
      font-weight: 600;
    }

    /* Narrative Statement */
    .narrative-body {
      font-size: 12pt;
      line-height: 1.6;
      color: #1e293b;
      max-width: 220mm;
      margin: 0 auto;
    }
    .narrative-body strong {
      font-weight: 700;
      color: ${themeConfig.primaryColor};
    }
    .highlight-badge {
      font-family: 'Montserrat', sans-serif;
      font-size: 9.5pt;
      font-weight: 700;
      color: ${themeConfig.borderColor};
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid ${themeConfig.borderColor};
      padding: 0.5mm 2.5mm;
      border-radius: 2px;
    }

    /* Credentials & Metadata Row */
    .meta-box-row {
      display: flex;
      justify-content: center;
      gap: 8mm;
      margin: 2mm auto 0;
      font-family: 'Montserrat', sans-serif;
      font-size: 8pt;
      color: #475569;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .meta-label {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .meta-val {
      font-weight: 700;
      color: #0f172a;
    }

    /* Footer & Signatures Block */
    .cert-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 6mm 1mm;
      margin-top: 2mm;
    }
    .sign-block {
      text-align: center;
      width: 55mm;
    }
    .sign-line {
      width: 100%;
      height: 1px;
      background: #94a3b8;
      margin-bottom: 1.5mm;
    }
    .sign-title {
      font-family: 'Cinzel', serif;
      font-size: 9pt;
      font-weight: 700;
      color: ${themeConfig.primaryColor};
      letter-spacing: 0.5px;
    }
    .sign-sub {
      font-family: 'Montserrat', sans-serif;
      font-size: 7pt;
      color: #64748b;
    }

    /* Golden Medallion Foil Seal (Center) */
    .seal-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .gold-seal {
      width: 25mm;
      height: 25mm;
      border-radius: 50%;
      background: ${themeConfig.badgeBg};
      border: 2px dashed #ffffff;
      box-shadow: 0 0 0 3px ${themeConfig.borderColor}, 0 4px 10px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      text-align: center;
      position: relative;
      z-index: 3;
    }
    .seal-star {
      font-size: 10pt;
      color: #fef08a;
    }
    .seal-text-top {
      font-family: 'Cinzel', serif;
      font-size: 5pt;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .seal-text-mid {
      font-family: 'Cinzel', serif;
      font-size: 6.5pt;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .ribbon-left, .ribbon-right {
      position: absolute;
      top: 18mm;
      width: 7mm;
      height: 12mm;
      background: ${themeConfig.secondaryColor};
      z-index: 2;
    }
    .ribbon-left {
      left: 6mm;
      transform: rotate(20deg);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
    }
    .ribbon-right {
      right: 6mm;
      transform: rotate(-20deg);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
    }

    /* Print media rule */
    @media print {
      body {
        background: none;
        width: 100%;
        height: 100%;
      }
      .certificate-page {
        width: 100vw;
        height: 100vh;
        border: none;
      }
    }
  </style>
</head>
<body>

<div class="certificate-page">
  <!-- Outer Guilloche Frames -->
  <div class="outer-border"></div>
  <div class="inner-border"></div>

  <!-- Corner Flourish SVG Embellishments -->
  <svg class="corner-decor corner-tl" viewBox="0 0 100 100" fill="currentColor">
    <path d="M0,0 L100,0 C75,0 55,20 55,45 C55,55 45,55 45,55 C45,55 45,45 35,45 C15,45 0,25 0,0 Z M8,8 L8,32 C18,32 30,22 30,8 L8,8 Z M8,45 L8,75 C25,75 45,55 45,35 L45,8 C45,8 35,20 20,20 C8,20 8,35 8,45 Z" />
    <circle cx="20" cy="20" r="4" fill="currentColor"/>
  </svg>
  <svg class="corner-decor corner-tr" viewBox="0 0 100 100" fill="currentColor">
    <path d="M0,0 L100,0 C75,0 55,20 55,45 C55,55 45,55 45,55 C45,55 45,45 35,45 C15,45 0,25 0,0 Z M8,8 L8,32 C18,32 30,22 30,8 L8,8 Z M8,45 L8,75 C25,75 45,55 45,35 L45,8 C45,8 35,20 20,20 C8,20 8,35 8,45 Z" />
    <circle cx="20" cy="20" r="4" fill="currentColor"/>
  </svg>
  <svg class="corner-decor corner-bl" viewBox="0 0 100 100" fill="currentColor">
    <path d="M0,0 L100,0 C75,0 55,20 55,45 C55,55 45,55 45,55 C45,55 45,45 35,45 C15,45 0,25 0,0 Z M8,8 L8,32 C18,32 30,22 30,8 L8,8 Z M8,45 L8,75 C25,75 45,55 45,35 L45,8 C45,8 35,20 20,20 C8,20 8,35 8,45 Z" />
    <circle cx="20" cy="20" r="4" fill="currentColor"/>
  </svg>
  <svg class="corner-decor corner-br" viewBox="0 0 100 100" fill="currentColor">
    <path d="M0,0 L100,0 C75,0 55,20 55,45 C55,55 45,55 45,55 C45,55 45,45 35,45 C15,45 0,25 0,0 Z M8,8 L8,32 C18,32 30,22 30,8 L8,8 Z M8,45 L8,75 C25,75 45,55 45,35 L45,8 C45,8 35,20 20,20 C8,20 8,35 8,45 Z" />
    <circle cx="20" cy="20" r="4" fill="currentColor"/>
  </svg>

  <!-- Background Crest Watermark -->
  <div class="watermark">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
      <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
      <path d="M12 7l4 3-4 7-4-7 4-3z"/>
    </svg>
  </div>

  <!-- Certificate Content Layer -->
  <div class="content-layer">

    <!-- 1. Header -->
    <div class="cert-header">
      <svg class="crest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
        <path d="M8 11l3 3 5-5"/>
      </svg>
      <h1 class="institution-name">${data.institutionName}</h1>
      <p class="institution-tagline">${data.institutionTagline}</p>
      <p class="institution-address">${data.institutionAddress}</p>
    </div>

    <!-- 2. Certificate Title Banner -->
    <div class="title-banner">
      <div class="cert-title">${typeConfig.title}</div>
      <p class="cert-subtitle">${typeConfig.subtitle}</p>
    </div>

    <!-- 3. Presentation Line & Student Name -->
    <div>
      <p class="presentation-line">This is proudly certified that</p>
      <div class="student-name-container">
        <h2 class="student-name-en">${data.studentNameEn}</h2>
        ${data.showBengali && data.studentNameBn ? `<p class="student-name-bn">${data.studentNameBn}</p>` : ''}
      </div>
    </div>

    <!-- 4. Narrative Body Statement -->
    <div class="narrative-body">
      ${
        data.certificateType === 'TESTIMONIAL'
          ? `son/daughter of <strong>${data.fatherName || '—'}</strong> & <strong>${data.motherName || '—'}</strong>, having Student ID <strong>${data.studentIdCode}</strong>, has been a bonafide student of <strong>${data.classOrBatch}</strong>${data.group ? ` (${data.group} Group)` : ''} during the academic session <strong>${data.session}</strong>. To the best of our knowledge and institutional records, they bear an <strong>${data.conduct || 'Exemplary'}</strong> moral character and demonstrated sincere diligence throughout.`
          : data.certificateType === 'TRANSFER'
          ? `son/daughter of <strong>${data.fatherName || '—'}</strong> & <strong>${data.motherName || '—'}</strong>, Student ID <strong>${data.studentIdCode}</strong>, was a student in <strong>${data.classOrBatch}</strong> during the session <strong>${data.session}</strong>. All institutional dues have been cleared up to date and they are granted this Transfer Certificate upon honorable request.`
          : data.certificateType === 'MERIT'
          ? `son/daughter of <strong>${data.fatherName || '—'}</strong> & <strong>${data.motherName || '—'}</strong>, Student ID <strong>${data.studentIdCode}</strong>, has exhibited exceptional academic distinction and earned <strong>${data.gpa || 'GPA 5.00'}</strong> in <strong>${data.classOrBatch}</strong> during session <strong>${data.session}</strong>. We commend their remarkable merit, perseverance, and high standard of performance.`
          : `son/daughter of <strong>${data.fatherName || '—'}</strong> and <strong>${data.motherName || '—'}</strong>, Student ID <strong>${data.studentIdCode}</strong>, Registration No <strong>${data.regNumber || '—'}</strong>, has successfully fulfilled all prescribed requirements for graduation from <strong>${data.classOrBatch}</strong>${data.group ? ` (${data.group} Group)` : ''} in the academic session <strong>${data.session}</strong> with distinction.`
      }
      ${data.customRemarks ? `<div style="margin-top: 1.5mm; font-style: italic; font-size: 11pt; color: #475569;">"${data.customRemarks}"</div>` : ''}
    </div>

    <!-- 5. Credentials Metadata Row -->
    <div class="meta-box-row">
      <div class="meta-item">
        <span class="meta-label">Certificate No:</span>
        <span class="meta-val">${data.certificateNo}</span>
      </div>
      <div class="meta-item">•</div>
      <div class="meta-item">
        <span class="meta-label">Roll No:</span>
        <span class="meta-val">${data.rollNumber || '01'}</span>
      </div>
      <div class="meta-item">•</div>
      <div class="meta-item">
        <span class="meta-label">Result:</span>
        <span class="meta-val highlight-badge">${data.gpa || 'GPA 5.00'}</span>
      </div>
      <div class="meta-item">•</div>
      <div class="meta-item">
        <span class="meta-label">Date of Issue:</span>
        <span class="meta-val">${data.issueDate}</span>
      </div>
    </div>

    <!-- 6. Footer, Seal & Signatures -->
    <div class="cert-footer">
      <!-- Left Signature: In-charge / Class Teacher -->
      <div class="sign-block">
        <div style="height: 10mm; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 1mm;">
          <span style="font-family: 'Cormorant Garamond', cursive; font-size: 14pt; color: #334155; font-style: italic;">${data.teacherName}</span>
        </div>
        <div class="sign-line"></div>
        <p class="sign-title">${data.teacherName}</p>
        <p class="sign-sub">${data.teacherTitle}</p>
      </div>

      <!-- Center Official Rosette Seal -->
      <div class="seal-container">
        <div class="ribbon-left"></div>
        <div class="ribbon-right"></div>
        <div class="gold-seal">
          <span class="seal-star">★</span>
          <span class="seal-text-top">OFFICIAL</span>
          <span class="seal-text-mid">SEAL</span>
          <span class="seal-text-top">EXCELLENCE</span>
        </div>
      </div>

      <!-- Right Signature: Principal -->
      <div class="sign-block">
        <div style="height: 10mm; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 1mm;">
          <span style="font-family: 'Cormorant Garamond', cursive; font-size: 15pt; color: #1e3a8a; font-style: italic; font-weight: bold;">${data.principalName}</span>
        </div>
        <div class="sign-line"></div>
        <p class="sign-title">${data.principalName}</p>
        <p class="sign-sub">${data.principalTitle}</p>
      </div>
    </div>

  </div>
</div>

<script>
  window.onload = function() {
    setTimeout(function() {
      window.print();
    }, 400);
  };
</script>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=1120,height=800,menubar=no,toolbar=no,location=no,status=no')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  } else {
    alert('Pop-up window was blocked. Please allow pop-ups for this site to print the certificate.')
  }
}
