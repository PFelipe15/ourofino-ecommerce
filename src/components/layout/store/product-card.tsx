  
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductProps } from '../../../../types/product-type';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';

const classificacoes = {
  P: { min: 9, max: 18 },
  M: { min: 19, max: 24 },
  G: { min: 25, max: 30 },
};

export default function ProductCard({ product }: { product: ProductProps }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedClassificacao, setSelectedClassificacao] = useState('P');
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState(parseFloat(product.variants[0].price));
  const [priceChanged, setPriceChanged] = useState(false);
  const [priceDifference, setPriceDifference] = useState(0);
  const firstImage = product.images[0];
  const secondImage = product.images[1];
  const firstVariant = product.variants[0];
  const [quantity, setQuantity] = useState(1);
  const handleOpenOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowOptions(true);
  };

  const {toast } = useToast()
  const handleComprar = (e: React.MouseEvent) => {
    e.preventDefault();
    const selectedVariant = product.variants.find(
      variant => variant.option1 === selectedClassificacao && variant.option2 === selectedSize
    );
    if (selectedVariant) {
      const itemToAdd = {
        ...product,
        variants: [selectedVariant], // Apenas a variante selecionada
        price: selectedVariant.price, // Preço da variante selecionada
      };
      toast({
        title:"Produto adicionado ao carrinho",
        description:"Produto adicionado ao carrinho com sucesso"
        
      })
      addItem(itemToAdd, quantity, selectedSize);
     } else {
      // Tratar o caso em que nenhuma variante é encontrada
      console.error("Nenhuma variante encontrada para a seleção atual");
      // Você pode adicionar uma notificação para o usuário aqui
    }
  };

  const { addItem } = useCartStore();

  const filteredSizes = useMemo(() => {
    return product.variants
      .filter(variant => variant.option1 === selectedClassificacao)
      .map(variant => variant.option2)
      .filter((size, index, self) => self.indexOf(size) === index)
      .sort((a, b) => parseInt(a) - parseInt(b));
  }, [selectedClassificacao, product.variants]);

  useEffect(() => {
    const selectedVariant = product.variants.find(
      variant => variant.option1 === selectedClassificacao && variant.option2 === selectedSize
    );
    if (selectedVariant) {
      const newPrice = parseFloat(selectedVariant.price);
      setPriceDifference(newPrice - currentPrice); // Atualiza a diferença de preço
      setCurrentPrice(newPrice);
      setPriceChanged(true);
      setTimeout(() => setPriceChanged(false), 500); // Reset the animation state after 500ms
    }
  }, [selectedSize, selectedClassificacao, product.variants, currentPrice]);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setPriceChanged(true);
    const selectedVariant = product.variants.find(variant => variant.option2 === size);
    if (selectedVariant) {
      const newPrice = parseFloat(selectedVariant.price);
      setPriceDifference(newPrice - currentPrice); // Atualiza a diferença de preço
      setCurrentPrice(newPrice);
    }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const PriceInfo = () => (
    <>
      {firstVariant && (
        <motion.p
          className="text-primary font-bold text-xl mb-4"
          transition={{ duration: 0.5 }}
        >
          R$ {currentPrice.toFixed(2)}  
          
        </motion.p>
      )}
    </>
  );

  const handleAddToCart = () => {
    setShowOptions(true);
    addItem(product, quantity, selectedSize);
  };

  return (
    <div className='relative w-full max-w-xs bg-white shadow-sm rounded-lg overflow-hidden'>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={isHovered ? 'second' : 'first'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8}}
              className="absolute inset-0"
            >
              <motion.img
                src={isHovered && secondImage ? secondImage.src : firstImage.src}
                alt={(isHovered && secondImage ? secondImage.alt : firstImage.alt) || product.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="p-4 text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.title}</h2>
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
            <span className="ml-1 text-xs text-gray-600">({product.variants.length})</span>
          </div>
          <PriceInfo />
          <motion.button 
            className="w-full bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:hover:bg-yellow-700 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenOptions}
          >
            COMPRAR
          </motion.button>
          <Link href={`/produto/${product.id}`}>
            <motion.button
              className="w-full bg-secondary text-white py-2 px-4 rounded-md text-sm font-medium hover:hover:bg-yellow-700 transition-colors duration-300 mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              DETALHES
            </motion.button>
          </Link>
        </div>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: '38%' }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 right-0 bottom-0 bg-white p-6 rounded-lg shadow-lg overflow-y-auto"
            >
              <button 
                onClick={() => setShowOptions(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{product.title}</h2>
              <PriceInfo />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Classificação</label>
                <div className="flex space-x-2">
                  {Object.keys(classificacoes).map((classificacao) => (
                    <button
                      key={classificacao}
                      className={`px-3 py-1 rounded-full ${
                        selectedClassificacao === classificacao
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setSelectedClassificacao(classificacao)}
                    >
                      {classificacao}
                    </button>
                  ))}
                </div>
              </div>
              <div className='flex gap-4 my-2'>
                <div className="flex-1">
                  <label htmlFor="tamanho-anel" className="flex text-sm font-medium text-gray-700 mb-1">Tamanho do anel</label>
                  <select
                    id="tamanho-anel"
                    value={selectedSize}
                    onChange={(e) => handleSelectSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecione</option>
                    {filteredSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className=" text-sm flex  font-medium text-gray-700 mb-1">Quantidade</label>
                  <div className='flex items-center'>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        className="px-3 py-2 text-gray-600"
                        onClick={handleDecrement}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        className="w-8 text-center border-none focus:ring-0 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        readOnly
                      />
                      <button 
                        className="px-3 py-2 text-gray-600"
                        onClick={handleIncrement}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                className="w-full bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:hover:bg-yellow-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComprar}
              >
                COMPRAR
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}