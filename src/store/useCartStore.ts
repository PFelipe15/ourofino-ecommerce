import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import CryptoJS from 'crypto-js'
import { ProductProps } from '../../types/product-type'

interface CartItem extends Omit<ProductProps, 'variants'> {
  quantity: number;
  selectedSize: string;
  price: string; // Preço da variante selecionada
  variant: ProductProps['variants'][0]; // A variante selecionada
}

interface CartStore {
  items: CartItem[];
  addItem: (item: ProductProps, quantity: number, selectedSize: string) => void;
  removeItem: (id: number, selectedSize: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: number, selectedSize: string) => void;
  decreaseQuantity: (id: number, selectedSize: string) => void;
  updateItemSize: (itemId: number, oldSize: string, newSize: string) => void;
}

const SECRET_KEY = 'sua_chave_secreta_muito_longa_e_complexa'

const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

const decryptData = (encryptedData: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

export const useCartStore = create(
  persist<CartStore>(
    (set) => ({
      items: [],
      addItem: (item, quantity, selectedSize) => set((state) => {
        const selectedVariant = item.variants.find(v => v.option2 === selectedSize);
        if (!selectedVariant) {
          console.error("Variante não encontrada");
          return state;
        }

        const newItem: CartItem = {
          ...item,
          quantity,
          selectedSize,
          price: selectedVariant.price,
          variant: selectedVariant,
        };

        const existingItemIndex = state.items.findIndex(
          (i) => i.id === item.id && i.selectedSize === selectedSize
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += quantity;
          return { items: newItems };
        }
        
        return { 
          items: [...state.items, newItem] 
        };
      }),
      removeItem: (id: number, selectedSize: string) => set((state) => ({
        items: state.items.filter((item) => !(item.id === id && item.selectedSize === selectedSize)),
      })),
      clearCart: () => set({ items: [] }),
      increaseQuantity: (id: number, selectedSize: string) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      })),
      decreaseQuantity: (id: number, selectedSize: string) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id && item.selectedSize === selectedSize && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ).filter((item) => item.quantity > 0),
      })),
      updateItemSize: (itemId: number, oldSize: string, newSize: string) => set((state) => {
        const itemIndex = state.items.findIndex(item => item.id === itemId && item.selectedSize === oldSize)
        if (itemIndex === -1) return state

        const newItems = [...state.items]
        const updatedItem = { ...newItems[itemIndex], selectedSize: newSize }

        // Verifica se já existe um item com o novo tamanho
        const existingNewSizeIndex = newItems.findIndex(item => item.id === itemId && item.selectedSize === newSize)

        if (existingNewSizeIndex !== -1) {
          // Se existir, soma as quantidades e remove o item antigo
          newItems[existingNewSizeIndex].quantity += updatedItem.quantity
          newItems.splice(itemIndex, 1)
        } else {
          // Se não existir, apenas atualiza o item
          newItems[itemIndex] = updatedItem
        }

        return { items: newItems }
      }),
    }),
    {
      name: 'cart-storage',
      storage: {
        getItem: (name) => {
          const storedData = localStorage.getItem(name)
          return storedData ? JSON.parse(storedData) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)