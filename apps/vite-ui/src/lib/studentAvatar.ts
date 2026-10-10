// ============================================================
//  STUDENT STICKER AVATARS & PHOTO UPLOAD HELPER
//  ─────────────────────────────────────────────────────────────
//  Provides:
//  1. Built-in cute SVG sticker avatars (100% offline, zero network lag).
//  2. Deterministic sticker assignment by Student ID / Name.
//  3. Safe image upload processing (client-side resize to ~300px max
//     so base64 doesn't bloat localStorage).
//  4. Helpers to distinguish uploaded photos from default stickers.
// ============================================================

export interface StickerPreset {
  id: string
  name: string
  url: string
}

// ── Built-in SVG Sticker Avatars (Data URLs for 100% offline support) ──────────

function createSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`
}

export const STICKER_ROBOT_CYAN = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0284c7" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
  </defs>
  <!-- Sticker White Border Layer -->
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Antenna -->
  <rect x="57" y="24" width="6" height="12" rx="3" fill="#ffffff"/>
  <circle cx="60" cy="22" r="5" fill="#facc15"/>
  <!-- Robot Head -->
  <rect x="30" y="36" width="60" height="50" rx="16" fill="url(#face)" stroke="#ffffff" stroke-width="2"/>
  <!-- Ears / Headphones -->
  <rect x="23" y="48" width="8" height="24" rx="4" fill="#facc15"/>
  <rect x="89" y="48" width="8" height="24" rx="4" fill="#facc15"/>
  <!-- Eyes Screen -->
  <rect x="38" y="46" width="44" height="20" rx="10" fill="#0f172a"/>
  <circle cx="48" cy="56" r="4.5" fill="#38bdf8"/>
  <circle cx="72" cy="56" r="4.5" fill="#38bdf8"/>
  <circle cx="50" cy="54" r="1.5" fill="#ffffff"/>
  <circle cx="74" cy="54" r="1.5" fill="#ffffff"/>
  <!-- Rosy cheeks -->
  <circle cx="40" cy="74" r="3.5" fill="#f43f5e" opacity="0.6"/>
  <circle cx="80" cy="74" r="3.5" fill="#f43f5e" opacity="0.6"/>
  <!-- Smile -->
  <path d="M 52 72 Q 60 80 68 72" stroke="#0284c7" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
`)

export const STICKER_FOX_SMART = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#ea580c" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Fox Ears -->
  <polygon points="32,24 48,46 22,46" fill="#c2410c"/>
  <polygon points="32,28 44,44 26,44" fill="#fed7aa"/>
  <polygon points="88,24 98,46 72,46" fill="#c2410c"/>
  <polygon points="88,28 94,44 76,44" fill="#fed7aa"/>
  <!-- Fox Face -->
  <path d="M 28 50 C 28 80, 60 92, 60 92 C 60 92, 92 80, 92 50 C 92 36, 28 36, 28 50 Z" fill="#ffffff"/>
  <path d="M 32 48 C 32 70, 60 80, 60 80 C 60 80, 88 70, 88 48 C 88 38, 32 38, 32 48 Z" fill="#fb923c"/>
  <!-- White Snout -->
  <path d="M 44 64 C 44 78, 60 86, 60 86 C 60 86, 76 78, 76 64 C 76 56, 44 56, 44 64 Z" fill="#ffffff"/>
  <!-- Nose -->
  <ellipse cx="60" cy="74" rx="4" ry="3" fill="#1e293b"/>
  <!-- Glasses -->
  <circle cx="46" cy="54" r="9" fill="none" stroke="#0f172a" stroke-width="2.5"/>
  <circle cx="74" cy="54" r="9" fill="none" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="55" y1="54" x2="65" y2="54" stroke="#0f172a" stroke-width="2.5"/>
  <!-- Eyes behind glasses -->
  <circle cx="46" cy="54" r="3.5" fill="#0f172a"/>
  <circle cx="74" cy="54" r="3.5" fill="#0f172a"/>
  <circle cx="47" cy="52" r="1" fill="#ffffff"/>
  <circle cx="75" cy="52" r="1" fill="#ffffff"/>
  <!-- Smile -->
  <path d="M 56 80 Q 60 83 64 80" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>
