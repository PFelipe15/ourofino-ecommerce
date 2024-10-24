/* eslint-disable @next/next/no-img-element */
"use client";
import { motion } from "framer-motion";
import { FaShippingFast, FaCreditCard, FaWhatsapp, FaMedal, FaUserShield, FaCog } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import BannerMain from "@/components/layout/banner";
import Footer from "@/components/layout/footer";
import ChatBox from "@/components/layout/chatbox/chat";
import GroupProducts from "@/components/layout/store/groups-products";
import LinhaProdutos from "@/components/layout/linha-produtos";

export default function Home() {

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800">       
      <BannerMain />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white mt-8 p-8 rounded-lg shadow-md w-full max-w-4xl"
      >
        <div className="flex justify-between items-center text-center">
          {[
            {
              icon: <FaShippingFast className="text-primary text-3xl mx-auto mb-2" />,
              title: "ENTREGA RÁPIDA E EXCLUSIVA",
              description: "Sua aliança em até 5 dias",
            },
            {
              icon: <FaCreditCard className="text-primary text-3xl mx-auto mb-2" />,
              title: "ATÉ 10X SEM JUROS*",
              description: "Compra segura",
            },
            {
              icon: <FaWhatsapp className="text-primary text-3xl mx-auto mb-2" />,
              title: "COMPRE PELO WHATS",
              description: "Mais de 6000 peças entregas",
            },
          ].map((item, index) => (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex-1 px-4 transform transition-transform"
              key={index}
            >
              {item.icon}
              <h2 className="text-sm font-bold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <GroupProducts title="Produtos em destaque" slug="destaque" id="destaque" />
       <LinhaProdutos />
 
       <GroupProducts title="Promoções"  slug="promocoes"  id="promocoes" />

 

       <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mt-8 flex flex-col md:flex-row items-center bg-gray-100 border-primary border-2 p-8 rounded-lg shadow-md max-w-5xl"
      >
        <img
          src="./1666139899_mid.webp"
          alt="Banner com dois aneis escrito Ourofino"
          className="rounded-lg shadow-lg w-full md:w-1/2 hover:scale-105 transition-transform mb-4 md:mb-0"
        />
        <div className="md:ml-8 text-center md:text-left">
          <h3 className="text-xl font-bold text-gray-800">
            Alianças de Compromisso Ourofino
          </h3>
          <p className="text-gray-600 mt-2">
            Cada aliança é feita com o máximo cuidado e atenção aos detalhes para
            simbolizar o seu amor eterno.
          </p>
          <a
            href="/colecoes"
            className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-dark transition-colors"
          >
            Confira Agora
          </a>
        </div>
      </motion.div>

      <ChatBox/>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white mt-12 p-8 rounded-lg shadow-md w-screen  "
      >
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Nossos Diferenciais
        </h3>
        <div className="flex justify-between items-center text-center flex-col md:flex-row">
          {[
            {
              icon: <FaMedal className="text-primary text-3xl mx-auto mb-2" />,
              title: "Qualidade Garantida",
              description: "Materiais de alta qualidade e garantia vitalícia.",
            },
            {
              icon: <FaCog className="text-primary text-3xl mx-auto mb-2" />,
              title: "Personalização Completa",
              description: "Gravação e ajuste de tamanho inclusos.",
            },
            {
              icon: <MdSupportAgent className="text-primary text-3xl mx-auto mb-2" />,
              title: "Suporte 24/7",
              description: "Estamos sempre disponíveis para te ajudar.",
            },
          ].map((item, index) => (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex-1 px-4 transform transition-transform"
              key={index}
            >
              {item.icon}
              <h4 className="text-lg font-bold mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <GroupProducts title="News" slug="novos" id="novidades" />

       <Footer />
    </main>
  );
}
