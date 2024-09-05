'use client'
import { ShoppingCart,  Search, Menu, Phone, Mail, HeadphonesIcon } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPinterest } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { TbTruckDelivery } from "react-icons/tb";
import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useCartStore } from '@/store/useCartStore';
import { Cart } from './cart';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, MapPin, ShoppingBag, LogOut, Gift, Heart, Truck, Clock, ChevronDown } from "lucide-react";
import { SubmitAddress } from "@/_actions/submit-address";
import { useToast } from "@/hooks/use-toast";
 
   
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
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };
  
    window.addEventListener('scroll', handleScroll);
  
    // Limpeza do evento quando o componente for desmontado
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { user } = useUser();
  const { signOut } = useClerk()
  const { toast } = useToast()

  const cartItems = useCartStore((state) => state.items);



  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user?.id){
      toast({
        title: "Erro ao salvar endereço",
        description: "Por favor, faça login para salvar seu endereço.",
        variant: "destructive",
       });
      return;
    }
    const successful = await SubmitAddress(user?.id, address);
    if(successful){
      toast({
        title: "Endereço salvo com sucesso",
        description: "Seu novo endereço foi adicionado à sua conta.",
        variant: "success",
       });
      setIsAddressDialogOpen(false);
    } else {
      toast({
        title: "Erro ao salvar endereço",
        description: "Ocorreu um problema ao salvar seu endereço. Tente novamente.",
        variant: "destructive",
       });
    }
  };

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md  ' : 'bg-transparent'}`}>
      {/* Top bar - esconde quando rolar */}
      {!isScrolled && (
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
              <Link href="/faq" className="hover:text-primary transition-all hover:scale-105">FAQ</Link>
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
      )}

      {/* Main header */}
      <div className={`bg-white py-6  border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'py-8' : ''}`}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logotipoourofino.svg"
              alt="Ouro Fino"
              width={isScrolled ? 150 : 200}
              height={isScrolled ? 52 : 70}
              className="cursor-pointer transition-all duration-300"
            />
          </Link>

          <div className="flex-1 px-8">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary transition-all"
                placeholder="Buscar produtos..."
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
             
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all"
            >
              <Gift size={20} />
              <span className="hidden md:inline">Presentes</span>
            </Button>

            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all"
            >
              <Heart size={20} />
              <span className="hidden md:inline">Favoritos</span>
            </Button>

            <SignedIn>
  <Popover>
    <PopoverTrigger>
      <Avatar className="cursor-pointer transition-transform hover:scale-105 ring-2 ring-primary ring-offset-2">
        <AvatarImage src={user?.imageUrl} />
        <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
      </Avatar>
    </PopoverTrigger>
    <PopoverContent className="w-[350px] p-2   rounded-lg shadow-xl border border-gray-200">
      <div className="flex flex-col">
        <div className="bg-gradient-to-r from-primary to-yellow-700 p-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-semibold text-lg">{user?.fullName}</p>
              <p className="text-sm opacity-80">{user?.primaryEmailAddress?.toString()}</p>
            </div>
          </div>
        </div>
        <div className="p-2">
          <Link href="/meus-pedidos" className="flex items-center justify-start space-x-2 text-gray-700   hover:bg-primary w-full px-3 py-2 rounded-md transition-all hover:text-white">
            <ShoppingBag size={22} />
            <span className="text-base">Meus Pedidos</span>
          </Link>
          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-start space-x-2 text-gray-700   w-full px-3 py-2 rounded-md transition-all hover:bg-primary hover:text-white">
                <MapPin size={25} />
                <span className="text-base">Meu Endereço</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">Adicionar Novo Endereço</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddressSubmit} className="mt-4 space-y-4">
                  <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}>
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                      <Label htmlFor="street" className="text-sm font-medium text-gray-700">Rua</Label>
                      <Input id="street" name="street" value={address.street} onChange={handleAddressChange} required className="mt-1" />
                    </motion.div>
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="flex space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="number" className="text-sm font-medium text-gray-700">Número</Label>
                        <Input id="number" name="number" value={address.number} onChange={handleAddressChange} required className="mt-1" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="complement" className="text-sm font-medium text-gray-700">Complemento</Label>
                        <Input id="complement" name="complement" value={address.complement} onChange={handleAddressChange} className="mt-1" />
                      </div>
                    </motion.div>
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                      <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">Bairro</Label>
                      <Input id="neighborhood" name="neighborhood" value={address.neighborhood} onChange={handleAddressChange} required className="mt-1" />
                    </motion.div>
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="flex space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade</Label>
                        <Input id="city" name="city" value={address.city} onChange={handleAddressChange} required className="mt-1" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">Estado</Label>
                        <Input id="state" name="state" value={address.state} onChange={handleAddressChange} required className="mt-1" />
                      </div>
                    </motion.div>
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">CEP</Label>
                      <Input id="zipCode" name="zipCode" value={address.zipCode} onChange={handleAddressChange} required className="mt-1" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <Button type="submit" className="w-full bg-primary hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105">
                      Salvar Endereço
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </DialogContent>
          </Dialog>
          <hr className="my-2 border-gray-200" />
          <Button variant="ghost" className="flex items-center justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-full px-3 py-2 rounded-md transition-all" onClick={() => signOut({ redirectUrl: '/' })}>
            <LogOut size={18} />
            <span>Sair</span>
          </Button>
        </div>
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
          </div>
        </div>
      </div>

      {/* Navigation bar - esconde quando rolar */}
      {!isScrolled && (
        <nav className="bg-gray-50 py-3">
          <div className="container mx-auto flex justify-between items-center">   
            <div className="flex space-x-6">
              <Link href="/novidades" className="text-gray-600 transition-all  hover:bg-primary hover:text-white hover:font-bold  px-3 rounded-md ">Novidades</Link>
              <Link href="/promocoes" className="text-gray-600 transition-all hover:bg-primary hover:text-white hover:font-bold  px-3 rounded-md ">Promoções</Link>
              <Link href="/colecoes" className="text-gray-600 transition-all hover:bg-primary hover:text-white hover:font-bold  px-3 rounded-md ">Coleções</Link>
              <Link href="/blog" className="text-gray-600 transition-all hover:bg-primary hover:text-white hover:font-bold px-3 rounded-md ">Blog</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} className="text-primary" /> Frete grátis acima de R$299
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-primary" /> Entrega em 24h
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* Promo Bar - esconde quando rolar */}
      {!isScrolled && (
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
      )}

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;

