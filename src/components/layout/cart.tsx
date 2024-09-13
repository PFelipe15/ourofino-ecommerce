import { useCartStore } from '@/store/useCartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, MapPin, CreditCard, ArrowLeft, Plus, Minus, Star, User, CheckCircle, Package, Bell, Smartphone, Barcode, Mail, Home, Building, MapPinned, Truck, Calendar } from 'lucide-react'
import React, { useState, useCallback } from 'react'
 import Image from 'next/image'
import createOrder from '@/_actions/createOrder'
import { SignInButton, useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { Button } from '../ui/button'
import { UserOrders } from './cart/UserOrders'
import { Order } from '../../../types/order-type'
import payOrder from '@/_actions/payOrder'
import { PagamentoPix } from './payment-pix'
  
interface CartProps {
  isOpen: boolean
  onClose: () => void
}
 
export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
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
    country: 'BR'  
  })
  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState('')
  const { toast } = useToast()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [showOpenOrders, setShowOpenOrders] = useState(false)
  const [hasNewOrders, setHasNewOrders] = useState(true) // Novo estado para simular novas notificações
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null)
  const [cpf, setCpf] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<string | null>(null)
  const [checkoutStep, setCheckoutStep] = useState(0)

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
    setCheckoutStep(0)
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

      console.log(response)
       const paymentData = {
        orderId: response.order.id,
        transaction_amount: total,
        description: `Pedido #${response.order.id}`,
        items: items,
        payment_method_id: paymentMethod,
        payer: {
          email: user?.emailAddresses[0]?.emailAddress || '',
          identification: {
            type: 'CPF',
            number: cpf
          },
          address: {
            zip_code: address.zipCode,
            street_name: address.street,
            street_number: address.number,
            city: address.city,
            federal_unit: address.state,
          }
        }
      }

      const paymentResponse = await payOrder(paymentData)

       
         window.location.href = paymentResponse.init_point
      
    } catch (error) {
      toast({
        title: 'Erro ao criar o pedido',
        description: 'Por favor, verifique os dados e tente novamente.'
      })
      console.log(error) 
    } 
  }
             
  const handleTesteConfirmPurchase = async () => {

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

console.log(response.order.id)
    try {
      let paymentData: any = {
        orderId: response.order.id,// Idealmente, isso deve ser gerado dinamicamente
        transaction_amount: total,
        description: `Pedido #${response.order.id}`,
        payment_method_id: paymentMethod, // Use o método de pagamento selecionado
        items: items,
        payer: {
          email: user?.emailAddresses[0]?.emailAddress || '',
          identification: {
            type: 'CPF',
            number: cpf
          },
          address: {
            zip_code: address.zipCode,
            street_name: address.street,
            street_number: address.number,
            city: address.city,
            federal_unit: address.state,
          }
        }
      };

      const paymentResponse = await payOrder(paymentData);

    window.location.href = paymentResponse.init_point;
     
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
      toast({
        title: 'Erro ao processar o pagamento',
        description: 'Por favor, verifique os dados e tente novamente.',
        variant: 'destructive'
      });
    }
  }

  const handleClosePaymentPix = () => {
    setPaymentInfo(null)
    clearCart()
    setIsCheckingOut(false)
    setOrderConfirmed(false)
    onClose()
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

  const handleNextStep = () => {
    setCheckoutStep(prev => prev + 1)
  }

  const handlePreviousStep = () => {
    setCheckoutStep(prev => prev - 1)
  }

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
    const cpfDigits = cpf.split('').map(el => +el)
    const rest = (count: number) => (
      cpfDigits.slice(0, count-12)
        .reduce((soma, el, index) => (soma + el * (count-index)), 0) * 10
    ) % 11 % 10
    return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10]
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setCpf(value)
    if (value.length === 11) {
      if (validateCPF(value)) {
        setCpfError('')
      } else {
        setCpfError('CPF inválido')
      }
    } else {
      setCpfError('')
    }
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const renderPaymentMethod = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CreditCard className="mr-2 text-primary" size={20} />
          Método de Pagamento
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'credit_card', icon: CreditCard, label: 'Cartão de Crédito' },
            { id: 'debit_card', icon: CreditCard, label: 'Cartão de Débito' },
            { id: 'pix', icon: Smartphone, label: 'PIX' },
            { id: 'boleto', icon: Barcode, label: 'Boleto' },
          ].map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPaymentMethod(method.id)}
              className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center space-y-2 transition-colors ${
                paymentMethod === method.id
                  ? 'border-primary bg-primary-light'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <method.icon size={24} className={paymentMethod === method.id ? 'text-primary' : 'text-gray-500'} />
              <span className={`text-sm font-medium ${paymentMethod === method.id ? 'text-primary' : 'text-gray-700'}`}>
                {method.label}
              </span>
              {paymentMethod === method.id && (
                <CheckCircle size={16} className="text-primary" />
              )}
            </motion.button>
          ))}
        </div>
        <div className="mt-6">
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            value={formatCPF(cpf)}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            className={`w-full p-2 border rounded-md focus:ring-primary focus:border-primary ${
              cpfError ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={14}
          />
          {cpfError && <p className="mt-1 text-sm text-red-600">{cpfError}</p>}
        </div>
        <div className="flex justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePreviousStep}
            className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Voltar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextStep}
            disabled={!paymentMethod || cpfError || cpf.length !== 11}
            className={`bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center ${
              (!paymentMethod || cpfError || cpf.length !== 11) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Próximo
          </motion.button>
        </div>
      </motion.div>
    )
  }

  const isAddressComplete = () => {
    return Object.values(address).every(value => value !== '')
  }

  const renderAddressForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="mr-2 text-primary" size={20} />
          Endereço de Entrega
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <div className="relative">
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={address.zipCode}
                onChange={handleAddressChange}
                placeholder="00000-000"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Rua
            </label>
            <div className="relative">
              <input
                type="text"
                id="street"
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                placeholder="Nome da rua"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={address.number}
              onChange={handleAddressChange}
              placeholder="Número"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={address.complement}
              onChange={handleAddressChange}
              placeholder="Apto, Bloco, etc."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
              Bairro
            </label>
            <div className="relative">
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={address.neighborhood}
                onChange={handleAddressChange}
                placeholder="Bairro"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <div className="relative">
              <input
                type="text"
                id="city"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="Cidade"
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <MapPinned className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={address.state}
              onChange={handleAddressChange}
              placeholder="Estado"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={address.country}
              onChange={handleAddressChange}
              placeholder="País"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNextStep}
          disabled={!isAddressComplete()}
          className={`w-full bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center mt-6 ${
            !isAddressComplete() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Próximo
        </motion.button>
      </motion.div>
    )
  }

  const renderPurchaseSummary = () => {
    const estimatedDeliveryDate = new Date()
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7) // Estimativa de 7 dias para entrega

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <ShoppingBag className="mr-2 text-primary" size={24} />
          Resumo da Compra
        </h3>

        {/* Itens do carrinho */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Itens do Pedido</h4>
          {items.map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center">
                <Image
                  src={item.image.src}
                  alt={item.title}
                  width={50}
                  height={50}
                  className="rounded-md mr-3"
                />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-600">Tamanho: {item.selectedSize}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Endereço de entrega */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 flex items-center mb-2">
            <MapPin className="mr-2 text-primary" size={18} />
            Endereço de Entrega
          </h4>
          <p>{address.street}, {address.number}</p>
          <p>{address.complement}</p>
          <p>{address.neighborhood}</p>
          <p>{address.city} - {address.state}</p>
          <p>{address.zipCode}</p>
          <p>{address.country}</p>
        </div>

        {/* Método de pagamento */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 flex items-center mb-2">
            <CreditCard className="mr-2 text-primary" size={18} />
            Método de Pagamento
          </h4>
          <p>{paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
             paymentMethod === 'debit_card' ? 'Cartão de Débito' :
             paymentMethod === 'pix' ? 'PIX' : 'Boleto'}</p>
          <p className="text-sm text-gray-600">CPF: {cpf}</p>
        </div>

        {/* Informações adicionais */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-700">
              <Truck className="mr-2 text-primary" size={18} />
              Prazo de Entrega Estimado
            </span>
            <span>{estimatedDeliveryDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-700">
              <User className="mr-2 text-primary" size={18} />
              Cliente
            </span>
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-gray-700">
              <Calendar className="mr-2 text-primary" size={18} />
              Data do Pedido
            </span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 0:
        return renderAddressForm()
      case 1:
        return renderPaymentMethod()
      case 2:
        return renderPurchaseSummary()
    }
  }

  const renderCartItems = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {items.length === 0 ? (
          <p className="text-center text-gray-500">Seu carrinho está vazio.</p>
        ) : (
          items.map((item) => (
            <motion.div
              key={`${item.id}-${item.selectedSize}`}
              variants={itemVariants}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={item.image.src}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">Tamanho: {item.selectedSize}</p>
                  <p className="text-sm font-semibold text-primary">R$ {item.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => decrementQuantity(item.id, item.selectedSize)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="font-semibold">{item.quantity}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => incrementQuantity(item.id, item.selectedSize)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Plus size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item.id, item.selectedSize)}
                  className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-500"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    )
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 overflow-y-auto flex flex-col"
          >
            {orderConfirmed ? (
              paymentInfo ? (
                <PagamentoPix
                  paymentInfo={paymentInfo}
                  onClose={handleClosePaymentPix}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <CheckCircle size={64} className="text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Confirmado!</h2>
                  <p className="text-gray-600">Processando pagamento...</p>
                </motion.div>
              )
            ) : (
              <>
                <div className="p-6 bg-gradient-to-r from-primary to-primary-dark text-black">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center">
                      {showOpenOrders ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowOpenOrders(false)}
                            className="mr-2"
                          >
                            <ArrowLeft size={24} />
                          </motion.button>
                          Pedidos em Aberto
                        </>
                      ) : isCheckingOut ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBackToCart}
                            className="mr-2"
                          >
                            <ArrowLeft size={24} />
                          </motion.button>
                          Finalizar Compra
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="mr-2" size={24} />
                          Seu Carrinho
                        </>
                      )}
                    </h2>
                    <div className="flex items-center">
                      {!showOpenOrders && !isCheckingOut && (
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
                      )}
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
                    <UserOrders
                      onClose={() => setShowOpenOrders(false)}
                      
                    />
                  ) : isCheckingOut ? (
                    renderCheckoutStep()
                  ) : (
                    renderCartItems()
                  )}
                </div>
              
                {!showOpenOrders && (
                  <div className="border-t p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={isCheckingOut ? handlePreviousStep : onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 px-6 rounded-lg transition duration-200"
                      >
                        {isCheckingOut ? 'Voltar' : 'Fechar'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={isCheckingOut ? (checkoutStep === 2 ? handleTesteConfirmPurchase : handleNextStep) : handleCheckout}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                      >
                        {isCheckingOut ? (checkoutStep === 2 ? 'Confirmar Compra' : 'Próximo') : 'Finalizar Compra'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
  
        </>
      )}
    </AnimatePresence>
  )
}

