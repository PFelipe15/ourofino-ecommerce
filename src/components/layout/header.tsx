'use client'
import { ShoppingCart,  Search, Menu, Phone, Mail, HeadphonesIcon } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPinterest } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { TbTruckDelivery } from "react-icons/tb";
import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useCartStore } from '@/store/useCartStore';
import { Cart } from './cart';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, MapPin, ShoppingBag, LogOut } from "lucide-react";
import { clerkClient } from '@clerk/nextjs/server'
import { SubmitAddress } from "@/_actions/submit-address";
import { toast } from "react-toastify";

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { user } = useUser();
  const cartItems = useCartStore((state) => state.items);



  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucessful = await SubmitAddress(user?.id, address)
if(sucessful){
  toast.success("Endereço salvo com sucesso")
  setIsAddressDialogOpen(false)
}else{
  toast.error("Erro ao salvar endereço")
}

  };

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      {/* Top bar */}
      <div className="bg-gray-100 text-gray-700 py-2">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex space-x-4">
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-primary" /> (21) 99279-8604
            </span>
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-primary" /> contato@ourofino.com.br
            </span>
          </div>
          <div className="flex space-x-4 items-center">
            <Link href="/quem-somos" className="hover:text-primary transition-all hover:scale-105">Quem Somos</Link>
            <Link href="/contato" className="hover:text-primary transition-all hover:scale-105">Contato</Link>
            <div className="flex space-x-2">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                <FaInstagram size={18} />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                <FaFacebook size={18} />
              </a>
              <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                <FaPinterest size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white py-6 border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logotipoourofino.svg"
              alt="Ouro Fino"
              width={200}
              height={70}
              className="cursor-pointer transition-transform hover:scale-105"
            />
          </Link>

          <div className="flex-1 px-8">
            <div className="relative max-w-md mx-auto border-b-2 border-gray-300 ">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4   focus:outline-none focus:border-primary transition-all bg-transparent"
                placeholder="Buscar produtos..."
              />
              <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all hover:scale-105 px-4 py-2 rounded-full font-semibold"
            >
              <HeadphonesIcon size={20} /> Atendimento
            </Button>

            <SignedIn>
              <Popover>
                <PopoverTrigger>
                  <Avatar className="cursor-pointer transition-transform hover:scale-105">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-white rounded-lg shadow-lg">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-800">{user?.fullName}</p>
                        <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.toString()}</p>
                      </div>
                    </div>
                    <hr className="border-gray-200" />
                    <Link href="/meus-pedidos" className="flex items-center space-x-2 text-gray-700 hover:text-primary hover:bg-primary/10 px-2 py-2 rounded-md transition-colors">
                      <ShoppingBag size={18} />
                      <span>Meus Pedidos</span>
                    </Link>
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="flex items-center justify-start space-x-2 text-gray-700 hover:text-primary hover:bg-primary/10 w-full px-2 py-2 rounded-md transition-colors">
                          <MapPin size={18} />
                          <span>Meu Endereço</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg p-6">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-semibold text-gray-800 mb-4">Meu Endereço</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="street" className="text-sm font-medium text-gray-700">Rua</Label>
                            <Input id="street" name="street" value={address.street} onChange={handleAddressChange} className="mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="number" className="text-sm font-medium text-gray-700">Número</Label>
                              <Input id="number" name="number" value={address.number} onChange={handleAddressChange} className="mt-1" />
                            </div>
                            <div>
                              <Label htmlFor="complement" className="text-sm font-medium text-gray-700">Complemento</Label>
                              <Input id="complement" name="complement" value={address.complement} onChange={handleAddressChange} className="mt-1" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">Bairro</Label>
                            <Input id="neighborhood" name="neighborhood" value={address.neighborhood} onChange={handleAddressChange} className="mt-1" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade</Label>
                              <Input id="city" name="city" value={address.city} onChange={handleAddressChange} className="mt-1" />
                            </div>
                            <div>
                              <Label htmlFor="state" className="text-sm font-medium text-gray-700">Estado</Label>
                              <Input id="state" name="state" value={address.state} onChange={handleAddressChange} className="mt-1" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">CEP</Label>
                            <Input id="zipCode" name="zipCode" value={address.zipCode} onChange={handleAddressChange} className="mt-1" />
                          </div>
                          <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition-colors">Salvar Endereço</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <hr className="border-gray-200" />
                    <Button variant="ghost" className="flex items-center justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-full px-2 py-2 rounded-md transition-colors">
                      <LogOut size={18} />
                      <span>Sair</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all hover:scale-105 px-4 py-2 rounded-full font-semibold"
                >
                  <User size={20} /> Entrar
                </Button>
              </SignInButton>
            </SignedOut>

            <Button
              variant="ghost"
              className="relative p-2 rounded-full text-primary hover:bg-primary/10 transition-all hover:scale-110"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={28} />
              <AnimatePresence>
                {cartItems.length > 0 && (
                  <motion.span
                    key="cart-count"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button variant="ghost" className="lg:hidden text-primary hover:bg-primary/10 transition-all hover:scale-110">
              <Menu size={28} />
            </Button>
          </div>
        </div>
      </div>

      {/* Promo Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-primary text-center font-bold py-3 text-white text-sm"
      >
        <span className="flex items-center justify-center gap-2">
          <TbTruckDelivery size={20} /> Na primeira compra ganhe 5% OFF usando cupom: PRIMEIRACOMPRA
        </span>
      </motion.div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;

