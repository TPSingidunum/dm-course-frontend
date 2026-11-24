// Client-side shopping cart (localStorage) that records the matching tracking events:
//   add -> add_to_cart, remove -> remove_from_cart, purchase -> purchase (one event per line item).
import type { Product } from '~/types/Product'

export interface CartItem {
  product_id: number
  slug: string
  name: string
  img_url: string
  price: number
  category_id: number
  quantity: number
}

const STORAGE_KEY = 'dm_cart'
const MAX_QTY = 99

export const eventProduct = (i: Pick<CartItem, 'product_id' | 'price' | 'category_id'>) =>
  ({ product_id: i.product_id, price: i.price, category_id: i.category_id })

export const lineTotal = (i: Pick<CartItem, 'price' | 'quantity'>) => i.price * i.quantity
export const orderTotal = (items: Pick<CartItem, 'price' | 'quantity'>[]) => items.reduce((sum, i) => sum + lineTotal(i), 0)

export const toCartItem = (p: Product, quantity = 1): CartItem => ({
  product_id: p.product_id, slug: p.slug, name: p.name, img_url: p.img_url,
  price: p.price ?? 0, category_id: p.category_id, quantity,
})

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  const ready = useState('cart-ready', () => false)
  const toast = useToast()

  const count = computed(() => items.value.reduce((n, i) => n + i.quantity, 0))
  const total = computed(() => orderTotal(items.value))

  // Call once on the client (default layout). Restores the cart and keeps it saved.
  function load() {
    if (ready.value) return
    try { items.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { items.value = [] }
    ready.value = true
    watch(items, (v) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch { /* storage unavailable */ }
    }, { deep: true })
  }

  // `source` is the page the click came from. Pages other than the product page also log the product_view.
  async function add(p: Product, source = 'product_page') {
    const existing = items.value.find(i => i.product_id === p.product_id)
    if (existing) existing.quantity = Math.min(existing.quantity + 1, MAX_QTY)
    else items.value.push(toCartItem(p))
    toast.add({ title: 'Added to cart', description: p.name, icon: 'i-lucide-shopping-cart' })
    const ev = eventProduct(toCartItem(p))
    if (source !== 'product_page') await trackProductView(ev, source)
    await addToShoppingCartEvent(ev, 1, source)
  }

  function setQuantity(id: number, quantity: number) {
    const item = items.value.find(i => i.product_id === id)
    if (item) item.quantity = Math.min(Math.max(quantity || 1, 1), MAX_QTY)
  }

  async function remove(id: number) {
    const item = items.value.find(i => i.product_id === id)
    if (!item) return
    items.value = items.value.filter(i => i.product_id !== id)
    await removeFromCartEvent(eventProduct(item), item.quantity)
  }

  // Records one purchase event per line item. Returns false (and tells the user) if any could not be saved.
  async function purchase(lines: CartItem[], source: string) {
    const results = await Promise.all(lines.map(l => buyProductEvent(eventProduct(l), l.quantity, source)))
    if (results.some(r => !r)) {
      toast.add({ title: 'Could not record the purchase', description: 'Please try again.', color: 'error' })
      return false
    }
    return true
  }

  async function checkout() {
    const lines = [...items.value]
    if (!lines.length || !await purchase(lines, 'checkout')) return null
    items.value = []
    return lines
  }

  return { items, ready, count, total, load, add, setQuantity, remove, purchase, checkout }
}
