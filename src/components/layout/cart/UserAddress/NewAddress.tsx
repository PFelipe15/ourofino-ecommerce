import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { cotarFreteCliente } from '@/_actions/MelhorEnvio';

interface NewAddressProps {
  onConfirm: (address: any) => void;
}

export const NewAddress: React.FC<NewAddressProps> = ({ onConfirm }) => {
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    onConfirm(address);
    setIsModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-2xl font-semibold mb-6">Novo Endereço de Entrega</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          name="street"
          value={address.street}
          onChange={handleChange}
          placeholder="Rua"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          name="number"
          value={address.number}
          onChange={handleChange}
          placeholder="Número"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          name="complement"
          value={address.complement}
          onChange={handleChange}
          placeholder="Complemento"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <input
          type="text"
          name="neighborhood"
          value={address.neighborhood}
          onChange={handleChange}
          placeholder="Bairro"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="Cidade"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          name="state"
          value={address.state}
          onChange={handleChange}
          placeholder="Estado"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          placeholder="CEP"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
        Confirmar Novo Endereço
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
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar Novo Endereço</DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Verifique se o endereço abaixo está correto antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <p className="font-semibold">{address.street}, {address.number}</p>
              {address.complement && <p className="text-gray-600">{address.complement}</p>}
              <p className="text-gray-600">{address.neighborhood}</p>
              <p className="text-gray-600">{address.city} - {address.state}</p>
              <p className="text-gray-600">CEP: {address.zipCode}</p>
            </div>
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
              Editar
            </Button>
            <Button
              onClick={handleModalConfirm}
              className="w-full sm:w-auto bg-primary text-white hover:bg-yellow-700"
            >
              Confirmar Endereço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};
