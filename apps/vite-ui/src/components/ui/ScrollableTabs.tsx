import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ScrollableTabsProps {
  children: ReactNode
  className?: string
  trackClassName?: string
  arrowClassName?: string
  scrollAmount?: number
  showArrows?: 'always' | 'auto'
  arrowSize?: number
}

/**
 * Reusable horizontal tab strip with:
 * 1. Left & Right clickable arrow navigation buttons (for mouse users)
 * 2. Natural vertical-to-horizontal mouse wheel scrolling
 * 3. Drag-to-scroll support with mouse
 * 4. Automatic boundary checks (disables arrows when scrolled to ends)
 */
export function ScrollableTabs({
  children,
  className = '',
  trackClassName = '',
  arrowClassName = '',
  scrollAmount = 240,
  showArrows = 'always',
  arrowSize = 16,
}: ScrollableTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  const checkScroll = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 2
    setHasOverflow(overflow)
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)

    // ResizeObserver on the tabs element & child list changes
    let observer: ResizeObserver | null = null
    if (tabsRef.current) {
      observer = new ResizeObserver(() => checkScroll())
      observer.observe(tabsRef.current)
      if (tabsRef.current.firstElementChild) {
        observer.observe(tabsRef.current.firstElementChild)
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (observer) observer.disconnect()
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = tabsRef.current
    if (!el) return
    const offset = direction === 'left' ? -scrollAmount : scrollAmount
    el.scrollBy({ left: offset, behavior: 'smooth' })
    setTimeout(checkScroll, 320)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const el = tabsRef.current
    if (!el) return
    if (el.scrollWidth > el.clientWidth) {
      if (Math.abs(e.deltaY) > 0) {
        el.scrollLeft += e.deltaY * 0.85
        checkScroll()
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tabsRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    if (e.button !== 0) return // Only primary click
    isDraggingRef.current = true
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !tabsRef.current) return
    e.preventDefault()
    const x = e.pageX - tabsRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.1
    tabsRef.current.scrollLeft = scrollLeftRef.current - walk
    checkScroll()
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
  }

  const shouldRenderArrows = showArrows === 'always' || (showArrows === 'auto' && hasOverflow)

  return (
    <div className={`relative flex items-center min-w-0 max-w-full ${className}`}>
      {/* Left Arrow Button */}
      {shouldRenderArrows && (
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`p-1.5 sm:p-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-xs transition-all mr-1.5 shrink-0 cursor-pointer ${
            !canScrollLeft
              ? 'opacity-25 pointer-events-none cursor-not-allowed'
              : 'hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 active:scale-95'
          } ${arrowClassName}`}
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={arrowSize} />
        </button>
      )}

      {/* Tab Track Container */}
      <div
        ref={tabsRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-center overflow-x-auto scroll-smooth hide-scrollbar ${trackClassName}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Right Arrow Button */}
      {shouldRenderArrows && (
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`p-1.5 sm:p-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-xs transition-all ml-1.5 shrink-0 cursor-pointer ${
            !canScrollRight
              ? 'opacity-25 pointer-events-none cursor-not-allowed'
              : 'hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-900 active:scale-95'
          } ${arrowClassName}`}
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={arrowSize} />
        </button>
      )}
    </div>
  )
}
