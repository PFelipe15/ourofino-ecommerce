'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaHeart } from 'react-icons/fa'
import { useState, useEffect, useMemo } from 'react';
import { ProductsData } from '../../../../types/product-all-strape';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/store/useCartStore';
import { useUser } from '@clerk/nextjs';
import { getHasFavoriteProduct, createFavoriteProduct, deleteFavoriteProduct } from '@/_actions/handleFavoriteProduct';
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

export default function ProductDetails({ product }: { product:ProductsData  }) {
  const hasVariants = product.attributes.variants_price !== null;
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.attributes.variants_price.variantes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(product.attributes.images.data[0].attributes.url || '');
  const [selectedClassificacao, setSelectedClassificacao] = useState('P');
  const [selectedSize, setSelectedSize] = useState('');
  const [availableSizes, setAvailableSizes] = useState<{ [key: string]: number }>({});
  const [isFavorite, setIsFavorite] = useState(false);

  const { toast } = useToast();
  const { addItem } = useCartStore();
  const { user } = useUser();

  const filteredSizes = useMemo(() => {
    if (!hasVariants) return [];
    const sizeRanges = classificacoes[selectedClassificacao as keyof typeof classificacoes];
    return Array.from({ length: sizeRanges.max - sizeRanges.min + 1 }, (_, i) => (sizeRanges.min + i).toString());
  }, [selectedClassificacao, hasVariants]);

  useEffect(() => {
    if (hasVariants) {
      const sizeStock: { [key: string]: number } = {};
      product.attributes.variants_price.variantes.forEach(variante => {
        if (variante.classificacao === selectedClassificacao) {
          variante.tamanhos_estoque.forEach(item => {
            sizeStock[item.tamanho.toString()] = item.estoque;
          });
        }
      });
      setAvailableSizes(sizeStock);
      setSelectedSize('');
    }
  }, [product, selectedClassificacao, hasVariants]);

  useEffect(() => {
    if (hasVariants) {
      const variant = product.attributes.variants_price.variantes.find(
        v => Number(v.tamanho_minimo) <= parseInt(selectedSize) && Number(v.tamanho_maximo) >= parseInt(selectedSize)
      );
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  }, [selectedSize, selectedClassificacao, hasVariants]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const hasFavorite = await getHasFavoriteProduct(product.id, user?.emailAddresses[0]?.emailAddress);
      setIsFavorite(hasFavorite);
    };

    if (user?.emailAddresses[0]?.emailAddress) {
      checkFavoriteStatus();
    }
  }, [product.id, user]);

  const handleSelectSize = (size: string) => {
    if (hasVariants) {
      if (availableSizes[size] && availableSizes[size] > 0) {
        setSelectedSize(size);
        const variant = product.attributes.variants_price.variantes.find(
          v => Number(v.tamanho_minimo) <= parseInt(size) && Number(v.tamanho_maximo) >= parseInt(size)
        );
        if (variant) {
          setSelectedVariant(variant);
        }
      } else {
        toast({
          title: "Tamanho indisponível",
          description: "Este tamanho está fora de estoque no momento.",
          variant: "destructive"
        });
      }
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + amount));
  };

  const handleAddToCart = () => {
    if (hasVariants && !selectedSize) {
      toast({
        title: "Tamanho não selecionado",
        description: "Por favor, selecione um tamanho antes de adicionar ao carrinho.",
        variant: "destructive"
      });
      return;
    }

    const price = hasVariants ? selectedVariant!.preco : product.attributes.price_primary;
    addItem(product, quantity, price, selectedSize);
    toast({
      title: "Produto adicionado",
      description: `${product.attributes.name} foi adicionado ao seu carrinho.`,
      variant: "default"
    });
  };

  const handleToggleFavorite = async () => {
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("Email do cliente não encontrado.");
      return;
    }

    if (isFavorite) {
      await deleteFavoriteProduct(product.id, email);
      setIsFavorite(false);
      toast({
        title: "Removido dos favoritos",
        description: `${product.attributes.name} foi removido dos seus favoritos.`,
        variant: "default"
      });
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
        await createFavoriteProduct(product.id, userSerialiedData);
        setIsFavorite(true);
        toast({
          title: "Adicionado aos favoritos",
          description: `${product.attributes.name} foi adicionado aos seus favoritos.`,
          variant: "default"
        });
      } catch (error) {
        console.error("Erro ao criar favorito:", error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar aos favoritos. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div>
          <div className="relative aspect-square mb-4">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.attributes.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.attributes.images.data.map((image, index) => (
              <Image
                key={image.id}
                src={image.attributes.url}
                alt={`${product.attributes.name} - Imagem ${index + 1}`}
                width={100}
                height={100}
                className="rounded cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedImage(image.attributes.url)}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.attributes.name}</h1>
          {product.attributes.hot && (
            <div className="bg-yellow-200 text-yellow-800 p-2 rounded mb-4">
              Produto em Destaque!
            </div>
          )}
          <p className="text-gray-600 mb-4">{product.attributes.collection.data.attributes.name}</p>

          <div className="mb-4">
            <span className="text-3xl font-bold text-primary">
              R$ {hasVariants ? selectedVariant?.preco : product.attributes.price_primary}
            </span>
          </div>

          {hasVariants && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classificação
                </label>
                <div className="flex space-x-2">
                  {Object.keys(classificacoes).map((classificacao) => (
                    <button
                      key={classificacao}
                      onClick={() => setSelectedClassificacao(classificacao)}
                      className={`px-3 py-1 rounded-full ${selectedClassificacao === classificacao ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {classificacao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho do anel
                </label>
                <div className="flex flex-wrap gap-2">
                  {filteredSizes.map((size) => {
                    const isAvailable = availableSizes[size] && availableSizes[size] > 0;
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && handleSelectSize(size)}
                        className={`px-4 py-2 border rounded-md ${
                          selectedSize === size
                            ? 'bg-black text-white'
                            : isAvailable
                            ? 'bg-white text-black'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isAvailable}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade
            </label>
            <div className="flex items-center">
              <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1 border rounded-l">
                -
              </button>
              <span className="px-4 py-1 border-t border-b">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="px-3 py-1 border rounded-r">
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white flex-grow py-3 rounded-md font-bold flex items-center justify-center"
              onClick={handleAddToCart}
            >
              ADICIONAR À SACOLA
            </motion.button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <motion.button 
                    className={`p-3 rounded-full shadow-md ${isFavorite ? 'bg-primary' : 'bg-gray-200'}`}
                    onClick={handleToggleFavorite}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaHeart size={20} className={`transition-colors duration-300 ${isFavorite ? 'text-white' : 'text-gray-400'}`} />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`py-2 px-4 ${activeTab === 'description' ? 'border-b-2 border-primary' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Descrição
              </button>
              <button
                className={`py-2 px-4 ${activeTab === 'specifications' ? 'border-b-2 border-primary' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Especificações
              </button>
            </div>
            <div className="mt-4">
              {activeTab === 'description' && (
                <div dangerouslySetInnerHTML={{ __html: product.attributes.description }} className="prose max-w-none" />
              )}
              {activeTab === 'specifications' && (
                <div className="space-y-2">
                  <p><strong>Tipo de Produto:</strong> {product.attributes.collection.data.attributes.name}</p>
                  <p><strong>Peso:</strong> {product.attributes.peso} g</p>
                  <p><strong>Altura:</strong> {product.attributes.altura} cm</p>
                  <p><strong>Largura:</strong> {product.attributes.largura} cm</p>
                  <p><strong>Comprimento:</strong> {product.attributes.comprimento} cm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
