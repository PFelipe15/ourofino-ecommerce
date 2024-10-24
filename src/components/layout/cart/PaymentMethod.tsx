// src/components/layout/cart/PaymentMethod.tsx
import React, { useState } from 'react';
import { CreditCard, Banknote, QrCode, Info, Star, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import Image from 'next/image';
import { MetodosPagamento } from '../../../../types/metodos_pagamento';

interface PaymentMethodProps {
  onNext: (selectedMethod: string) => void;
  onPrevious: () => void;
  availableMethods: MetodosPagamento[];
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ onNext, onPrevious, availableMethods }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [visibleMethods, setVisibleMethods] = useState(5); // Inicialmente mostra 5 métodos

  const handleNext = () => {
    if (selectedMethod) {
      onNext(selectedMethod);
    }
  };

  // Função para ordenar os métodos de pagamento
  const sortPaymentMethods = (methods: MetodosPagamento[]) => {
    const priorityOrder = ['pix', 'visa', 'bolbradesco', 'mastercard', 'elo'];
    return methods.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.id.toLowerCase());
      const bIndex = priorityOrder.indexOf(b.id.toLowerCase());
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  };

  const sortedMethods = sortPaymentMethods(availableMethods);

  const isHighlighted = (method: MetodosPagamento) => {
    const highlightedMethods = ['pix', 'visa', 'bolbradesco', 'mastercard'];
    return highlightedMethods.includes(method.id.toLowerCase());
  };

  const loadMore = () => {
    setVisibleMethods(prev => prev + 5); // Carrega mais 5 métodos
  };

  return (
    <div className="max-w-md mx-auto bg-white p-2 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-2">Escolha o método de pagamento</h2>
      <p className="text-gray-600 mb-6">Selecione a opção que melhor atende às suas necessidades</p>

      <div className="space-y-4 p-2 max-h-[400px] overflow-y-auto">
        {sortedMethods.slice(0, visibleMethods).map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={selectedMethod === method.id}
            onSelect={() => setSelectedMethod(method.id)}
            isHighlighted={isHighlighted(method)}
          />
        ))}
      </div>

      {visibleMethods < sortedMethods.length && (
        <Button 
          onClick={loadMore} 
          variant="outline" 
          className="w-full mt-4 flex items-center justify-center"
        >
          Carregar mais opções <ChevronDown className="ml-2" />
        </Button>
      )}

      <div className="mt-8">
         
        <Button 
          disabled={!selectedMethod}
          onClick={handleNext}
          className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

interface PaymentMethodCardProps {
  method: MetodosPagamento;
  isSelected: boolean;
  onSelect: () => void;
  isHighlighted: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, isSelected, onSelect, isHighlighted }) => {
  const formatApprovalTime = (minutes: number) => {
    if (minutes === 0) {
      return "Mesmo Instante";
    } else if (minutes < 60) {
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hora${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` e ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}` : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days} dia${days > 1 ? 's' : ''}${remainingHours > 0 ? ` e ${remainingHours} hora${remainingHours > 1 ? 's' : ''}` : ''}`;
    }
  };

  const getPaymentTypeInPortuguese = (paymentTypeId: string, methodName: string) => {
    switch (paymentTypeId) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit_card':
        return 'Cartão de Débito';
      case 'bank_transfer':
        return 'Transferência Bancária';
      case 'ticket':
        return 'Boleto';
      default:
        // Se o nome do método já for "Boleto", não repetimos
        return methodName.toLowerCase() === 'boleto' ? '' : paymentTypeId;
    }
  };

  const approvalTime = formatApprovalTime(method.accreditation_time);
  const paymentType = getPaymentTypeInPortuguese(method.payment_type_id, method.name);

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-yellow-600' : 'hover:bg-gray-50'
      } ${isHighlighted ? 'bg-yellow-50' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="flex items-center p-4">
        <Image
          src={method.secure_thumbnail}
          alt={method.name}
          width={40}
          height={40}
          className="mr-4"
        />
        <div className="flex-grow">
          <div className="flex items-center">
            <h3 className="font-semibold text-lg">{method.name}</h3>
            {isHighlighted && (
              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                <Star size={12} className="mr-1" /> Destaque
              </span>
            )}
          </div>
          {paymentType && <p className="text-sm text-gray-600">{paymentType}</p>}
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={14} className="mr-1 text-yellow-600" />
                </TooltipTrigger>
                <TooltipContent>
                  Tempo de aprovação: {approvalTime}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>Tempo de aprovação: {approvalTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