`)

export const STICKER_PANDA_CHILL = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#059669" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Panda Ears -->
  <circle cx="34" cy="38" r="12" fill="#1e293b"/>
  <circle cx="86" cy="38" r="12" fill="#1e293b"/>
  <!-- Head -->
  <ellipse cx="60" cy="62" rx="36" ry="30" fill="#ffffff"/>
  <!-- Eye Patches -->
  <ellipse cx="45" cy="58" rx="10" ry="12" fill="#1e293b" transform="rotate(-15 45 58)"/>
  <ellipse cx="75" cy="58" rx="10" ry="12" fill="#1e293b" transform="rotate(15 75 58)"/>
  <!-- Eyes -->
  <circle cx="46" cy="58" r="4" fill="#ffffff"/>
  <circle cx="74" cy="58" r="4" fill="#ffffff"/>
  <circle cx="47" cy="58" r="2" fill="#0f172a"/>
  <circle cx="73" cy="58" r="2" fill="#0f172a"/>
  <!-- Nose & Smile -->
  <ellipse cx="60" cy="69" rx="5" ry="3.5" fill="#1e293b"/>
  <path d="M 55 74 Q 60 78 65 74" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- Bamboo Leaf -->
  <path d="M 30 76 Q 38 68 46 72 Q 38 78 30 76 Z" fill="#22c55e"/>
</svg>
`)

export const STICKER_OWL_SCHOLAR = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#7c3aed" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c4b5fd"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Owl Body/Head -->
  <ellipse cx="60" cy="64" rx="34" ry="28" fill="#ffffff"/>
  <!-- Owl Ears -->
  <polygon points="36,36 46,48 30,48" fill="#5b21b6"/>
  <polygon points="84,36 90,48 74,48" fill="#5b21b6"/>
  <!-- Big Eyes -->
  <circle cx="46" cy="60" r="13" fill="#fdf4ff" stroke="#7c3aed" stroke-width="2"/>
  <circle cx="74" cy="60" r="13" fill="#fdf4ff" stroke="#7c3aed" stroke-width="2"/>
  <circle cx="47" cy="60" r="6" fill="#1e1b4b"/>
  <circle cx="73" cy="60" r="6" fill="#1e1b4b"/>
  <circle cx="49" cy="58" r="2" fill="#ffffff"/>
  <circle cx="75" cy="58" r="2" fill="#ffffff"/>
  <!-- Beak -->
  <polygon points="60,65 56,73 64,73" fill="#f59e0b"/>
  <!-- Graduation Cap -->
  <polygon points="60,26 86,34 60,42 34,34" fill="#1e1b4b"/>
  <rect x="48" y="38" width="24" height="6" fill="#312e81" rx="2"/>
  <line x1="78" y1="36" x2="84" y2="48" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="84" cy="49" r="2" fill="#f59e0b"/>
</svg>
`)

export const STICKER_CAT_COSMO = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#ec4899" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Cat Ears -->
  <polygon points="34,26 48,46 24,46" fill="#fdf2f8"/>
  <polygon points="34,30 44,44 28,44" fill="#f43f5e"/>
  <polygon points="86,26 96,46 72,46" fill="#fdf2f8"/>
  <polygon points="86,30 92,44 76,44" fill="#f43f5e"/>
  <!-- Cat Face -->
  <circle cx="60" cy="62" r="32" fill="#ffffff"/>
  <!-- Star Cheeks -->
  <circle cx="40" cy="68" r="4" fill="#fb7185" opacity="0.6"/>
  <circle cx="80" cy="68" r="4" fill="#fb7185" opacity="0.6"/>
  <!-- Winking Eyes -->
  <path d="M 40 56 Q 46 50 52 56" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
  <circle cx="72" cy="54" r="4.5" fill="#1e293b"/>
  <circle cx="74" cy="52" r="1.5" fill="#ffffff"/>
  <!-- Nose & Mouth -->
  <polygon points="60,63 57,67 63,67" fill="#f43f5e"/>
  <path d="M 54 70 Q 60 74 66 70" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Whiskers -->
  <line x1="28" y1="62" x2="38" y2="64" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="28" y1="68" x2="38" y2="68" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="92" y1="62" x2="82" y2="64" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="92" y1="68" x2="82" y2="68" stroke="#cbd5e1" stroke-width="2"/>
</svg>
`)

