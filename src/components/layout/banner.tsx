'use client'
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

const BannerMain = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 20000 })
  );

  const Banner1 = () => (
    <section className="relative w-full   h-[60vh]  bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("./1690924700_ouro_fino_banner_novoentrega.webp")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold text-white text-center"
        >
          Alianças e Anéis de Casamento
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-lg md:text-2xl text-white mt-4 text-center max-w-2xl "
        >
          Encontre a joia perfeita para o seu momento especial. Qualidade e tradição em cada peça.
        </motion.p>
        <motion.a
          href="/shop"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          className="mt-8 px-8 py-4 bg-yellow-500 text-white text-lg md:text-xl font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
        >
          Explore a Coleção
        </motion.a>
      </div>
    </section>
  );

  const Banner2 = () => (
    <section className="relative w-full  h-[60vh]  bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("./1690317423_ouro_fino_banner_novo4.webp")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold text-white text-center"
        >
          Sofisticação e Elegância
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-lg md:text-2xl text-white mt-4 text-center max-w-2xl"
        >
          Descubra nossas coleções exclusivas para todas as ocasiões. Beleza e durabilidade em cada detalhe.
        </motion.p>
        <motion.a
          href="/shop"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          className="mt-8 px-8 py-4 bg-yellow-500 text-white text-lg md:text-xl font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
        >
          Conheça Nossas Coleções
        </motion.a>
      </div>
    </section>
  );

  return (
    <div>
      <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}>
        <CarouselContent className="w-[98vw] ">
          {Array.from({ length: 2 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                {index === 0 && <Banner1 />}
                {index === 1 && <Banner2 />}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
  className="bg-primary text-white border-none hover:bg-yellow-800 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full p-2"
/>

<CarouselNext
  className="bg-primary text-white border-none hover:bg-yellow-800 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full p-2"
/>

         
      </Carousel>
    </div>
  );
}

export default BannerMain;
