"use server";
import { Order, RootOrder } from "../../types/order-type";

const createOrder = async (order: Order, user: any, address: any): Promise<RootOrder> => {
 	try {
		// Verificar se os dados necessários estão presentes
		if (!user || !address) {
			throw new Error("Dados de usuário ou endereço ausentes");
		}

		const customerData = {
			"first_name": user.firstName || "",
			"last_name": user.lastName || "",
			"email": user.email || "",
			"phone": user.phone || "",
			"verified_email": true,
			"addresses": [
				{
					"address1": `${address.street || ""}, ${address.number || ""} ${address.complement || ""}`,
					"city": address.city || "",
					"province": address.state || "",
					"phone": address.number || "",
					"zip": address.zipCode || "",
					"country": address.country || "BR", // Adicionando o campo country
				
				}
			],
		};

		const hasClienteShopify = await fetch(`https://6bc81c-70.myshopify.com/admin/api/2024-04/customers/search.json?query=email:${user.email}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Shopify-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API!
			},
		});

		const clienteShopify = await hasClienteShopify.json();
		let customerId;

		if (clienteShopify.customers.length > 0) {
			// Cliente já existe, usar o ID existente
			customerId = clienteShopify.customers[0].id;
		} else {
			// Cliente não existe, criar novo
			const customerResponse = await fetch('https://6bc81c-70.myshopify.com/admin/api/2024-04/customers.json', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Shopify-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API!
				},
				body: JSON.stringify({ customer: customerData })
			});

			if (!customerResponse.ok) {
				const errorData = await customerResponse.json();
				console.error("Resposta completa do Shopify:", JSON.stringify(errorData));
				throw new Error(`Erro ao criar cliente: ${JSON.stringify(errorData)}`);
			}

			const newCustomer = await customerResponse.json();
			customerId = newCustomer.customer.id;
		}

		// Atualizar o objeto shopifyOrder para incluir o customer_id
		const shopifyOrder = {
			order: {
				...order,
				customer: { id: customerId },
				financial_status: "pending",
				fulfillment_status: null,
				
				shipping_address: customerData.addresses[0],
				phone: customerData.phone
			}
		};

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

 		const orderData = await orderResponse.json();

	console.log(orderData)
 
		return orderData as RootOrder;
	} catch (error) {
		throw new Error("Erro ao criar pedido");

		}
};

export default createOrder;
