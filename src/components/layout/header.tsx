'use client'
import { ShoppingCart,  Search, Menu, Phone, Mail, HeadphonesIcon, ChevronDown, Diamond, BellRing, Shirt, DiamondIcon } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPinterest, FaRing } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { TbDiamonds, TbTruckDelivery } from "react-icons/tb";
import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useCartStore } from '@/store/useCartStore';
import { Cart } from './cart/cart';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, LogOut, Gift, Heart, Truck, Clock } from "lucide-react";
import { SubmitAddress } from "@/_actions/submit-address";
import { useToast } from "@/hooks/use-toast";
import { getCustomerOrCreate } from "@/_actions/Customers";
import { Category, getCategoriesAndCollections } from "@/_actions/Categories";
import { MdDiamond, MdGridGoldenratio } from "react-icons/md";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
 
   
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
  const [isLoading, setIsLoading] = useState(false); // Adiciona estado para controle de loading
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const fetchCategoriesAndCollections = async () => {
      const data = await getCategoriesAndCollections();
      setCategories(data);
    };

    fetchCategoriesAndCollections();
  }, []);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const { user } = useUser();
  const { signOut } = useClerk()
  const { toast } = useToast()

  const cartItems = useCartStore((state) => state.items);

const getUserAddress = async () => {
  setIsLoading(true);  
  const userData = {
    data: {
      first_name: user?.firstName,
      last_name: user?.lastName,
      email: user?.emailAddresses[0]?.emailAddress,
      phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',     
    }
  }
  const customerResponse = await getCustomerOrCreate(userData);
  const customerAddress = customerResponse.attributes?.address
  
  if (customerAddress) {
    setAddress(customerAddress);
  } else {
    toast({
      title: "Nenhum endereço encontrado",
      description: "Você ainda não cadastrou seu endereço.",
      variant: "destructive",
    });
  }
  setIsLoading(false); // Finaliza o loading
}

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


    const userData = {
      email: user?.emailAddresses[0]?.emailAddress,
      phone: user?.phoneNumbers[0]?.phoneNumber,
      firstName: user?.firstName,
      lastName: user?.lastName,
      address: address
    }
    const successful = await SubmitAddress(userData);
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

  const handleAddressDialogOpen = () => {
    setIsAddressDialogOpen(true);
    getUserAddress(); // Chama a função ao abrir o modal
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'joias':
        return <MdDiamond size={16} className="mr-2" />;
      case 'aneis':
        return <FaRing size={16} className="mr-2" />;
      // Adicione mais casos conforme necessário
      case 'roupas':
        return <Shirt size={16} className="mr-2" />;
      default:
        return null;
    }
  };

  const CategoryMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex items-center">
          <span className="mr-2">Categorias</span>
          <ChevronDown size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent side={isMobile ? "left" : "right"} className={isMobile ? "w-full sm:w-[400px]" : "w-[400px]"}>
        <h2 className="text-2xl font-bold mb-4">Categorias</h2>
        <Accordion type="single" collapsible className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.name}>
              <AccordionTrigger className="text-lg">
                <div className="flex items-center">
                  {getCategoryIcon(category.name)}
                  <span>{category.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-6">
                  {category.collections.map((collection) => (
                    <li key={collection.id}>
                      <Link 
                        href={`/produtos?categoria=${category.name}&colecao=${collection.slug}`}
                        className="text-sm text-gray-600 hover:text-primary"
                      >
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6">
          <Link href="/produtos" className="text-primary hover:underline text-sm font-medium">
            Ver todas as categorias
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={`w-screen sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      {/* Top bar - esconde quando rolar */}
      {!isScrolled && (
        <div className="bg-gray-100 text-gray-700 py-2">
          <div className="container mx-auto text-xs  flex flex-col md:flex-row justify-between items-center md:text-sm">
            <div className="flex space-x-4">
              <span className="flex items-center gap-2">
                <Phone size={16} className="text-primary" /> (86) 98803-4600
              </span>
              <span className="flex items-center gap-2">
                <Mail size={16} className="text-primary" /> contato@ourofino.com.br
              </span>
            </div>
            <div className="flex space-x-4 items-center mt-2 md:mt-0">
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
      <div className={`bg-white py-6 border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'py-8' : ''}`}>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <Link href="/" className="flex-shrink-0 my-4 md:my-0">
            <Image
              src="/logotipoourofino.svg"
              alt="Ouro Fino"
              width={isScrolled ? 150 : 200}
              height={isScrolled ? 52 : 70}
              className="cursor-pointer transition-all duration-300"
            />
          </Link>

          <div className="flex-1 px-4 md:px-8">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary transition-all"
                placeholder="Buscar produtos..."
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 mt-2 md:mt-0">
            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all"
            >
              <Gift size={20} />
              <span className="hidden md:inline">Presentes</span>
            </Button>

            <a 
              href="/produtos?favoritos=true"     
              className="flex items-center p-2 rounded-md gap-2 text-gray-600 hover:text-primary transition-all hover:bg-accent"
            >
              <Heart size={20} />
              <span className="hidden md:inline">Favoritos</span>
            </a>

            <SignedIn>
              <Popover>
                <PopoverTrigger>
                  <Avatar className="cursor-pointer transition-transform hover:scale-105 ring-2 ring-primary ring-offset-2">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-2 rounded-lg shadow-xl border border-gray-200">
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
                        <span className="text-base">Meus Pedidos</span>
                      </Link>
                      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="flex items-center justify-start space-x-2 text-gray-700   w-full px-3 py-2 rounded-md transition-all hover:bg-primary hover:text-white" onClick={handleAddressDialogOpen}>
                            <span className="text-base">Meu Endereço</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
                          <DialogHeader className="flex flex-col items-center">
                            <Image
                              src="/logotipoourofino.svg"
                              alt="Ourofino Logo"
                              width={120}
                              height={60}
                              className="mb-4"
                            />
                            <DialogTitle className="text-2xl font-bold text-gray-800">
                              {address.street ? "Atualizar Endereço" : "Salvar Endereço"}
                            </DialogTitle>
                            <DialogDescription className="text-center text-gray-600 mt-2">
                              {address.street ? "Atualize seu endereço de entrega" : "Cadastre seu endereço de entrega"}
                            </DialogDescription>
                          </DialogHeader>
                          {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <span className="text-primary">Carregando...</span>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 50 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 50 }}
                              transition={{ duration: 0.3 }}
                            >
                              <form onSubmit={handleAddressSubmit} className="mt-4 space-y-4">
                                {!address.street && (
                                  <div className="text-red-600 text-center">
                                    Você ainda não cadastrou seu endereço.
                                  </div>
                                )}
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
                                      <Label htmlFor="number" className="text-sm font-medium text-gray-700">Nmero</Label>
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
                                  <DialogFooter className="sm:justify-center space-x-4 mt-6">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsAddressDialogOpen(false)}
                                      className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      type="submit"
                                      className="w-full sm:w-auto bg-primary hover:bg-yellow-800 text-white"
                                    >
                                      {address.street ? "Atualizar Endereço" : "Salvar Endereço"}
                                    </Button>
                                  </DialogFooter>
                                </motion.div>
                              </form>
                            </motion.div>
                          )}
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
        <nav className="bg-gray-50 ">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">   
            <div className="flex flex-row items-center space-y-0 md:space-x-6">
              <Link href="#novidades" className="text-gray-600 hover:text-primary transition-all px-3 py-2">Novidades</Link>
              <Link href="#promocoes" className="text-gray-600 hover:text-primary transition-all px-3 py-2">Promoções</Link>
              
              {isMobile ? (
                <CategoryMenu />
              ) : (
                // Seu menu dropdown existente para desktop
                <div className="relative group">
                  <button className="flex items-center text-gray-600 hover:text-primary transition-all px-3 py-2">
                    Categorias
                    <ChevronDown size={16} className="ml-1 group-hover:transform group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute left-0 top-full pt-2 w-screen md:w-auto"> {/* Ajuste aqui */}
                    <div className="w-full md:w-[600px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Ajuste aqui */}
                        {categories.map((category) => (
                          <div key={category.id} className="space-y-2">
                            <Link href={`/produtos?categoria=${category.name}`} className="font-semibold text-lg text-gray-800 hover:text-primary flex items-center">
                              {getCategoryIcon(category.name)}
                              <span>{category.name}</span>
                            </Link>
                            <ul className="space-y-1 pl-6 border-l-2 border-gray-200">
                              {category.collections.map((collection) => (
                                <li key={collection.id}>
                                  <Link 
                                    href={`/produtos?categoria=${category.name}&colecao=${collection.slug}`} 
                                    className="text-sm text-gray-600 hover:text-primary hover:underline flex items-center"
                                  >
                                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                    {collection.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-b-md">
                        <Link href="/produtos" className="text-primary hover:underline text-sm font-medium">
                          Ver todas as categorias
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

             
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
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
          className="bg-primary text-center font-bold py-3 hidden md:block  text-white text-sm"
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
