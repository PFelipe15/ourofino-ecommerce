import { motion } from "framer-motion";

export default function LinhaProdutos() {
  return (
    <div className="container mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl" id="colecoes">
      {[
        {
          src: "./linha-classic.webp",
          alt: "Linha Classic",
          title: "Linha Classic",
          description:
            "A Linha Classic oferece elegância atemporal para aqueles que apreciam a simplicidade e o estilo clássico.",
          link: "/colecoes/classic",
        },
        {
          src: "./linha-master.webp",
          alt: "Linha Master",
          title: "Linha Master",
          description:
            "A Linha Master é perfeita para quem busca alianças com design sofisticado e detalhes marcantes.",
          link: "/colecoes/master",
        },
        {
          src: "./linha-premium.webp",
          alt: "Linha Premium",
          title: "Linha Premium",
          description:
            "Para os momentos mais especiais, a Linha Premium oferece alianças de alta qualidade e design exclusivo.",
          link: "/colecoes/premium",
        },
      ].map((item, index) => (
        <motion.div
          key={index}
          className="relative p-3 flex flex-col items-center rounded-lg   border-2 overflow-hidden"
          whileHover={{ scale: 1.05, zIndex: 10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Imagem */}
          <motion.img
            src={item.src}
            alt={item.alt}
            className="rounded-lg object-contain bg-transparent mb-4"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Texto e Informações sobre a Imagem */}
          <motion.div
            className="absolute p-2 inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white opacity-0"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-center mt-2">{item.description}</p>
             
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
