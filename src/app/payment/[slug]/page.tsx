/* eslint-disable @next/next/no-img-element */
'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaShoppingBag } from 'react-icons/fa'
 
import { collection, query, where, getDocs } from 'firebase/firestore'
import db from '@/lib/firebase'

export default function ResultPayment({ params }: { params: { slug: string } }) {
	const searchParams = useSearchParams()
	const preference_id = searchParams.get('preference_id')
	const [status, setStatus] = useState('')
	const [paymentData, setPaymentData] = useState<any>(null)

	useEffect(() => {
		setStatus(params.slug)
		fetchPaymentData()
	}, [params.slug, preference_id])

	const fetchPaymentData = async () => {
		if (!preference_id) return

		const q = query(collection(db, 'transactions'), where('payment_prefer_id', '==', preference_id))
		const querySnapshot = await getDocs(q)

		if (!querySnapshot.empty) {
			setPaymentData(querySnapshot.docs[0].data())
		}
	}

	const getStatusInfo = () => {
		switch (status) {
			case 'success':
				return {
					title: 'Pagamento Aprovado',
					icon: <FaCheckCircle className="text-5xl text-green-500 mb-4" />,
					message: 'Seu pagamento foi processado com sucesso! Agradecemos pela sua compra.',
					color: 'green',
					bgColor: 'bg-green-50'
				}
			case 'failure':
				return {
					title: 'Pagamento não Aprovado',
					icon: <FaTimesCircle className="text-5xl text-red-500 mb-4" />,
					message: 'Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato com nosso suporte.',
					color: 'red',
					bgColor: 'bg-red-50'
				}
			default:
				return {
					title: 'Pagamento em Processamento',
					icon: <FaHourglassHalf className="text-5xl text-yellow-500 mb-4" />,
					message: 'Seu pagamento está sendo processado. Por favor, aguarde a confirmação.',
					color: 'yellow',
					bgColor: 'bg-yellow-50'
				}
		}
	}

	const statusInfo = getStatusInfo()

	return (
		<div className={`min-h-screen ${statusInfo.bgColor} flex flex-col items-center  p-4`}>
			<div className="bg-white p-8 mt-10 rounded-lg shadow-xl max-w-2xl w-full text-center">
				<div className="flex justify-center mb-6">
					<img src="/logotipoourofino.svg" alt="Ourofino Logo" className='object-cover   h-28' />
				</div>
				<div className='flex my-4 gap-2 items-center justify-center'>

				{statusInfo.icon}
				<h1 className={`text-3xl font-bold mb-4 text-${statusInfo.color}-700`}>{statusInfo.title}</h1>
				</div>
				<p className="text-xl text-gray-600 mb-6">{statusInfo.message}</p>
				<div className="mb-8 p-4 bg-gray-100 rounded-lg">
					<p className="text-gray-700 mb-2">ID do Pagamento:</p>
					<p className="text-lg font-semibold text-gray-800 break-all">{preference_id || 'Não disponível'}</p>
				</div>
			 
				<div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
					<button 
						className={`bg-${statusInfo.color}-500 text-white py-3 px-6 rounded-full hover:bg-${statusInfo.color}-600 transition duration-300 font-semibold flex items-center justify-center`}
						onClick={() => window.location.href = '/'}
					>
						<FaShoppingBag className="mr-2" /> Continuar Comprando
					</button>
					<button 
						className="bg-gray-200 text-gray-800 py-3 px-6 rounded-full hover:bg-gray-300 transition duration-300 font-semibold"
						onClick={() => window.location.href = '/minha-conta'}
					>
						Minha Conta
					</button>
				</div>
				<p className="text-gray-600 text-lg">A Ourofino agradece a sua preferência!</p>
				<p className="text-gray-500 mt-2">Em caso de dúvidas, entre em contato com nosso suporte.</p>
			</div>
		</div>
	)
}