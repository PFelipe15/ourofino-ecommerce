export interface ProductsAllResponse {
  data: ProductsData[]
  meta: Meta
}

export interface ProductsData {
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
  hot: boolean
  destaque_vitrine: boolean
  price_primary?: number
  variants_price: VariantsPrice,
  largura: number,
  altura: number,
  comprimento: number,
  material: "ouro" | "prata" | "bronze",
  peso: number,
  images: Images,
  collection: Collection,
}

export interface VariantsPrice {
  variantes: Variante[]
}

export interface Variante {
  classificacao: string
  preco: number
  descricao: string
  tamanho_minimo: string
  tamanho_maximo: string
  tamanhos_estoque: [
    {
      estoque: number
      tamanho: number
    }
  ]
}

export interface Meta {
  pagination: Pagination
}

export interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
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
  data: Data
}

export interface Data {
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
