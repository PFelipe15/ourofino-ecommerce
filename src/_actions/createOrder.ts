"use server";

import { Order, RootOrder } from "../../types/order-type";

const createOrder = async (order: Order): Promise<RootOrder> => {

 
	const shopifyOrder = {
		order: {
			...order,
			financial_status: "paid",
			fulfillment_status: null,
			// Adicione outros campos necessários para a API do Shopify
		}
	};
    
    console.log(shopifyOrder)
	const orderResponse = await fetch(
		`https://6bc81c-70.myshopify.com/admin/api/2024-07/orders.json`,
		{
			method: 'POST',
			body: JSON.stringify(shopifyOrder),
			headers: {
				"X-Shopify-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API!,
				"Content-Type": "application/json"
			},
		}
	);
	
	if (!orderResponse.ok) {
		const errorData = await orderResponse.json();
		throw new Error(`Erro ao criar pedido: ${JSON.stringify(errorData)}`);
	}

	const data = await orderResponse.json();
	return data as RootOrder;
};

export default createOrder;
