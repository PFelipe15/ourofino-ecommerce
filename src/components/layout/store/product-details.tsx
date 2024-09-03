'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaHeart, FaTruck } from 'react-icons/fa'
import { ProductProps } from '../../../../types/product-type'
import { useState, useEffect, useMemo } from 'react';

const classificacoes = {
  P: { min: 9, max: 18 },
  M: { min: 19, max: 24 },
  G: { min: 25, max: 30 },
};

export default function ProductDetails({ product }: { product: ProductProps }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(product.images[0]?.src || '');
  const [selectedClassificacao, setSelectedClassificacao] = useState('P');
  const [selectedSize, setSelectedSize] = useState('');

  const filteredSizes = useMemo(() => {
    return product.variants
      .filter(variant => variant.option1 === selectedClassificacao)
      .map(variant => variant.option2)
      .filter((size, index, self) => self.indexOf(size) === index)
      .sort((a, b) => parseInt(a) - parseInt(b));
  }, [selectedClassificacao, product.variants]);

  useEffect(() => {
    const variant = product.variants.find(
      v => v.option1 === selectedClassificacao && v.option2 === selectedSize
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  }, [selectedSize, selectedClassificacao, product.variants]);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const variant = product.variants.find(
      v => v.option1 === selectedClassificacao && v.option2 === size
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + amount));
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
                alt={product.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg"
              />
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images && product.images.map((image, index) => (
              <Image
                key={image.id}
                src={image.src}
                alt={`${product.title} - Imagem ${index + 1}`}
                width={100}
                height={100}
                className="rounded cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedImage(image.src)}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-4">{product.vendor}</p>

          <div className="mb-4">
            <span className="text-3xl font-bold text-primary">
              R$ {parseFloat(selectedVariant.price).toFixed(2)}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-4 flex items-center">
              <FaTruck className="mr-2" />
              {selectedVariant.inventory_quantity > 0 ? 'Em estoque' : 'Indisponível'}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classificação
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(classificacoes).map((classificacao) => (
                <button
                  key={classificacao}
                  onClick={() => setSelectedClassificacao(classificacao)}
                  className={`px-4 py-2 border rounded-md ${selectedClassificacao === classificacao ? 'bg-black text-white' : 'bg-white text-black'}`}
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
              {filteredSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSelectSize(size)}
                  className={`px-4 py-2 border rounded-md ${selectedSize === size ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

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
              disabled={selectedVariant.inventory_quantity === 0}
            >
              ADICIONAR À SACOLA
            </motion.button>
            <button className="border border-gray-300 rounded-md p-3">
              <FaHeart className="text-gray-400" />
            </button>
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
                <div dangerouslySetInnerHTML={{ __html: product.body_html }} className="prose max-w-none" />
              )}
              {activeTab === 'specifications' && (
                <div>
                  <p><strong>Tipo de Produto:</strong> {product.product_type}</p>
                  {/* Adicione mais especificações conforme necessário */}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}