import { useContext } from 'react'
import { ShopContext } from './shopContextBase'
import type { ShopContextValue } from './shopContext.types'

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}

