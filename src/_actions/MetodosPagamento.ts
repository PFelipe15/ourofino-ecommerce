'use server'
import { MetodosPagamento } from "../../types/metodos_pagamento";

export const getPaymentMethods = async (): Promise<MetodosPagamento[]> => {
    const tokenMercadoPago = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const response = await fetch ('https://api.mercadopago.com/v1/payment_methods',{
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${tokenMercadoPago}`,
        },
    })

    const data = await response.json();

    // Filtra apenas os métodos de pagamento ativos
    const activePaymentMethods = data.filter((method: MetodosPagamento) => method.status === 'active');

     return activePaymentMethods as MetodosPagamento[];
}
