'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, X, Calendar, DollarSign, Eye, CreditCard, XCircle } from 'lucide-react'
import getOrdersByCustomer from '@/_actions/getOrdersByCustomer'
import { useUser } from '@clerk/nextjs'
import { Order } from '../../../../types/order-type'
import payOrder from '@/_actions/payOrder'
import { useToast } from '@/hooks/use-toast'
import { PagamentoPix } from '../payment-pix'

interface UserOrdersProps {
  onClose: () => void
}

export const UserOrders = ({ onClose }: UserOrdersProps) => {
  const [openOrders, setOpenOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<string | null>(null)
  const [cpf, setCpf] = useState('')
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOpenOrders = async () => {
      if (user) {
        setIsLoading(true)
        try {
          const orders = await getOrdersByCustomer(user.emailAddresses[0].emailAddress)
          setOpenOrders(orders)
        } catch (error) {
          console.error('Erro ao buscar pedidos:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchOpenOrders()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente'
      case 'paid':
        return 'Pago'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const handlePayOrder = async (orderId: string, total: number) => {
     if (!cpf) {
      toast({
        title: 'CPF necessário',
        description: 'Por favor, insira seu CPF para continuar com o pagamento.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const paymentData = {
        orderId,
        transaction_amount: total,
        description: `Pagamento do pedido #${orderId}`,
        payer: {
          email: user?.emailAddresses[0]?.emailAddress || '',
          identification: {
            type: 'CPF',
            number: cpf
          }
        }
      };

      const response = await payOrder(paymentData);
      setPaymentInfo(response);
      setSelectedOrderForPayment(null);
      setCpf('');
      

      toast({
        title: 'Pagamento processado',
        description: 'O pagamento foi processado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Package className="mr-2 text-primary" size={24} />
          Seus Pedidos
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : openOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Você não tem pedidos em aberto.</p>
          </div>
        ) : (
          <AnimatePresence>
            {openOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md mb-4 overflow-hidden"
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Pedido #{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.financial_status)}`}>
                      {translateStatus(order.financial_status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="mr-2" size={14} />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="mr-2" size={14} />
                      R$ {parseFloat(order.total_price).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 flex flex-wrap gap-2">
                  <button
                    onClick={() => {/* Implementar lógica para ver detalhes */}}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    Ver Detalhes
                  </button>
                  {order.financial_status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => setSelectedOrderForPayment(order.id)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
                    >
                      <CreditCard size={16} className="mr-2" />
                      Pagar Agora
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal de Pagamento */}
      <AnimatePresence>
        {selectedOrderForPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Finalizar Pagamento</h3>
                <button onClick={() => setSelectedOrderForPayment(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Digite seu CPF"
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const order = openOrders.find(o => o.id === selectedOrderForPayment);
                  if (order) {
                    handlePayOrder(selectedOrderForPayment, parseFloat(order.total_price));
                  }
                }}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Confirmar Pagamento
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Componente PagamentoPix */}
      {paymentInfo && (
        <PagamentoPix paymentInfo={paymentInfo} onClose={() => setPaymentInfo(null)} />
      )}
    </div>
  )
}