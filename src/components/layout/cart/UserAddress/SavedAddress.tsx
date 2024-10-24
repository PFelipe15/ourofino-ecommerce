import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Loader2 } from 'lucide-react';
import { getCustomerOrCreate } from '@/_actions/Customers';
import { useUser } from '@clerk/nextjs';

interface SavedAddressProps {
  onConfirm: (addressData: any) => void;
}

export const SavedAddress: React.FC<SavedAddressProps> = ({ onConfirm }) => {
  const [savedAddress, setSavedAddress] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useUser();
  useEffect(() => {
    getUserAddress()
  }, []);

  const getUserAddress = async () => {
    setIsLoading(true);  
    const userData = {
      data: {
        first_name: user?.firstName,
        last_name: user?.lastName,
        email: user?.emailAddresses[0]?.emailAddress,
        phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',     
      }
    }
    const customerResponse = await getCustomerOrCreate(userData);
    const customerAddress = customerResponse.attributes?.address
    
    if (customerAddress) {
      setSavedAddress(customerAddress);
    }
    setIsLoading(false); 
  }

  const handleConfirm = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    onConfirm(savedAddress);
    setIsModalOpen(false);
  };

  return (
    <div className=" bg-white rounded-lg shadow-md p-2">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Endereço Salvo</h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
        </div>
      ) : savedAddress ? (
        <div className="p-4 border-2 rounded-lg mb-4 cursor-pointer border-yellow-600 hover:bg-yellow-50 transition-colors duration-200">
          <p className="font-medium">{savedAddress.street}, {savedAddress.number}</p>
          {savedAddress.complement && <p className="text-gray-600">{savedAddress.complement}</p>}
          <p className="text-gray-600">{savedAddress.neighborhood}</p>
          <p className="text-gray-600">{savedAddress.city} - {savedAddress.state}</p>
          <p className="text-gray-600">{savedAddress.zipCode}</p>
          <p className="text-gray-600">{savedAddress.country}</p>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">Nenhum endereço salvo encontrado.</p>
      )}
      <Button 
        onClick={handleConfirm}
        className="w-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors duration-200 py-2 rounded-lg font-medium"
        disabled={isLoading || !savedAddress}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : null}
        Confirmar Endereço
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
          <DialogHeader className="flex flex-col items-center">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={120}
              height={60}
              className="mb-4"
            />
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar Endereço</DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Verifique se o endereço abaixo está correto antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            {savedAddress && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="font-semibold">{savedAddress.street}, {savedAddress.number}</p>
                {savedAddress.complement && <p className="text-gray-600">{savedAddress.complement}</p>}
                <p className="text-gray-600">{savedAddress.neighborhood}</p>
                <p className="text-gray-600">{savedAddress.city} - {savedAddress.state}</p>
                <p className="text-gray-600">{savedAddress.zipCode}</p>
                <p className="text-gray-600">{savedAddress.country}</p>
              </div>
            )}
            <div className="bg-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                Certifique-se de que o endereço está completo e correto para evitar problemas na entrega.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto bg-primary text-white hover:bg-yellow-700"
              disabled={isLoading || !savedAddress}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Confirmar Endereço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