export const STICKER_BOT_EMERALD = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#059669" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Antenna with Sparkle -->
  <line x1="60" y1="20" x2="60" y2="34" stroke="#ffffff" stroke-width="3"/>
  <polygon points="60,16 63,22 69,22 64,26 66,32 60,28 54,32 56,26 51,22 57,22" fill="#facc15"/>
  <!-- Screen Head -->
  <rect x="28" y="34" width="64" height="54" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="36" y="44" width="48" height="24" rx="10" fill="#064e3b"/>
  <!-- Pixel Smile & Eyes -->
  <circle cx="48" cy="54" r="4.5" fill="#34d399"/>
  <circle cx="72" cy="54" r="4.5" fill="#34d399"/>
  <path d="M 52 74 Q 60 82 68 74" stroke="#059669" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
`)

export const STICKER_BEAR_HONEY = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#d97706" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Bear Ears -->
  <circle cx="34" cy="38" r="12" fill="#b45309"/>
  <circle cx="34" cy="38" r="6" fill="#fef3c7"/>
  <circle cx="86" cy="38" r="12" fill="#b45309"/>
  <circle cx="86" cy="38" r="6" fill="#fef3c7"/>
  <!-- Head -->
  <circle cx="60" cy="62" r="32" fill="#d97706"/>
  <!-- Snout -->
  <ellipse cx="60" cy="70" rx="16" ry="12" fill="#fef3c7"/>
  <ellipse cx="60" cy="66" rx="6" ry="4" fill="#451a03"/>
  <path d="M 56 74 Q 60 78 64 74" stroke="#451a03" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <circle cx="46" cy="54" r="3.5" fill="#451a03"/>
  <circle cx="74" cy="54" r="3.5" fill="#451a03"/>
  <circle cx="47" cy="53" r="1" fill="#ffffff"/>
  <circle cx="75" cy="53" r="1" fill="#ffffff"/>
</svg>
`)

export const STICKER_ROCKET_STAR = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#4f46e5" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="32" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="14" y="14" width="92" height="92" rx="28" fill="url(#bg)"/>
  <!-- Stars -->
  <circle cx="30" cy="32" r="2" fill="#fef08a"/>
  <circle cx="88" cy="36" r="2.5" fill="#fef08a"/>
  <circle cx="84" cy="80" r="1.5" fill="#fef08a"/>
  <!-- Rocket Body -->
  <path d="M 60 22 C 45 40, 42 66, 42 76 L 78 76 C 78 66, 75 40, 60 22 Z" fill="#ffffff"/>
  <!-- Rocket Nose -->
  <path d="M 60 22 C 52 32, 48 40, 46 44 L 74 44 C 72 40, 68 32, 60 22 Z" fill="#ef4444"/>
  <!-- Porthole Window with Happy Face -->
  <circle cx="60" cy="56" r="10" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
  <circle cx="57" cy="55" r="2" fill="#ffffff"/>
  <circle cx="63" cy="55" r="2" fill="#ffffff"/>
  <path d="M 57 58 Q 60 61 63 58" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- Fins -->
  <polygon points="42,66 28,78 42,78" fill="#ef4444"/>
  <polygon points="78,66 92,78 78,78" fill="#ef4444"/>
  <!-- Flame -->
  <polygon points="48,76 60,94 72,76" fill="#f59e0b"/>
  <polygon points="52,76 60,88 68,76" fill="#fef08a"/>
