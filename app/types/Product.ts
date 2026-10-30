export interface Product {
  product_id: number
  slug: string
  name: string
  img_url: string
  description: string
  category_id: number
  price: number | null
  seo?: Seo
}

export interface Seo {
  title: string,
  description: string,
  key_words: string[]
}

// dm-ml recommendation (some endpoints only return product_id/name/score -> enrich from the catalog)
export interface Rec {
  product_id: number
  name: string
  score?: number
  sources?: string[]
  slug?: string
  img_url?: string
  price?: number | null
  description?: string
  category_id?: number
}
