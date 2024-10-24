import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ProductsData } from '../../types/product-all-strape';

export interface CartItem  {
  id:number
  attributes:ProductsData['attributes']
  quantity: number;
  selectedSize: string;
  price: number | undefined; 
  subtotal: number | undefined;
}

interface CartStore {
  items: CartItem[];
  step: number;
  addItem: (product: ProductsData, quantity: number, price:number | undefined, selectedSize: string) => void;
  removeItem: (id: number, selectedSize: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: number, selectedSize: string) => void;
  decreaseQuantity: (id: number, selectedSize: string) => void;
  updateItemSize: (itemId: number, oldSize: string, newSize: string) => void;
  setStep: (step: number) => void;
  resetStep: () => void;
  resetCart: () => void;
  isOrderCompleted: boolean;
  setOrderCompleted: (completed: boolean) => void;
  clearLocalStorage: () => void;
  forceReset: () => void;
}

 
 

export const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      step: 0,
      addItem: (item, quantity, price, selectedSize) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (cartItem) => cartItem.id === item.id && cartItem.selectedSize === selectedSize
        );

        let updatedItems;
        if (existingItemIndex !== -1) {
          updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += quantity;
          updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
        } else {
          const newItem: CartItem = {
            ...item,
            quantity,
            selectedSize,
            price: price ?? 0,
            subtotal: (price ?? 0) * quantity,
          };
          updatedItems = [...state.items, newItem];
        }

        // Resetar o step quando um novo item é adicionado
        return { items: updatedItems, step: 0 };
      }),
      removeItem: (id: number, selectedSize: string) => set((state) => ({
        items: state.items.filter((item) => !(item.id === id && item.selectedSize === selectedSize)),
      })),
      clearCart: () => set({ items: [] }),
      increaseQuantity: (id: number, selectedSize: string) => set((state) => {
        const updatedItems = state.items.map((item) =>
          item.id === id && item.selectedSize === selectedSize
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: item.price * (item.quantity + 1), // Atualiza o subtotal
              }
            : item
        );
        return { items: updatedItems };
      }),
      decreaseQuantity: (id: number, selectedSize: string) => set((state) => {
        const updatedItems = state.items.map((item) => {
          if (item.id === id && item.selectedSize === selectedSize && item.quantity > 1) {
            const newQuantity = item.quantity - 1;
            return {
              ...item,
              quantity: newQuantity,
              subtotal: item.price * newQuantity, // Atualiza o subtotal
            };
          }
          return item;
        }).filter((item) => item.quantity > 0);
        return { items: updatedItems };
      }),
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
      setStep: (step: number) => set({ step }),
      resetStep: () => {
         set({ step: 0 });
      },
      resetCart: () => {
        set({ items: [], step: 0, isOrderCompleted: false }, true)
        get().clearLocalStorage()
      },
      isOrderCompleted: false,
      setOrderCompleted: (completed) => set({ isOrderCompleted: completed }),
      clearLocalStorage: () => {
        localStorage.removeItem('cart-storage')
      },
      forceReset: () => {
        set({ items: [], step: 0, isOrderCompleted: false }, true)
        get().clearLocalStorage()
        window.location.reload() // Força o recarregamento da página
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
