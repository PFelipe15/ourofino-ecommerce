"use server";
import { Order, OrderResponseProps } from "../../types/order-type";
import qs from 'qs';
import { preference } from "@/lib/configMercado-pago";
import { CartItem } from "@/store/useCartStore";
import { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { userData } from "./Customers";


interface PayOrderProps {
	items: CartItem[];
	user: userData | null;
	paymentMethod: string;
	shipmentCost: number ;
	total: number;
  }

export const createOrder = async (order: Order) => {
	const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
	try {
		const orderResponse = await fetch(`${HOST}/api/orders`, {
			method: 'POST',
			headers: {
				"Authorization": `Bearer ${TOKEN_STRAPI}`, // Corrigido para usar TOKEN_STRAPI
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ data: order })
		});

		if (!orderResponse.ok) {
			const errorData = await orderResponse.json();
			console.error("Resposta completa:", JSON.stringify(errorData));
			throw new Error(`Erro ao criar cliente: ${JSON.stringify(errorData)}`);
		}

		const orderData = await orderResponse.json();
		return orderData as OrderResponseProps;
	} catch (error: any) {
		throw new Error("Erro ao criar pedido: " + error.message);
	}
};

export const createItemsOrder = async (items: any, order_id: number) => {
	const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
	try {
		// Iterar sobre os itens e criar uma requisição para cada um
		const order_ItemsPromises = items.map(async (item: any) => {
			const order_ItemsResponse = await fetch(`${HOST}/api/order-items`, {
				method: 'POST',
				headers: {
					"Authorization": `Bearer ${TOKEN_STRAPI}`, // Corrigido para usar TOKEN_STRAPI
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ 
					data: {
						order: {
							connect: [order_id]  // Usar o ID do pedido recebido
						},
						product: {
							connect: [item.id]  // Usar o ID do produto do item
						},
						subtotal: item.subtotal,
						quantity: item.quantity,
						size: item.selectedSize
					} 
				})
			});

			if (!order_ItemsResponse.ok) {
				const errorData = await order_ItemsResponse.json();
				console.error("Resposta completa:", JSON.stringify(errorData));
				throw new Error(`Erro ao criar item: ${JSON.stringify(errorData)}`);
			}

			return await order_ItemsResponse.json(); // Retornar os dados do item criado
		});

		// Aguardar todas as promessas serem resolvidas
		const order_ItemsData = await Promise.all(order_ItemsPromises);

		return order_ItemsData;
	} catch (error: any) {
		throw new Error("Erro ao criar pedido: " + error.message);
	}
};

export const UpdateOrder = async (orderId: number, dataUpdate: any) => {
	const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
	try {
		const response = await fetch(`${HOST}/api/orders/${orderId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
					'Authorization': `Bearer ${TOKEN_STRAPI}`, // Corrigido para usar TOKEN_STRAPI
			},
			body: JSON.stringify({
				data: dataUpdate,
			}),
		});

		if (!response.ok) {
			throw new Error('Erro ao cancelar o pedido');
		}

		const data = await response.json(); // Obtenha a resposta JSON

	} catch (error) {
		console.error('Erro ao cancelar o pedido:', error);
	}
};

export const getOrdersByCustomer = async (email: string) => {
	const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
	const orders = await fetch(
		`${HOST}/api/orders?filters[customer][email][$eq]=${email}`,
		{
			headers: {
				"Authorization": `Bearer ${TOKEN_STRAPI}`, // Corrigido para usar TOKEN_STRAPI
			},
		}
	);

	const data = await orders.json();
	const orderIds = data.data.map((order: { id: any; }) => order.id); // Acesso corrigido para data.data
	const query = qs.stringify({
		filters: {
			order: {
				id: {
					$in:orderIds
				}
			}
		} 
	}, {
		encodeValuesOnly: true,
	});
	

	// Buscar os items_orders
	const itemsOrdersResponse = await fetch(`http://localhost:1337/api/order-items?${query}&populate=*`, {
		headers: {
			"Authorization": `Bearer ${TOKEN_STRAPI}`, // Corrigido para usar TOKEN_STRAPI
		},
	});

	const itemsOrdersData = await itemsOrdersResponse.json();
	// Juntar as orders com os items_orders
	const ordersWithItems= data.data.map((order: { id: any; }) => { 
		return {
			...order,
			items: itemsOrdersData.data.filter((item: { attributes: { order: { data: { id: any; }; }; }; }) => item.attributes.order.data.id === order.id)
		};
	});

	return ordersWithItems || [];
};

export const payOrder = async ({ items, user, paymentMethod, shipmentCost, total }: PayOrderProps): Promise<{ sandbox_init_point: string | undefined; id: string | undefined; }> => {
	const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
	try {
		const preferenceBody: PreferenceCreateData = {
			body: {
				additional_info: "Ourofino - " + new Date().getFullYear(),

				items: await Promise.all(items.map(async (item: any) => { // Adicionado await aqui
					return {
						id: item.id,
						title: item.attributes.name + " - " + item.selectedSize,
						description: item.attributes.name + " - " + item.selectedSize,
						quantity: item.quantity,
						unit_price: item.price,
						currency_id: "BRL",
					};
				})) ,
				payer: {
					email: user?.data.email,
					name: user?.data.first_name + ' ' + user?.data.last_name,
					address: {
						street_name: user?.data.address?.street,
						street_number: user?.data.address?.number,
						zip_code: user?.data.address?.zipCode,
					}

				},				
				payment_methods: {

					default_payment_method_id: paymentMethod,
					   
					  
				},
				




				shipments:{
					cost: shipmentCost,
					mode: "frete",
				},
				

				statement_descriptor: "Ourofino - " + new Date().getFullYear(),


				back_urls: {
					success: 'https://localhost:3000/payment/success',
					failure: 'https://localhost:3000/payment/pending',
					pending: 'https://localhost:3000/payment/pending'
				},
					notification_url: 'https://localhost:3000/api/webhook',
					auto_return: 'approved',
				} 	
				  
		}
   
		const response = await preference.create(preferenceBody);


		return { sandbox_init_point: response.sandbox_init_point, id: response.id };  

	} catch (error: any) {
		console.error('Erro ao criar pagamento:', error);
		if (error.response) {
			console.error('Resposta de erro da API:', error.response.data);
		}
		throw error;
	}
}
