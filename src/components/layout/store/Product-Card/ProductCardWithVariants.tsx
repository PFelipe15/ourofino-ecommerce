'use client'
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
 import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/hooks/use-toast';
 import { FaHeart } from 'react-icons/fa';
 import { useUser } from '@clerk/nextjs';
import { getHasFavoriteProduct, createFavoriteProduct, deleteFavoriteProduct } from '@/_actions/handleFavoriteProduct';
import { ProductsData } from '../../../../../types/product-all-strape';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const classificacoes = {
  P: { min: 9, max: 18 },
  M: { min: 19, max: 24 },
  G: { min: 25, max: 30 },
};

export default function ProductCardWithVariants({ product }: { product: ProductsData }) {
  
  
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedSize, setSelectedSize] = useState('9');
  const [priceChanged, setPriceChanged] = useState(false);
  const [priceDifference, setPriceDifference] = useState(0);
  const [selectedClassificacao, setSelectedClassificacao] = useState('P');
  



  const currentPricePrimary = product.attributes.price_primary

  const [currentPrice, setCurrentPrice] = useState<number | undefined>(currentPricePrimary);  
  
  const [quantity, setQuantity] = useState(1);
  

  const { user } = useUser()

  const [isFavorite, setIsFavorite] = useState(false); // Estado para verificar se é favorito
   
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const hasFavorite = await getHasFavoriteProduct(product.id, user?.emailAddresses[0]?.emailAddress);
      setIsFavorite(hasFavorite);
    };

    if (user?.emailAddresses[0]?.emailAddress) {
      checkFavoriteStatus();
    }
  }, [product.id, user]);

  const handleOpenOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowOptions(true);
  };

  const {toast } = useToast()
  const handleComprar = (e: React.MouseEvent) => {
    e.preventDefault();
    const selectedVariant = product.attributes.variants_price.variantes.find(
      (variante) => parseInt(variante.tamanho_minimo) <= parseInt(selectedSize) && parseInt(variante.tamanho_maximo) >= parseInt(selectedSize)
    );
 
    if (!selectedVariant) {
      toast({
        title: "Tamanho inválido",
        description: "Por favor, selecione um tamanho válido.",
      });
      return;
    }

    addItem({
      ...product,
      attributes: {
        ...product.attributes,
       }
    }, quantity, selectedVariant.preco, selectedSize);

    toast({
      title: "Produto adicionado ao carrinho ",
      description: "Produto adicionado ao carrinho com sucesso",
      
    });
  };

  const { addItem } = useCartStore();

 
  const [availableSizes, setAvailableSizes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const sizeStock: { [key: string]: number } = {};
    product.attributes.variants_price.variantes.forEach(variante => {
      if (variante.classificacao === selectedClassificacao) {
        variante.tamanhos_estoque.forEach(item => {
          if (item.estoque > 0) {
            sizeStock[item.tamanho.toString()] = item.estoque;
          }
        });
      }
    });
    setAvailableSizes(sizeStock);
    setSelectedSize(''); // Reset selected size when classification changes
  }, [product, selectedClassificacao]);

  const handleSelectSize = (size: string) => {
    if (availableSizes[size] && availableSizes[size] > 0) {
      setSelectedSize(size);
      const selectedVariant = product.attributes.variants_price.variantes.find(
        variante => parseInt(variante.tamanho_minimo) <= parseInt(size) && parseInt(variante.tamanho_maximo) >= parseInt(size)
      );
      if (selectedVariant) {
        setCurrentPrice(selectedVariant.preco);
      }
    } else {
      toast({
        title: "Tamanho indisponível",
        description: "Este tamanho está fora de estoque no momento.",
        variant: "destructive"
      });
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleSelectClassificacao = (classificacao: string) => {
    setSelectedClassificacao(classificacao);
  };

  const PriceInfo = () => (
    <div className="flex items-center justify-center mb-4">
      <span className="text-lg font-bold text-gray-800">
        {typeof currentPrice === 'number' ? `R$ ${currentPrice.toFixed(2)}` : currentPrice}
      </span>
      {priceChanged && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className={`ml-2 text-sm ${priceDifference > 0 ? 'text-red-500' : 'text-green-500'}`}
        >
          {priceDifference > 0 ? `+${priceDifference.toFixed(2)}` : priceDifference.toFixed(2)}
        </motion.span>
      )}
    </div>
  );

  const isHotProduct = product.attributes.hot; // Verifica se o produto está em destaque

  const handleToggleFavorite = async () => {
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      toast({
        title: "Email do cliente não encontrado.",
        description: "Por favor, faça login para adicionar produtos aos favoritos.",
      });
      return; // Retorna se o email não estiver disponível
    }

    if (isFavorite) {
      await deleteFavoriteProduct(product.id, email);
      setIsFavorite(false);
    } else {
      try {
        const userSerialiedData = {
          data:{
            first_name: user?.firstName,
            last_name: user?.lastName,
            email: user?.emailAddresses[0]?.emailAddress,       
            phone: user?.phoneNumbers[0]?.phoneNumber,            
          }
        }
        await createFavoriteProduct(product.id, userSerialiedData );
        setIsFavorite(true);
      } catch (error) {
        console.error("Erro ao criar favorito:", error);
      }
    }
  };

  return (
    <div className='relative w-full max-w-xs bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl'>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group"
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={isHovered ? 'second' : 'first'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {isHotProduct && (
                <motion.div 
                  className="absolute top-2 left-2 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center justify-center z-10"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="mr-1.5">★</span>
                  <span>Destaque</span>
                </motion.div>
              )}

              <motion.img
                src={isHovered ? 'http://localhost:1337/uploads/a6444_pra_site_46f5c4373c8db73ee017169919630466_480_0_7afdbb24f4.webp' : 'http://localhost:1337/uploads/a6444_a04bc83c6fe3c9878417169919633250_320_0_fe38e3860c.webp'}
                alt={product.attributes.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="p-4 text-center flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">{product.attributes.name}</h2>
          <PriceInfo />
          
          <div className='flex items-center justify-between gap-2 mb-3'>
            <Link href={`/produto/${product.id}`} className='flex-1 bg-secondary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors duration-300 shadow-md'>
              DETALHES
            </Link>

              
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <motion.button 
                    className={`p-2 rounded-full shadow-md ${isFavorite ? 'bg-primary' : 'bg-gray-200'}`}
                    onClick={handleToggleFavorite}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaHeart size={15} className={`transition-colors duration-300 ${isFavorite ? 'text-white' : 'text-gray-400'}`} />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <motion.button 
            className="w-full bg-primary text-white py-3 px-4 rounded-md text-sm font-medium hover:bg-yellow-600 transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenOptions}
          >
            COMPRAR
          </motion.button>
        </div>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: '38%' }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white p-6 rounded-xl shadow-2xl overflow-y-auto"
            >
              <button 
                onClick={() => setShowOptions(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{product.attributes.name}</h2>
              <p className="text-lg font-semibold text-gray-700 mb-4">R$ {currentPrice?.toFixed(2)}</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Classificação</label>
                <div className="flex space-x-2 mb-4">
                  {['P', 'M', 'G'].map((classificacao) => (
                    <button
                      key={classificacao}
                      className={`w-8 h-8 rounded-full text-sm font-medium ${
                        selectedClassificacao === classificacao
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => handleSelectClassificacao(classificacao)}
                    >
                      {classificacao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="w-1/2 pr-2">
                  <label htmlFor="tamanho-anel" className="block text-sm font-medium text-gray-700 mb-1">Tamanho do anel</label>
                  <select
                    id="tamanho-anel"
                    value={selectedSize}
                    onChange={(e) => handleSelectSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecione</option>
                    {Object.entries(availableSizes)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([size, stock]) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="w-1/2 pl-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
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
                      className="w-full text-center border-none focus:ring-0 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
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

              <motion.button
                className="w-full bg-primary text-white py-3 px-4 rounded-md text-sm font-medium hover:bg-yellow-700 transition-all duration-300"
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