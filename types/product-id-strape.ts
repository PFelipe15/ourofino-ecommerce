export interface ProductIdResponse {
    data: Data
    meta: Meta
    variants: Variant[]
  }
  
  export interface Data {
    id: number
    attributes: Attributes
  }
  
  export interface Attributes {
    name: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    description: string
    active: boolean
    destaque_vitrine: boolean
    hot: any
    images: Images
    collection: Collection
  }
  
  export interface Images {
    data: Daum[]
  }
  
  export interface Daum {
    id: number
    attributes: Attributes2
  }
  
  export interface Attributes2 {
    name: string
    alternativeText: any
    caption: any
    width: number
    height: number
    formats: Formats
    hash: string
    ext: string
    mime: string
    size: number
    url: string
    previewUrl: any
    provider: string
    provider_metadata: any
    createdAt: string
    updatedAt: string
  }
  
  export interface Formats {
    thumbnail: Thumbnail
  }
  
  export interface Thumbnail {
    name: string
    hash: string
    ext: string
    mime: string
    path: any
    width: number
    height: number
    size: number
    sizeInBytes: number
    url: string
  }
  
  export interface Collection {
    data: Data2
  }
  
  export interface Data2 {
    id: number
    attributes: Attributes3
  }
  
  export interface Attributes3 {
    name: string
    description: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
  
  export interface Meta {}
  
  export interface Variant {
    id: number
    attributes: Attributes4
  }
  
  export interface Attributes4 {
    min_size: number
    max_size: number
    price: number
    weight: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    product: Product
  }
  
  export interface Product {
    data: Data3
  }
  
  export interface Data3 {
    id: number
    attributes: Attributes5
  }
  
  export interface Attributes5 {
    name: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    description: string
    active: boolean
    hot: any
  }
  