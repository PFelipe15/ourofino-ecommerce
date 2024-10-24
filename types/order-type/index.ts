export interface RootOrder {
    order: Order
  }
  
  export interface Order {
    customer: {
     connect: number [] | string []
    }
    status: "pending" | "paid" | "failure"
    order_date: number
    total: number
    link_payment?:string
    payment_id?:string
   }


    export interface OrderResponseProps {
      
        data: {
          id: number,
          attributes: {
            createdAt: string,
            updatedAt: string,
            publishedAt: string,
            status: string,
            order_date: string,
            total: number,
            link_payment?: string
          }
        },
        meta: {}
    

    }
  
  export interface Order_item {
    data:{

      order:{
        connect:string[] | number[] //id do pedido
      },
      product:{
        connect:string[] | number[] //id do produto
      },
      subtotal: number
      quantity: number
      size:number,

    }
  }
   
  