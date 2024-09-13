'use server'
import { payment, preference } from "@/lib/configMercado-pago";
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ProductProps } from "../../types/product-type";
import { CartItem } from "@/store/useCartStore";

interface PaymentData {
	orderId: string;
	transaction_amount: number;
	payment_method_id: string;
	description: string;
	items: CartItem[];
	payer: {
		email: string;
		identification: {
			type: string;
			number: string;
		}
		address: {
			zip_code: string;
			street_name: string;
			street_number: string;
			city: string;
			federal_unit: string;
		}
	}
}

const requestOptions = { idempotencyKey: uuidv4() }

const payOrder = async (paymentData: PaymentData) => {
	try {
		const preferenceBody = {
			items: [{
				id: paymentData.orderId,
				title: paymentData.description,
				description: paymentData.description,
				quantity: 1,
				unit_price: paymentData.transaction_amount
			}],
			payer: {
				email: paymentData.payer.email,
			},
			payment_methods: {
				excluded_payment_types: [
					{ id: "ticket" }
				],
				installments: 1
			},
			back_urls: {
				success: 'https://localhost:3000/payment/success',
				failure: 'https://localhost:3000/payment/pending',
				pending: 'https://localhost:3000/payment/pending'
			},
			auto_return: 'approved',
			external_reference: paymentData.orderId,
		};

		const response = await preference.create({ body: preferenceBody });

 
 		if (!paymentData.orderId) {
			throw new Error('orderId é obrigatório');
		}

 		const transactionData = {
			order_shopify_id: paymentData.orderId,
			payment_prefer_id: response.id,
			status: 'pending',
			user_cpf: paymentData.payer.identification?.number || '',
			user_id: paymentData.payer.email || '',
			valor: paymentData.transaction_amount || 0,
			link_pagamento: response.init_point,
			items: paymentData.items.map((item: CartItem) => ({
				product_id: item.variant.id,
				product_name: item.title,
				product_variant: item.variant.title,
				product_price: item.price,
				product_quantity: item.quantity,
				product_total: Number(item.price) * item.quantity
			})) || [],
			descricao: paymentData.description || '',
 		};

		// Remover campos undefined
		Object.keys(transactionData).forEach(key => 
			transactionData[key] === undefined && delete transactionData[key]
		);

		// Cadastrar o pagamento no Firebase
		const transactionRef = collection(db, 'transactions');
		await addDoc(transactionRef, transactionData);

 
		return {
			id: response.id,
			init_point: response.sandbox_init_point,
			external_reference: response.external_reference,
		};
		 
	} catch (error: any) {
		console.error('Erro ao criar pagamento:', error);
		if (error.response) {
			console.error('Resposta de erro da API:', error.response.data);
		}
		throw error;
	}
}

export default payOrder;

