'use client'
import { useEffect } from 'react'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

export default function PixelEvents() {
  useEffect(() => {
    const planos = document.getElementById('planos')
    if (!planos) return
    let fired = false
    const observer = new IntersectionObserver(
      (entries) => {
        if (!fired && entries[0].isIntersecting) {
          fired = true
          window.fbq?.('track', 'ViewContent', { content_name: 'Planos' })
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(planos)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (anchor?.href?.includes('wa.me')) {
        window.fbq?.('track', 'Lead')
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
