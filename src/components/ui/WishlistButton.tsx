'use client'

import { useWishlistStore } from '@/store/wishlist'
import type { Product } from '@/types'

interface WishlistButtonProps {
  product: Product
  className?: string
  size?: 'sm' | 'md'
}

export default function WishlistButton({ product, className = '', size = 'md' }: WishlistButtonProps) {
  const toggle  = useWishlistStore(s => s.toggleItem)
  const hasItem = useWishlistStore(s => s.hasItem)
  const isWished = hasItem(product.id)

  const dim = size === 'sm' ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg'

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product) }}
      className={`
        ${dim} bg-white flex items-center justify-center
        border-none cursor-pointer transition-all duration-200
        ${isWished ? 'text-black scale-110' : 'text-[#ccc] hover:text-black'}
        ${className}
      `}
      aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isWished ? '♥' : '♡'}
    </button>
  )
}
