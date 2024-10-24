'use client'
import { useState, useEffect } from 'react';
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

export default function ProductCardWithoutVariants({ product }: { product: ProductsData }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user } = useUser();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const currentPrice = product.attributes.price_primary;

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

  const handleComprar = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      ...product,
      attributes: {
        ...product.attributes,
      }
    }, quantity, currentPrice);

    toast({
      title: "Produto adicionado ao carrinho",
      description: "Produto adicionado ao carrinho com sucesso"
    });
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const isHotProduct = product.attributes.hot;

  const handleToggleFavorite = async () => {
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("Email do cliente não encontrado.");
      return;
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
                src={isHovered ? product.attributes.images.data[1]?.attributes.url : product.attributes.images.data[0]?.attributes.url}
                alt={product.attributes.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="p-4 text-center flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">{product.attributes.name}</h2>
          <div className="flex items-center justify-center mb-4">
            <span className="text-lg font-bold text-gray-800">
              R$ {currentPrice?.toFixed(2) || '0.00'}
            </span>
          </div>
          
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
              animate={{ opacity: 1, y: '53%' }}
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
              <p className="text-lg font-semibold text-gray-700 mb-4">R$ {currentPrice.toFixed(2)}</p>

              <div className="mb-4">
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
