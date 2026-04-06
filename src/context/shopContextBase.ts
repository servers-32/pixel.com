import { createContext } from 'react'
import type { ShopContextValue } from './shopContext.types'

export const ShopContext = createContext<ShopContextValue | null>(null)