</svg>
`)

// ── Pre-packaged List of Sticker Presets ──────────────────────────

export const BUILTIN_STICKER_AVATARS: StickerPreset[] = [
  { id: 'sticker-robot-cyan', name: 'Cyber Bot', url: STICKER_ROBOT_CYAN },
  { id: 'sticker-fox-smart', name: 'Smart Fox', url: STICKER_FOX_SMART },
  { id: 'sticker-panda-chill', name: 'Chill Panda', url: STICKER_PANDA_CHILL },
  { id: 'sticker-owl-scholar', name: 'Scholar Owl', url: STICKER_OWL_SCHOLAR },
  { id: 'sticker-cat-cosmo', name: 'Cosmo Cat', url: STICKER_CAT_COSMO },
  { id: 'sticker-bot-emerald', name: 'Green Spark', url: STICKER_BOT_EMERALD },
  { id: 'sticker-bear-honey', name: 'Honey Bear', url: STICKER_BEAR_HONEY },
  { id: 'sticker-rocket-star', name: 'Star Rocket', url: STICKER_ROCKET_STAR },
]

/**
 * Deterministically picks a sticker avatar for a student based on their ID / name.
 */
export function getDefaultStickerAvatar(seed: string = '1'): string {
  if (!seed) return BUILTIN_STICKER_AVATARS[0].url
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % BUILTIN_STICKER_AVATARS.length
  return BUILTIN_STICKER_AVATARS[index].url
}

/**
 * Returns true if the avatar string represents a custom-uploaded picture by the student
 * (such as a base64 Data URL or user photo), rather than an unsplash stock photo.
 */
export function isCustomUploadedPhoto(url?: string | null): boolean {
  if (!url) return false
  // Legacy unsplash stock photos are NOT considered student uploads
  if (url.includes('images.unsplash.com')) return false
  // Data URLs from file uploads
  if (url.startsWith('data:image/')) return true
  // Any blob URL or custom uploaded file path
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    // If it's one of our built-in sticker SVG data URLs, it's a sticker
    if (url.startsWith('data:image/svg+xml')) return false
    return true
  }
  return false
}

/**
 * Returns the effective avatar to display for any student:
 * 1. If student uploaded their own photo (base64 or custom upload) -> return that photo!
 * 2. If it is an old legacy unsplash photo or missing -> return the default sticker avatar!
 */
export function getEffectiveStudentAvatar(student?: {
  avatar?: string | null
  profilePhoto?: string | null
  id?: string | null
  studentId?: string | null
  fullNameEn?: string | null
}): string {
  const seed = student?.studentId || student?.id || student?.fullNameEn || '1'
  const candidate = student?.avatar || student?.profilePhoto

  if (candidate) {
    // If it's an old legacy unsplash human photo, discard it and show sticker avatar
    if (candidate.includes('images.unsplash.com')) {
      return getDefaultStickerAvatar(seed)
    }
    // If it's a built-in sticker data URL, return it
    if (candidate.startsWith('data:image/svg+xml')) {
      return candidate
    }
    // If it's an uploaded photo or custom sticker URL, return it!
    return candidate
  }

  // Default fallback: deterministic sticker avatar
  return getDefaultStickerAvatar(seed)
}

/**
 * Client-side file processor:
 * Takes an image File (e.g. from <input type="file" />), resizes it down
 * to max 320x320 on an HTML5 canvas to keep size tiny (<30KB), and returns
 * a clean base64 data URL.
 */
export async function processStudentPhotoFile(file: File, maxDim: number = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (PNG, JPG, or WEBP).'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to parse image data.'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(e.target?.result as string)
        }

        ctx.drawImage(img, 0, 0, width, height)
        // Compress as JPEG 0.85 for small file size (~20KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        resolve(compressedDataUrl)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
