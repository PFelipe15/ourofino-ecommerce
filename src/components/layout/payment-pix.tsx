import Image from 'next/image';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';

interface PagamentoPixProps {
  paymentInfo: any; // Idealmente, você deve criar uma interface específica para o retorno da API
  onClose: () => void;
}

export function PagamentoPix({ paymentInfo, onClose }: PagamentoPixProps) {
  const [copiaCola, setCopiaCola] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (paymentInfo?.point_of_interaction?.transaction_data?.qr_code) {
      setCopiaCola(paymentInfo.point_of_interaction.transaction_data.qr_code);
    }
  }, [paymentInfo]);

  const copiarCodigoPixParaClipboard = () => {
    navigator.clipboard.writeText(copiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  if (!paymentInfo) {
    return <p>Carregando informações de pagamento...</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Pagamento PIX</h2>
        
        <div className="mb-6 flex justify-center">
          {paymentInfo.point_of_interaction?.transaction_data?.qr_code_base64 ? (
            <Image
              src={`data:image/png;base64,${paymentInfo.point_of_interaction.transaction_data.qr_code_base64}`}
              alt="QR Code PIX"
              width={200}
              height={200}
              className="rounded-lg shadow-md"
            />
          ) : copiaCola ? (
            <QRCodeSVG value={copiaCola} size={200} />
          ) : (
            <p>QR Code não disponível</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Código PIX Copia e Cola</h3>
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
            <input
              type="text"
              value={copiaCola}
              readOnly
              className="flex-grow p-3 bg-transparent text-sm"
            />
            <button
              onClick={copiarCodigoPixParaClipboard}
              className={`p-3 ${copiado ? 'bg-green-500' : 'bg-primary'} text-white hover:opacity-90 transition-colors`}
            >
              {copiado ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-6 text-sm text-gray-600">
          <p><strong>Valor:</strong> R$ {paymentInfo.transaction_amount.toFixed(2)}</p>
          <p><strong>Status:</strong> {paymentInfo.status}</p>
          <p><strong>Descrição:</strong> {paymentInfo.description}</p>
          <p><strong>Expira em:</strong> {new Date(paymentInfo.date_of_expiration).toLocaleString()}</p>
        </div>

        {paymentInfo.point_of_interaction?.transaction_data?.ticket_url && (
          <a
            href={paymentInfo.point_of_interaction.transaction_data.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors mb-4"
          >
            Abrir página de pagamento
          </a>
        )}

        <button
          onClick={() => onClose()} // Alteração aqui
          className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
