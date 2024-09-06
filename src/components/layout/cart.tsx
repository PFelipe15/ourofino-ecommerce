import { useCartStore } from '@/store/useCartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, MapPin, CreditCard, ArrowLeft, Plus, Minus, Star, User, CheckCircle, Package, Bell } from 'lucide-react'
import { useState } from 'react'
import { ProductProps } from '../../../types/product-type'
import Image from 'next/image'
import createOrder from '@/_actions/createOrder'
import { SignInButton, useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { Button } from '../ui/button'
import getOrdersByCustomer from '@/_actions/getOrdersByCustomer'
import { Order } from '../../../types/order-type' // Importe o tipo
 
interface CartProps {
  isOpen: boolean
  onClose: () => void
}
 
export const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items, removeItem, clearCart, increaseQuantity, decreaseQuantity, updateItemSize } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'BR' // Adicionando o campo country com valor padrão 'Brazil'
  })
  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState('')
  const { toast } = useToast()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [showOpenOrders, setShowOpenOrders] = useState(false)
  const [openOrders, setOpenOrders] = useState<OrderCustomer[]>([])
  const [hasNewOrders, setHasNewOrders] = useState(true) // Novo estado para simular novas notificações

interface OrderCustomer {
  id: number;
  order_number: number;
  fulfillment_status: string;
  financial_status: string;
  current_total_price: string;
  created_at: string;
  status: string;
  date: string;
  total: number;
}

  const fetchOpenOrders = async () => {
    try {
      const response = await getOrdersByCustomer(user?.emailAddresses[0]?.emailAddress || '')
      const ordersData = response.orders.map((order: OrderCustomer) => ({
        id: order.order_number.toString(),
        status: order.fulfillment_status || order.financial_status,
        total: parseFloat(order.current_total_price),
        date: new Date(order.created_at).toLocaleDateString()
      }))
      setOpenOrders(ordersData)
    } catch (error) {
      console.error('Erro ao buscar pedidos em aberto:', error)
      toast({
        title: 'Erro ao buscar pedidos',
        description: 'Não foi possível carregar seus pedidos em aberto.'
      })
    }
  }

  const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = () => {
    if(!user){
      toast({
        title: 'Faça login ou cadastre-se para finalizar a compra',
        action: <SignInButton mode="modal">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all hover:scale-105 px-4 py-2 rounded-full font-semibold"
        >
          <User size={20} /> Entrar
        </Button>
        
      </SignInButton>
      })
      return
    }
    setIsCheckingOut(true)
  }

  const handleBackToCart = () => {
    setIsCheckingOut(false)
  }

  const handleConfirmPurchase = async () => {
    try {
      const orderData: Order = {
        line_items: items.map(item => ({
          title: item.title + " - " + item.selectedSize,
          price: parseFloat(item.price),
          grams: "0",
          quantity: item.quantity,
          tax_lines: []
        })),
        transactions: [{
          kind: "sale",
          status: "success",
          amount: total
        }],
        total_tax: 0,
        currency: "BRL"
      }

      // Serializar os dados do usuário e endereço
      const serializedUser = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.emailAddresses[0]?.emailAddress,
        phone: user?.phoneNumbers[0]?.phoneNumber
      }

      const response = await createOrder(orderData, serializedUser, address)
 
      setOrderConfirmed(true)
      setTimeout(() => {
        clearCart()
        setIsCheckingOut(false)
        setOrderConfirmed(false)
        onClose()
      }, 3000) // Fecha o carrinho após 3 segundos

     } catch (error) {
      toast({
        title: 'Erro ao criar o pedido',
        description: 'Por favor, verifique os dados e tente novamente.'
      })
      console.log(error) 
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } },
    exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut' } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 overflow-y-auto"
          >
            {orderConfirmed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <CheckCircle size={64} className="text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Confirmado!</h2>
                <p className="text-gray-600">Obrigado pela sua compra.</p>
              </motion.div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 bg-gradient-to-r from-primary to-primary-dark text-black">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center">
                      {isCheckingOut ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleBackToCart}
                          className="mr-2"
                        >
                          <ArrowLeft size={24} />
                        </motion.button>
                      ) : (
                        <ShoppingBag className="mr-2" size={24} />
                      )}
                      {isCheckingOut ? 'Finalizar Compra' : 'Seu Carrinho'}
                    </h2>
                    <div className="flex items-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowOpenOrders(!showOpenOrders)
                          if (!showOpenOrders) fetchOpenOrders()
                          setHasNewOrders(false) // Reseta a notificação quando o usuário vê os pedidos
                        }}
                        className="mr-4 hover:text-primary transition-all relative"
                      >
                        <Package size={24} />
                        {hasNewOrders && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            <Bell size={12} />
                          </span>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="hover:text-primary transition-all"
                      >
                        <X size={24} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              
                <div className="flex-grow p-6 overflow-y-auto">
                  {showOpenOrders ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                        <Package className="mr-2 text-primary" size={24} />
                        Seus Pedidos em Aberto
                      </h3>
                      {openOrders.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600">Você não tem pedidos em aberto no momento.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {openOrders.map((order) => (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-semibold text-gray-800">Pedido #{order.id}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {order.status === 'pending' ? 'Pendente' : order.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <strong>Data:</strong> {order.date}
                                </div>
                                <div className="text-right">
                                  <strong>Total:</strong> R$ {order.total.toFixed(2)}
                                </div>
                              </div>
                              <div className="mt-4 flex flex-col gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
                                >
                                  Ver Detalhes
                                </motion.button>
                                {order.status === 'pending' && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                                    >
                                      Pagar Agora
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                                    >
                                      Cancelar
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowOpenOrders(false)}
                        className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
                      >
                        <ArrowLeft size={20} className="mr-2" />
                        Voltar ao Carrinho
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      {items.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center h-full text-gray-500"
                        >
                          <ShoppingBag size={64} className="mb-4 text-primary" />
                          <p className="text-xl font-semibold">Seu carrinho está vazio</p>
                          <p className="mt-2 text-sm">Adicione alguns itens para começar!</p>
                        </motion.div>
                      ) : (
                        <>
                          {items.map((item) => (
                            <motion.div
                              key={`${item.id}-${item.selectedSize}`}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200"
                            >
                              <div className="flex items-center">
                                <div className="w-24 h-24 mr-4 relative">
                                  <Image
                                    src={item.image.src}
                                    alt={item.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-md"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                  <p className="text-sm text-gray-600 mb-1">R$ {item.price}</p>
                                  <p className="text-sm text-gray-600">Tamanho: {item.selectedSize}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => decreaseQuantity(item.id, item.selectedSize)}
                                    className="text-primary p-1 rounded-full hover:bg-primary hover:text-black transition-colors"
                                  >
                                    <Minus size={16} />
                                  </motion.button>
                                  <span className="mx-2 font-semibold">{item.quantity || 1}</span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => increaseQuantity(item.id, item.selectedSize)}
                                    className="text-primary p-1 rounded-full hover:bg-primary hover:text-black transition-colors"
                                  >
                                    <Plus size={16} />
                                  </motion.button>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => removeItem(item.id, item.selectedSize)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                                >
                                  <Trash2 size={20} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {isCheckingOut && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <MapPin className="mr-2 text-primary" size={20} />
                          Endereço de Entrega
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <input
                              type="text"
                              name="street"
                              value={address.street}
                              onChange={handleAddressChange}
                              placeholder="Rua"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="number"
                              value={address.number}
                              onChange={handleAddressChange}
                              placeholder="Número"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="complement"
                              value={address.complement}
                              onChange={handleAddressChange}
                              placeholder="Complemento"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="neighborhood"
                              value={address.neighborhood}
                              onChange={handleAddressChange}
                              placeholder="Bairro"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="city"
                              value={address.city}
                              onChange={handleAddressChange}
                              placeholder="Cidade"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              name="state"
                              value={address.state}
                              onChange={handleAddressChange}
                              placeholder="Estado"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              name="zipCode"
                              value={address.zipCode}
                              onChange={handleAddressChange}
                              placeholder="CEP"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              name="country"
                              value={address.country}
                              onChange={handleAddressChange}
                              placeholder="País"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <CreditCard className="mr-2 text-primary" size={20} />
                          Método de Pagamento
                        </h3>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                          <option value="">Selecione um método de pagamento</option>
                          <option value="credit_card">Cartão de Crédito</option>
                          <option value="debit_card">Cartão de Débito</option>
                          <option value="pix">PIX</option>
                          <option value="boleto">Boleto</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>
              
                {items.length > 0 && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                    {!isCheckingOut ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={clearCart}
                          className="w-full bg-red-500 hover:bg-red-600 text-black font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center mb-3"
                        >
                          <Trash2 size={20} className="mr-2" />
                          Limpar Carrinho
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCheckout}
                          className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          <CreditCard size={20} className="mr-2" />
                          Finalizar Compra
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmPurchase}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                      >
                        <CreditCard size={20} className="mr-2" />
                        Confirmar Compra
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

