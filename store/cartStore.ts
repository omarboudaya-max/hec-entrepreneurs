import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  discount_price?: number
  image_url: string
  category?: string
  stock: number
  is_available: boolean
  status?: "available" | "out_of_stock" | "on_order"
  sizes?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
  size?: string
}

interface CartState {
  items: CartItem[]
  searchQuery: string
  addItem: (product: Product, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  setSearchQuery: (query: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      addItem: (product, size) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.product.id === product.id && item.size === size)
        
        if (existingItem) {
          set({
            items: currentItems.map((item) => 
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({ items: [...currentItems, { product, quantity: 1, size }] })
        }
      },
      removeItem: (productId, size) => {
        set({ items: get().items.filter((item) => !(item.product.id === productId && item.size === size)) })
      },
      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId && item.size === size ? { ...item, quantity } : item
          )
        })
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discount_price || item.product.price
          return total + price * item.quantity
        }, 0)
      }
    }),
    {
      name: 'ihec-store-cart',
    }
  )
)
