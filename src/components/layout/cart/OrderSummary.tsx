import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { User, MapPin, CreditCard, Truck } from 'lucide-react';

interface OrderSummaryProps {
  deliveryMethod: 'pickup' | 'delivery';
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pickupDetails?: {
    name: string;
    document: string;
  };
  paymentMethod: string;
  shippingOption?: {
    name: string;
    company: { name: string };
    delivery_time: string;
    price: string;
  };
  customerName: string;
  customerEmail: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  deliveryMethod,
  address,
  pickupDetails,
  paymentMethod,
  shippingOption,
  customerName,
  customerEmail
}) => {
  const { items } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + ((item.price ?? 0) * item.quantity), 0);
  const shippingCost = parseFloat(shippingOption?.price ?? '0');
  const total = subtotal + shippingCost;

  const SummaryItem = ({ icon: Icon, title, content }: { icon: React.ElementType; title: string; content: React.ReactNode }) => (
    <div className="flex items-start space-x-3 mb-4">
      <Icon className="text-yellow-600 mt-1" size={18} />
      <div>
        <h4 className="font-medium text-sm text-gray-700">{title}</h4>
        <p className="text-sm text-gray-600">{content}</p>
      </div>
    </div>
  );

  const renderDeliveryInfo = () => {
    if (deliveryMethod === 'pickup') {
      return (
        <SummaryItem
          icon={MapPin}
          title="Retirada na Loja"
          content={
            pickupDetails
              ? `Pessoa autorizada: ${pickupDetails.name}\nDocumento: ${pickupDetails.document}`
              : 'Nenhuma pessoa autorizada selecionada'
          }
        />
      );
    } else if (address) {
      return (
        <>
          <SummaryItem
            icon={MapPin}
            title="Endereço de Entrega"
            content={`${address.street}, ${address.number}\n${address.neighborhood}, ${address.city} - ${address.state}\nCEP: ${address.zipCode}`}
          />
          {shippingOption && (
            <SummaryItem
              icon={Truck}
              title="Método de Envio"
              content={
                <div>
                  <p>{shippingOption.name} - {shippingOption.company.name}</p>
                  <p className="text-xs">Entrega em até {shippingOption.delivery_time} dias úteis</p>
                  <p className="font-semibold">R$ {parseFloat(shippingOption.price).toFixed(2)}</p>
                </div>
              }
            />
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
      
      <SummaryItem
        icon={User}
        title="Informações do Cliente"
        content={`${customerName}\n${customerEmail}`}
      />

      {renderDeliveryInfo()}

      <SummaryItem
        icon={CreditCard}
        title="Método de Pagamento"
        content={paymentMethod}
      />

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Itens do Pedido</h3>
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center mb-2 text-sm">
            <span>{item?.attributes?.name} (x{item.quantity})</span>
            <span className="font-medium">R$ {((item.price ?? 0) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span>Subtotal:</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2 text-sm">
          <span>Frete:</span>
          <span>R$ {shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold mt-2 pt-2 border-t">
          <span>Total:</span>
          <span className="text-yellow-600">R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
