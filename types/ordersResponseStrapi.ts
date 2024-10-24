export interface ProductAttributes {
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    description: string;
    active: boolean;
}

export interface Product {
    data: {
        id: number;
        attributes: ProductAttributes;
    };
}

export interface OrderDataAttributes {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    status: string;
    order_date: string;
    total: number;
    link_payment: string;
    payment_id: string;
}

export interface OrderData {
    data: {
        id: number;
        attributes: OrderDataAttributes;
    };
}

export interface ItemAttributes {
    quantity: number;
    subtotal: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    size: number;
    order: OrderData;
    product: Product;
}

export interface Item {
    id: number;
    attributes: ItemAttributes;
}

export interface Order {
    id: number;
    created_at: string;
    total_price: number;
    items: Item[];
    link_payment: string;
    // Adicione as propriedades que faltam
    customer?: string; // Exemplo de propriedade adicional
    status?: string; // Exemplo de propriedade adicional
    order_date?: string; // Exemplo de propriedade adicional
}

export type OrdersResponse = Order[];