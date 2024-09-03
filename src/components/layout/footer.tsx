export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex justify-between">
        <div>
          <h3 className="font-bold text-lg mb-2">Contato</h3>
          <p>(11) 1234-5678</p>
          <p>contato@minhaloja.com.br</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Siga-nos</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/instagram.svg" alt="Instagram" className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Endereço</h3>
          <p>Rua Exemplo, 123</p>
          <p>São Paulo, SP</p>
        </div>
      </div>
    </footer>
  );
}
