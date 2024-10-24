import React, { useState } from 'react';
import { User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';

interface PickupInStoreProps {
  onConfirm: (pickupDetails: PickupDetails) => void;
}

interface PickupDetails {
  name: string;
  document: string;
  documentType: string;
}

export const PickupInStore: React.FC<PickupInStoreProps> = ({ onConfirm }) => {
  const [pickupDetails, setPickupDetails] = useState<PickupDetails>({
    name: '',
    document: '',
    documentType: 'cpf',
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPickupDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmDialogOpen(false);
    onConfirm(pickupDetails);
  };

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-white">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Retirada na Loja</h4>
      <p className="text-sm text-gray-600 mb-4">
        Preencha os dados da pessoa que irá retirar o pedido na loja.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Responsável pela Retirada
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={pickupDetails.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            id="documentType"
            name="documentType"
            value={pickupDetails.documentType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="cpf">CPF</option>
            <option value="identidade">Identidade</option>
          </select>
        </div>
        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
            Número do Documento
          </label>
          <input
            type="text"
            id="document"
            name="document"
            value={pickupDetails.document}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <Button type="submit" className="w-full">
          <User className="mr-2" size={16} />
          Confirmar Retirada na Loja
        </Button>
      </form>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">Confirmar Retirada</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="flex justify-center mb-6">
              <Image
                src={"./logotipoourofino.svg"}
                alt="Logo da Loja"
                width={160}
                height={160}
                
              />
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-700">
                Por favor, confirme se os dados abaixo estão corretos para a retirada do pedido na loja.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome do Responsável</p>
                  <p className="text-lg font-semibold text-gray-800">{pickupDetails.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Documento</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {pickupDetails.documentType === 'cpf' ? 'CPF' : 'Identidade'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Número do Documento</p>
                  <p className="text-lg font-semibold text-gray-800">{pickupDetails.document}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="">
            <Button onClick={() => setIsConfirmDialogOpen(false)} variant="outline" className="mr-2">
              Editar Dados
            </Button>
            <Button onClick={handleConfirm}>
              Confirmar e Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};