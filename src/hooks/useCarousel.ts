'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface UseCarouselOptions {
  itemsCount: number
  visibleItems?: number // combien de cartes visibles (ex: 1.5)
}

export function useCarousel({ itemsCount }: UseCarouselOptions) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  // Sync index au scroll
  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const cardWidth = el.querySelector('[data-card]')?.clientWidth ?? el.clientWidth * 0.72
    const idx = Math.round(el.scrollLeft / (cardWidth + 12)) // 12 = gap
    setCurrentIndex(Math.min(idx, itemsCount - 1))
  }, [itemsCount])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Mouse drag (desktop)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = trackRef.current
    if (!el) return
    setIsDragging(true)
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const el = trackRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    el.scrollLeft = scrollLeft.current - (x - startX.current)
  }, [isDragging])

  const onMouseUp = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setIsDragging(false)
    el.style.cursor = 'grab'
    el.style.userSelect = ''
  }, [])

  // Aller à un index précis
  const goTo = useCallback((idx: number) => {
    const el = trackRef.current
    if (!el) return
    const cardWidth = el.querySelector('[data-card]')?.clientWidth ?? el.clientWidth * 0.72
    el.scrollTo({ left: idx * (cardWidth + 12), behavior: 'smooth' })
    setCurrentIndex(idx)
  }, [])

  return {
    trackRef,
    currentIndex,
    isDragging,
    goTo,
    handlers: { onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp },
  }
}
