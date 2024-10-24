'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, X, Calendar, DollarSign, Eye, CreditCard, XCircle, CheckCircle } from 'lucide-react'
import {getOrdersByCustomer} from '@/_actions/Orders'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { UpdateOrder } from '@/_actions/Orders'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

interface UserOrdersProps {
  onClose: () => void
}

 
 
export interface ResponseData {
  id: number
  attributes: Attributes
  items: Item[]
}

export interface Attributes {
  createdAt: string
  updatedAt: string
  publishedAt: string
  status: string
  order_date: string
  total: number
  link_payment: string
  payment_id: string
}

export interface Item {
  id: number
  attributes: Attributes2
}

export interface Attributes2 {
  quantity: number
  subtotal: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  size: number
  order: Order
  product: Product
}

export interface Order {
  data: Data
}

export interface Data {
  id: number
  attributes: Attributes3
}

export interface Attributes3 {
  createdAt: string
  updatedAt: string
  publishedAt: string
  status: string
  order_date: string
  total: number
  link_payment: string
  payment_id: string
}

export interface Product {
  data: Data2
}

export interface Data2 {
  id: number
  attributes: Attributes4
}

export interface Attributes4 {
  name: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  description: string
  active: boolean
  hot: any
}


export const UserOrders = ({ onClose }: UserOrdersProps) => {
  const [openOrders, setOpenOrders] = useState<ResponseData[] | []>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCanceled, setHasCanceled] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para controlar o diálogo
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null); // ID do pedido selecionado para cancelamento
  const fetchOpenOrders = useCallback(async () => {  
    if (user) {
      setIsLoading(true);
      try {
        const responseOrders:ResponseData[] = await getOrdersByCustomer(user.emailAddresses[0].emailAddress); 
         setOpenOrders(responseOrders);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);  

  useEffect(() => {
    fetchOpenOrders();
  }, [fetchOpenOrders]); // Mantém 'fetchOpenOrders' como dependência
 
  const getStatusColor = (status: string) => {
    switch (status) {
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

  const translateStatus = (status: string | undefined) => {
    switch (status) {
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

  const handlePayment = (link: string) => {
    window.open(link, '_blank');
  };

  const handleCancelOrder = (orderId: number) => {
    setSelectedOrderId(orderId); // Armazena o ID do pedido selecionado
    setIsDialogOpen(true); // Abre o diálogo de confirmação
  };

  const confirmCancelOrder = async () => {
    if (selectedOrderId) {
      try {
        await UpdateOrder(selectedOrderId, {status:'cancelled'});
        fetchOpenOrders(); // Recarrega os pedidos após o cancelamento
        setHasCanceled(true);
        toast({
          title: "Pedido Cancelado",
          description: `O pedido #${selectedOrderId} foi cancelado com sucesso.`,
          variant: "success",
          duration: 3000,
        });   
      } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        toast({
          title: "Erro ao cancelar pedido",
          description: `O pedido #${selectedOrderId} não foi cancelado, fale com um atendente.`,
          variant: "destructive",
          duration: 3000,
        });  
      } finally {
        setIsDialogOpen(false); // Fecha o diálogo após a confirmação
        setSelectedOrderId(null); // Reseta o ID do pedido selecionado
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrderId(null); // Reseta o ID do pedido selecionado
  };

  return (
    <div className="flex flex-col h-full p-2 bg-gray-50 rounded-lg shadow-lg">
      

      <div className="flex justify-between text-sm mb-4">
        <input 
          type="text" 
          placeholder="Buscar pedido..." 
          className="border rounded-md p-2 w-1/3" 
        />
        <select className="border rounded-md p-2 w-1/4">

          <option defaultChecked={true} value="all">Todos</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="flex-grow overflow-y-auto">
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
            {openOrders && (
              openOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md mb-4 p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Pedido #{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.attributes.status)}`}>
                      {translateStatus(order.attributes.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="flex items-center">
                      <Calendar className="mr-2" size={14} />
                      {new Date(order.attributes.createdAt).toLocaleDateString()}
                    </p>
                    <p className="flex items-center">
                      <DollarSign className="mr-2" size={14} />
                      R$ {order.attributes.total}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-md mb-2">
                    <h4 className="font-semibold text-gray-800 mb-2">Produtos:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
                        <div className="flex flex-col">
                            <p className="font-medium text-gray-900">{item.attributes?.product.data?.attributes?.name}</p>
                          <p className="text-sm text-gray-600">Qtd: {item.attributes.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-800">R$ {item.attributes.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center gap-3 flex-col">
                    {order.attributes.status === 'pending' && ( // Verifica se o status é 'pending'
                      <>
                        <button
                          onClick={() => handlePayment(order.attributes.link_payment)}
                          className="flex items-center justify-center w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors shadow-md"
                        >
                          <CheckCircle className="mr-2" size={18} />
                          Pagar
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center justify-center w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors shadow-md"
                        >
                          <XCircle className="mr-2" size={18} />
                          Cancelar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {/* lógica para ver detalhes */}}
                      className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors shadow-md"
                    >
                      <Eye className="mr-2" size={18} />
                      Detalhes
                    </button>
                  </div>
                </motion.div>
              ))
            )}
           </AnimatePresence>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
          <DialogHeader className="flex flex-col items-center">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={120}
              height={60}
              className="mb-4"
            />
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar Cancelamento</DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Você tem certeza que deseja cancelar este pedido?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <p className="text-sm text-gray-500 text-center">
              Ao cancelar, você não poderá desfazer esta ação. O pedido será cancelado permanentemente.
            </p>
            <div className="bg-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                Lembre-se: Se tiver dúvidas sobre o cancelamento, entre em contato com nosso suporte antes de prosseguir.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
