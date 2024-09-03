export interface ProductProps {
  id: number
  title: string
  body_html: string
  vendor: string
  product_type: string
  created_at: string
  handle: string
  updated_at: string
  published_at: any
  template_suffix: string
  published_scope: string
  tags: string
  status: string
  admin_graphql_api_id: string
  variants: Variant[]
  options: Option[]
  images: Image[]
  image: Image2
}

export interface Variant {
  id: number
  product_id: number
  title: string
  price: string
  position: number
  inventory_policy: string
  compare_at_price: any
  option1: string
  option2: string
  option3: any
  created_at: string
  updated_at: string
  taxable: boolean
  barcode: any
  fulfillment_service: string
  grams: number
  inventory_management: string
  requires_shipping: boolean
  sku: any
  weight: number
  weight_unit: string
  inventory_item_id: number
  inventory_quantity: number
  old_inventory_quantity: number
  admin_graphql_api_id: string
  image_id: any
}

export interface Option {
  id: number
  product_id: number
  name: string
  position: number
  values: string[]
}

export interface Image {
  id: number
  alt: any
  position: number
  product_id: number
  created_at: string
  updated_at: string
  admin_graphql_api_id: string
  width: number
  height: number
  src: string
  variant_ids: any[]
}

export interface Image2 {
  id: number
  alt: any
  position: number
  product_id: number
  created_at: string
  updated_at: string
  admin_graphql_api_id: string
  width: number
  height: number
  src: string
  variant_ids: any[]
}

 
 