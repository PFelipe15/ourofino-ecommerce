export interface RootOrder {
    order: Order
  }
  
  export interface Order {
    line_items: LineItem[]
    transactions: Transaction[]
    total_tax: number
    currency: string
  }
  
  export interface LineItem {
    title: string
    price: number
    grams: string
    quantity: number
    tax_lines: TaxLine[]
  }
  
  export interface TaxLine {
    price: number
    rate: number
    title: string
  }
  
  export interface Transaction {
    kind: string
    status: string
    amount: number
  }
  