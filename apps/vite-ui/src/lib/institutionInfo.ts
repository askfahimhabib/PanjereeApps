import { useSettingsStore } from '@/store/settings'

export interface InstitutionInfo {
  name: string
  nameBn: string
  eiin: string
  regNo: string
  board: string
  tagline: string
  establishedYear: string
  address: string
  phone: string
  email: string
  website: string
  principal: string
  principalDesignation: string
  examinerTitle: string
  currencySymbol: string
  session: string
  termsFooter: string
  merchantBkash: string
  merchantNagad: string
  bankDetails: string
  showPrincipalSign: boolean
  showWatermark: boolean
}

/**
 * Returns the current live institution configuration from SettingsStore.
 * Callable inside non-React functions (like print utilities) and event handlers.
 */
export function getInstitutionInfo(): InstitutionInfo {
  const s = useSettingsStore.getState()
  return {
    name: s.schoolName || 'Panjeree Model High School & College',
    nameBn: s.schoolNameBn || 'পাঞ্জেরী মডেল হাই স্কুল এন্ড কলেজ',
    eiin: s.eiinNumber || '108452',
    regNo: s.regNumber || 'REG-DH-2012/849',
    board: s.affiliationBoard || 'Dhaka Education Board',
    tagline: s.tagline || 'Excellence in Academic Discipline & Moral Values',
    establishedYear: s.establishedYear || '2005',
    address: s.address || 'Plot 14, Sector 7, Uttara Model Town, Dhaka-1230',
    phone: s.phone || '+880 1711-234567',
    email: s.email || 'info@panjereemodel.edu.bd',
    website: s.website || 'www.panjereemodel.edu.bd',
    principal: s.principalName || 'Professor Md. Rafiqul Islam',
    principalDesignation: s.principalDesignation || 'Principal & Head of Institution',
    examinerTitle: s.marksheetExaminerTitle || 'Controller of Examinations',
    currencySymbol: s.currencySymbol || '৳',
    session: s.currentSession || '2026',
    termsFooter: s.receiptTermsFooter || 'Fees once paid are non-refundable. Please preserve this receipt for academic clearance.',
    merchantBkash: s.merchantBkash || '01711-000000',
    merchantNagad: s.merchantNagad || '01811-000000',
    bankDetails: s.bankAccountDetails || 'Dutch-Bangla Bank Ltd | A/C: 115.120.98765 | Uttara Branch',
    showPrincipalSign: s.marksheetShowPrincipalSign !== false,
    showWatermark: s.showWatermarkOnDocs !== false,
  }
}
