import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Truck } from 'lucide-react';
import { cotarFreteCliente } from '@/_actions/MelhorEnvio';
import { ResponseDataMelhorEnvio } from '../../../../../types/melhor-envio';  
import Image from 'next/image';

interface ShippingOptionsProps {
  zipCode: string;
  onSelect: (option: ResponseDataMelhorEnvio) => void;
  onBack: () => void;
}

export const ShippingOptions: React.FC<ShippingOptionsProps> = ({ zipCode, onSelect, onBack }) => {
  const [shippingOptions, setShippingOptions] = useState<ResponseDataMelhorEnvio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const options = await cotarFreteCliente(zipCode, 1, 20, 20, 20);
        // Filtra as opções para remover aquelas com erro
        const validOptions = options.filter(option => !option.error);
        setShippingOptions(validOptions);
      } catch (err) {
        setError('Não foi possível carregar as opções de frete. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingOptions();
  }, [zipCode]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        <Button onClick={onBack} className="mt-4">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Opções de Frete</h3>
      {shippingOptions.map((option) => (
        <div key={option.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {option.company.picture ? (
                <Image 
                  src={option.company.picture} 
                  alt={option.company.name} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              ) : (
                <Truck className="text-yellow-600 w-10 h-10" />
              )}
              <div>
                <p className="font-semibold">{option.name}</p>
                <p className="text-sm text-gray-600">
                  {option.company.name}
                </p>
                <p className="text-xs text-gray-500">
                  Entrega em até {option.delivery_time} dias úteis
                </p>
              </div>
            </div>
            <div className="text-right">
              {option.discount && parseFloat(option.discount) > 0 && (
                <div className="mb-1">
                  <span className="text-xs line-through text-gray-500">
                    R$ {(parseFloat(option.price || '0') + parseFloat(option.discount)).toFixed(2)}
                  </span>
                  <span className="ml-1 text-xs text-green-600 font-semibold">
                    -{option.discount}
                  </span>
                </div>
              )}
              <p className="font-bold text-lg">
                R$ {parseFloat(option.price || '0').toFixed(2)}
              </p>
              <Button 
                onClick={() => onSelect(option)}
                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Selecionar
              </Button>
            </div>
          </div>
        </div>
      ))}
     
    </div>
  );
};
