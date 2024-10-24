import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

interface AuthorizedPerson {
  name: string;
  document: string;
  documentType: string;
  isEnabled: boolean;
}

interface AuthorizedPeopleProps {
  authorizedPeople: AuthorizedPerson[];
  onCreateNew: () => void;
  onEdit: (person: AuthorizedPerson) => void;
  onDelete: (document: string) => void;
  onToggleEnable: (document: string) => void;
}

export const AuthorizedPeople: React.FC<AuthorizedPeopleProps> = ({
  authorizedPeople,
  onCreateNew,
  onEdit,
  onDelete,
  onToggleEnable
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState<AuthorizedPerson | null>(null);
  const [action, setAction] = React.useState<'edit' | 'delete' | null>(null);

  const handleAction = (person: AuthorizedPerson, actionType: 'edit' | 'delete') => {
    setSelectedPerson(person);
    setAction(actionType);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    if (action === 'edit' && selectedPerson) {
      onEdit(selectedPerson);
    } else if (action === 'delete' && selectedPerson) {
      onDelete(selectedPerson.document);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-white">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Pessoas Habilitadas</h4>
      <p className="text-sm text-gray-600 mb-4">
        Selecione quem está autorizado a retirar os produtos na loja. Apenas pessoas habilitadas poderão fazer a retirada.
      </p>
      {authorizedPeople.length > 0 ? (
        <ul className="space-y-2">
          {authorizedPeople.map((person) => (
            <li key={person.document} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center">
                <User className={`mr-2 rounded-md h-9 ${person.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={person.isEnabled ? 'font-semibold' : ''}>{person.name}</span>
              </div>
              <div className="flex items-center">
                <Switch
                  checked={person.isEnabled}
                  onCheckedChange={() => onToggleEnable(person.document)}
                  className="mr-2"
                />
                <Button
                  onClick={() => handleAction(person, 'edit')}
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  onClick={() => handleAction(person, 'delete')}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2Icon size={16} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Nenhuma pessoa cadastrada.</p>
      )}
      <Button
        onClick={onCreateNew}
        className="mt-4 w-full"
        variant="outline"
      >
        <Plus className="mr-2" size={16} />
        Criar Novo Perfil
      </Button>

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
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {action === 'edit' ? 'Editar Pessoa Autorizada' : 'Remover Pessoa Autorizada'}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              {action === 'edit' 
                ? 'Deseja editar as informações desta pessoa autorizada?' 
                : 'Tem certeza que deseja remover esta pessoa da lista de autorizados?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            {selectedPerson && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="font-semibold">{selectedPerson.name}</p>
                <p className="text-gray-600">{selectedPerson.documentType}: {selectedPerson.document}</p>
              </div>
            )}
            <div className="bg-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                {action === 'edit' 
                  ? 'Certifique-se de manter as informações atualizadas para evitar problemas na retirada dos produtos.' 
                  : 'Ao remover esta pessoa, ela não poderá mais retirar produtos em seu nome.'}
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto bg-primary text-white hover:bg-yellow-700"
            >
              {action === 'edit' ? 'Confirmar Edição' : 'Confirmar Remoção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
