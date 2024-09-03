 
export interface CategoryComponent{
  Category: CategoryType
}
export interface CategoryListComponent{
  Category: CategoryType[]
}


  export interface CategoryType {
    slug: string
    has_product: string
    id: string
    parent_id: string
    name: string
    description: string
    order: string
    active: string
    title: string
    small_description: string
    link: Link
    images: any[]
    children: any
  }
  
  export interface Link {
    http: string
    https: string
  }
  