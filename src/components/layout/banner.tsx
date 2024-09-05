'use client'
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

const BannerMain = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: true }) as any]);

  const BannerContent = ({ title, description, buttonText }:{title: string, description: string, buttonText: string}) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col items-start justify-center px-8 md:px-16"
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg md:text-2xl text-white mb-8 max-w-2xl"
        >
          {description}
        </motion.p>
        <motion.a
          href="/shop"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(255,255,255)" }}
          className="px-8 py-4 bg-yellow-500 text-white text-lg md:text-xl font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-300"
        >
          {buttonText}
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );

  const Banner1 = () => (
    <section className="relative w-full h-[60vh] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("./1690924700_ouro_fino_banner_novoentrega.webp")' }}>
      <BannerContent
        title="Alianças e Anéis de Casamento"
        description="Encontre a joia perfeita para o seu momento especial. Qualidade e tradição em cada peça."
        buttonText="Explore a Coleção"
      />
    </section>
  );

  const Banner2 = () => (
    <section className="relative w-full h-[60vh] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("./1690317423_ouro_fino_banner_novo4.webp")' }}>
      <BannerContent
        title="Sofisticação e Elegância"
        description="Descubra nossas coleções exclusivas para todas as ocasiões. Beleza e durabilidade em cada detalhe."
        buttonText="Conheça Nossas Coleções"
      />
    </section>
  );

  return (
    <div className="w-full overflow-hidden">
      <div ref={emblaRef}>
        <div className="flex">
          <div className="flex-[0_0_100%]">
            <Banner1 />
          </div>
          <div className="flex-[0_0_100%]">
            <Banner2 />
          </div>
        </div>
      </div>
      {/* Adicione os botões de navegação aqui, se necessário */}
    </div>
  );
}

export default BannerMain;
