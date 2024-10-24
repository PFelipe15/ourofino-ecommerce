import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface ThankYouMessageProps {
  onClose: () => void;
  setShowOpenOrders: () => void;
}

export const ThankYouMessage: React.FC<ThankYouMessageProps> = ({ onClose, setShowOpenOrders }) => {
  const { resetCart, clearLocalStorage, resetStep } = useCartStore();

  const handleClose = () => {
    resetStep();
    onClose();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white">
   
      <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
       <h2 className="text-2xl font-bold mb-2">Obrigado pela sua compra!</h2>
      <p className="text-gray-600 mb-4">
        A Ourofino agradece pela sua preferência. Seu pedido foi recebido e está sendo processado.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Em breve, você receberá um e-mail com os detalhes do seu pedido.
      </p>
      <div className="flex space-x-4">
        <Button 
          onClick={() => {
            resetCart();
            clearLocalStorage();
            setShowOpenOrders();
          }} 
          className="w-full"
          variant="outline"
        >
          Ver Pedidos Abertos
        </Button>
        <Button onClick={handleClose} className="bg-yellow-600 hover:bg-yellow-700 text-white">
          Fechar
        </Button>
      </div>
    </div>
  );
};
