export interface CustomersResponse {
    data: CustomerData[]
    meta: Meta
  }
  
  export interface CustomerData {
    id: number
    attributes: Attributes
  }
  
  export interface Attributes {
    email: string
    address: Address
    phone: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    first_name: string
    last_name: string
    cpf: string
  }
  
  export interface Address {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
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