import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PickupDetailsProps {
  pickupDetails: {
    name: string;
    document: string;
    documentType: string;
  };
  setPickupDetails: (details: { name: string; document: string; documentType: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const PickupDetails: React.FC<PickupDetailsProps> = ({
  pickupDetails,
  setPickupDetails,
  onSave,
  onCancel,
  isEditing
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPickupDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-white">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}
      </h4>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Responsável
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={pickupDetails.name}
            onChange={handleChange}
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
            Documento de Identificação
          </label>
          <input
            type="text"
            id="document"
            name="document"
            value={pickupDetails.document}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button onClick={onSave}>
          <User className="mr-2" size={16} />
          {isEditing ? 'Atualizar Perfil' : 'Salvar Novo Perfil'}
        </Button>
      </div>
    </div>
  );
};