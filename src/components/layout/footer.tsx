import { motion } from 'framer-motion';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const socialLinks = [
  { name: 'Facebook', icon: FaFacebookF, url: 'https://facebook.com' },
  { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com' },
  { name: 'LinkedIn', icon: FaLinkedinIn, url: 'https://linkedin.com' },
  { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com' },
];

const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Footer() {
  return (
    <motion.footer 
      className="w-full bg-gradient-to-r from-primary to-yellow-800 text-white py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white pb-2 inline-block">Sobre Nós</h3>
            <p>Somos uma empresa dedicada a fornecer soluções inovadoras para nossos clientes, sempre buscando excelência e qualidade em tudo o que fazemos.</p>
            <p>Nossa missão é transformar ideias em realidade, impulsionando o sucesso de nossos parceiros.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white pb-2 inline-block">Links Rápidos</h3>
            <ul className="space-y-2">
              {['Início', 'Serviços', 'Produtos', 'Sobre', 'Contato'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-yellow-300 transition-colors flex items-center">
                    <span className="mr-2">&#8227;</span> {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white pb-2 inline-block">Contato</h3>
            <p className="flex items-center"><MdEmail className="mr-2" /> contato@suaempresa.com</p>
            <p className="flex items-center"><MdPhone className="mr-2" /> (11) 9876-5432</p>
            <p className="flex items-center"><MdLocationOn className="mr-2" /> Av. Paulista, 1000 - São Paulo, SP</p>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white pb-2 inline-block">Siga-nos</h3>
            <div className="flex  space-x-4">
              {socialLinks.map((social) => (
                <motion.a 
                  key={social.name} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-primary p-3 rounded-full hover:bg-yellow-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
            <p>Fique por dentro das nossas novidades e promoções!</p>
            <form className="mt-4">
              <div className="flex flex-col  gap-2">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-grow p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-primary"
                />
                <button
                  type="submit"
                  className="bg-white text-primary px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
                >
                  Inscrever-se
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        <motion.div 
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-white/30 text-center text-sm"
        >
          <p>&copy; {new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
