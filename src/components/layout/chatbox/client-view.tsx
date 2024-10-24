/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { collection, doc, setDoc, updateDoc, query, where, onSnapshot, or, arrayUnion } from "firebase/firestore";
import db from "@/lib/firebase";
import { Chat } from "../../../../types/ChatType";
import { MdOutlineClose, MdWhatsapp } from "react-icons/md";
import { TbH1, TbUserQuestion } from "react-icons/tb";
import getAllDefaultMessages, { DefaultMessageProps } from "@/_actions/Messages";
import { FiSend } from "react-icons/fi";
import { SendHorizontalIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import Image from "next/image";

const ClientView = ({ requeredLogin }: { requeredLogin: boolean }) => {
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [showResponseMessage, setShowResponseMessage] = useState(false);
  const { user } = useUser();
  const [activeChat, setActiveChat] = useState<null | string>(null);
  const [agentActive, setAgentActive] = useState(false);
  const [defaultClientMessages  , setDefaultClientMessages] = useState<DefaultMessageProps | null>(null);
  const [hasNewChat, setHasNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [anonymousId, setAnonymousId] = useState('');
  const [anonymousChat, setAnonymousChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [chatToCancel, setChatToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !requeredLogin) {
      setAnonymousId(uuidv4());
    }
  }, [user, requeredLogin]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChats = async () => {
      if (!user && !requeredLogin && !anonymousId) return;
  
      const chatsRef = collection(db, "chats");
  
      const q = query(
        chatsRef,
        where("status", "in", ["open", "in progress", "closed"]),
        where("userId", "==", requeredLogin ? (user ? user.id : anonymousId) : user ? user.id : anonymousId)
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];
        
        setChats(chatsList);
  
        if (chatsList.length > 0) {
          const latestChat = chatsList[0];
          setActiveChat(latestChat.id);
          setAgentActive(latestChat.status === "in progress");
          setMessages(latestChat.messages || []);
        }
  
        // Atualiza o chat ativo se ele existir na lista
        const currentActiveChat = chatsList.find((chat) => chat.id === activeChat);
        if (currentActiveChat) {
          setAgentActive(currentActiveChat.status === "in progress");
        }
      });
  
      return () => {
        unsubscribe();
      };
    };
  
    fetchChats();
  }, [user, activeChat, anonymousId, requeredLogin]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    if (!user && anonymousChat) {
      setChats([anonymousChat]);
      setActiveChat(anonymousChat.id);
    }
  }, [user, anonymousChat]);

  const startNewChat = async () => {
    if (!user && requeredLogin) return;
    const newChatRef = doc(collection(db, "chats"));
    const newChatData = {
      userId: user ? user.id : anonymousId,
      user_Name: user ? user.fullName : `Anônimo_${anonymousId.slice(0, 8)}`,
      supportAgentName: null,
      supportAgentAvatar: null,
      messages: [],
      status: "open",
      agentIsActive: false,
      user_avatar: user ? user.imageUrl : "./anonymous.png",
      createdAt: new Date().toISOString(),
    };

    await setDoc(newChatRef, newChatData);

    if (!user) {
      setAnonymousChat({ id: newChatRef.id, ...newChatData });
    }

    const defaultMessages = await getAllDefaultMessages()
    setDefaultClientMessages(defaultMessages);
    setHasNewChat(true);
    setActiveChat(newChatRef.id);
  };

  const handleDefaultMessage = async (message:string) => {
     if (message && activeChat) {
      addMessage(activeChat, message, "user");
      setNewMessage("");  
    }  }

  const addMessage = async (chatId:string, message:string, sender:string) => {
    const chatRef = doc(db, "chats", chatId);
    const newMessage = {
      timestamp: new Date().toISOString(),
      sender,
      message,
    };

    await updateDoc(chatRef, {
      messages: arrayUnion(newMessage),
    });

    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const closeChat = async (chatId: string) => {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      status: "canceled",
    });
    
    if (activeChat === chatId) {
      setActiveChat(null);
    }
    
    // Remover o chat da lista local
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    
    // Se for um chat anônimo, limpar o estado do chat anônimo
    if (!user) {
      setAnonymousChat(null);
    }
  };

  const handleSendMessage = () => {
    
    if (newMessage.trim() && activeChat) {
      addMessage(activeChat, newMessage, "user");
      setNewMessage("");  
    }

   
  };


  const handleChatClick = (chatId:string) => {
    if (activeChat === chatId) {
      setActiveChat(null);
    } else {
      setActiveChat(chatId);
      const currentChat = chats.find((chat) => chat.id === chatId);
      setAgentActive(currentChat?.agentIsActive || false);
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
    setShowResponseMessage(true);
    setTimeout(() => {
      setShowResponseMessage(false);
    }, 3000);
  };

  const handleWhatsAppRedirect = () => {
    window.location.href = "https://wa.me/SEUNUMERO";
  };

  const isBusinessHours = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
     return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  };

  const handleRequestResponse = () => {
    setShowResponseMessage(true);
    setTimeout(() => {
      setShowResponseMessage(false);
    }, 3000);
  };

  const handleCancelClick = (chatId: string) => {
    setChatToCancel(chatId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (chatToCancel) {
      await closeChat(chatToCancel);
      setShowCancelModal(false);
      setChatToCancel(null);
    }
  };

  const WelcomeScreen = () => (
    <div className="bg-white  rounded-lg   overflow-hidden">
      <div className="px-2  py-4 sm:p-10 bg-gradient-to-r from-yellow-100 to-yellow-200">
        <div className="flex items-center justify-center mb-6">
          <img src="./logotipoourofino.svg" alt="Ourofino Logo" className="h-20 w-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Bem-vindo ao Suporte da Ourofino
        </h3>
        <p className="text-lg text-gray-600 text-center">
          Como podemos ajudar você hoje?
        </p>
      </div>
      
      <div className="p-6 space-y-4 bg-yellow-50">
        <button onClick={handleNewChat} className="w-full flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-yellow-100">
          <div className="bg-yellow-200 p-3 rounded-full mr-4">
            <TbUserQuestion className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-left">
            <h4 className="text-lg font-semibold text-gray-800">Iniciar Chat</h4>
            <p className="text-sm text-gray-600">
              Deixe sua mensagem e retornaremos em breve.
            </p>
          </div>
        </button>
        
        <button onClick={handleWhatsAppRedirect} className="w-full flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-green-100">
          <div className="bg-green-200 p-3 rounded-full mr-4">
            <MdWhatsapp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-left">
            <h4 className="text-lg font-semibold text-gray-800">WhatsApp</h4>
            <p className="text-sm text-gray-600">Prefere conversar pelo WhatsApp? Clique aqui.</p>
          </div>
        </button>
      </div>
      
      {!isBusinessHours() && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="font-semibold text-red-800 text-center mb-1">Fora do Horário de Atendimento</p>
          <p className="text-sm text-red-700 text-center">
            Nosso horário de atendimento é de segunda a sexta, das 9h às 17h.
          </p>
          <p className="text-sm text-red-700 text-center mt-1">
            Deixe sua mensagem e retornaremos assim que possível!
          </p>
        </div>
      )}
    </div>
  );

  const LoginRequiredScreen = () => (
    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 min-h-[600px] rounded-lg shadow-lg overflow-hidden p-8">
      <div className="flex justify-center mb-8">
        <img src="./logotipoourofino.svg" alt="Ourofino Logo" className="h-20 w-auto" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Bem-vindo ao Suporte da Ourofino!
      </h3>
      <p className="text-md text-gray-600 text-center mb-8">
        Para obter assistência, faça login ou crie uma conta.
      </p>
      <div className="space-y-4">
        <SignInButton mode="modal" fallbackRedirectUrl={"/"}>
          <button className="w-full bg-yellow-400 text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-yellow-500 transition duration-300 ease-in-out">
            Criar Conta / Login
          </button>
        </SignInButton>
        <button 
          onClick={handleWhatsAppRedirect}
          className="w-full bg-green-500 text-white font-medium py-3 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300 ease-in-out flex items-center justify-center space-x-2"
        >
          <MdWhatsapp className="w-5 h-5" />
          <span>Fale Conosco pelo WhatsApp</span>
        </button>
      </div>
      <p className="mt-8 text-center text-gray-600 text-sm">
        Estamos aqui para ajudar você!<br />
        Horário de atendimento: 9h às 17h, de segunda a sexta.
      </p>
    </div>
  );

  return (
    <>
      {requeredLogin ? (
        <SignedOut>
          <LoginRequiredScreen />
        </SignedOut>
      ) : null}

      {!requeredLogin || (requeredLogin && user) ? (
        <div className="p-4 flex flex-col min-h-[600px] rounded-lg transition-all duration-500">
          {chats.length === 0 && !anonymousChat ? (
            <WelcomeScreen />
          ) : (
            <>
              <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
                Suporte da Ourofino
              </h3>
              <div className="flex-1 mb-4" style={{ maxHeight: "70vh" }}>
                {chats.length > 0 || anonymousChat ? (
                  <div className="space-y-4">
                    {(chats.length > 0 ? chats : [anonymousChat]).map((chat) => (
                      <motion.div
                        key={chat?.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg transition-all transform ${
                          activeChat === chat?.id
                            ? "border-2 border-primary bg-white"
                            : "border border-gray-200 bg-gray-100"
                        } hover:shadow-xl hover:scale-105`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => handleChatClick(chat?.id)}
                      >
                        {chat?.supportAgentName && (
                          <img
                            alt="Support Avatar"
                            src={chat.supportAgentAvatar || "./default-avatar.png"}
                            className="w-14 h-14 rounded-full mr-4"
                          />
                        )}
                        <div className="flex gap-2 flex-col w-full">
                          <p className="font-semibold text-gray-900 truncate">
                            {chat?.supportAgentName ? chat?.supportAgentName.split(" ").slice(0, 3).join(" ") : "Aguardando atendente..."}
                          </p>
                          {chat?.supportAgentName ? (
                            <p className="text-sm text-gray-500 truncate">
                              Sou seu atendente!
                            </p>
                          ) : (
                            <p className="text-sm text-primary">
                              Seu atendente responderá em breve.
                            </p>
                          )}
                        </div>
                        <Button
                          className="ml-4 bg-red-500 text-white hover:bg-red-600 transition-transform transform hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelClick(chat?.id);
                          }}
                        >
                          <span className="hidden md:inline">Cancelar</span>
                          <MdOutlineClose className="block md:hidden" size={20}/>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                   
                  <div className="space-y-4 p-6 rounded-lg bg-gray-50 shadow-lg">
                  <h4 className="text-xl font-bold text-gray-800">Como podemos ajudar você hoje?</h4>
                  <p className="text-sm text-gray-600">
                    Nossa equipe está pronta para atender suas necessidades. Escolha uma das opções abaixo para iniciar.
                  </p>
                  {isBusinessHours() ? (
                    <div
                      className="flex items-center p-4 bg-yellow-200 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                      onClick={handleNewChat}
                    >
                      <TbUserQuestion className="w-12 h-12 mr-4 text-yellow-600" />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800 text-lg">
                          Atendente Online
                        </p>
                        <p className="text-sm text-gray-600">
                          Clique para falar agora
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center p-4 bg-gray-200 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
                      onClick={handleNewChat}
                    >
                      <TbUserQuestion className="w-12 h-12 mr-4 text-gray-600" />
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800 text-lg">
                          Solicitar Atendimento Prévio
                        </p>
                        <p className="text-sm text-gray-500">
                          Responderemos assim que possível
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={handleWhatsAppRedirect}
                  >
                    <MdWhatsapp className="w-12 h-12 mr-4 text-green-600" />
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800 text-lg">WhatsApp</p>
                      <p className="text-sm text-gray-500">
                        Inicie a conversa no WhatsApp
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-blue-100 rounded-lg shadow-md">
                    <p className="text-gray-800">
                      Dicas: Você pode perguntar sobre nossos produtos, serviços ou suporte técnico.
                    </p>
                  </div>
                  <div className="flex items-center p-4 bg-green-100 rounded-lg shadow-md">
                    <p className="text-gray-800">
                      Estamos aqui para ajudar! Não hesite em nos contatar.
                    </p>
                  </div>
                </div>
                )}
              </div>
              {activeChat !== null && (
                <div className="flex flex-col border-t mt-4 pt-4 ">
                  {agentActive ? (
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg text-center mb-4">
                      Seu atendente está disponível para chat agora.
                    </div>
                  ): (
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg text-center mb-4">
                      Seu atendente não está disponível para chat agora.
                    </div>
                  )}
                  {!isBusinessHours() && (
                    <div className="bg-red-200 text-red-800 p-4 rounded-lg shadow-md mb-4 animate-pulse">
                      <h4 className="font-bold">Atendimento Fora do Horário Comercial!</h4>
                      <p>
                        No momento, nosso atendimento está fechado. Estamos disponíveis de segunda a sexta, das 9h às 17h.
                      </p>
                      <p>
                        Por favor, deixe sua mensagem e retornaremos assim que possível!
                      </p>
                    </div>
                  )}
                  <div
                    className="flex-1 overflow-y-auto"
                    style={{ maxHeight: "30vh" }}
                  >
                 
                    {hasNewChat && (
                      <div className="space-y-2 p-2">
                        {defaultClientMessages?.data.map((msg) => (
                          <motion.div
                            key={msg.id}
                            className="flex items-center p-3 bg-white rounded-lg shadow-md hover:bg-yellow-50 cursor-pointer transition-all"
                            onClick={() => {
                              handleDefaultMessage(msg.attributes.mensagem);
                            }}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-gray-700 flex-grow">{msg.attributes.mensagem}</p>
                            <FiSend
                              className="text-yellow-600 ml-2 hover:scale-110 transition-transform"
                              size={20}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <ul className="space-y-2 min-h-[30vh] overflow-y-auto">
                      {messages.map((msg, index) => (
                        <li
                          key={index}
                          className={`flex items-start p-2 space-x-3 rounded-lg text-sm ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.sender === "user" ? (
                            <div className="flex gap-2 justify-center  ">
                              <div className="flex gap-1  flex-col">
                                <div className="bg-primary text-white p-3 rounded-lg max-w-xs break-words">
                                  {msg.message}
                                </div>
                                
                              <p className="text-xs text-gray-500 self-end">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                              </div>
                              <img
                                  src={user?.imageUrl || "./anonymous.png"}
                                  alt="User Avatar"
                                  className="w-8 h-8 rounded-full"
                                />
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <img
                                src={
                                  chats.find((chat) => chat.id === activeChat)
                                    ?.supportAgentAvatar || "./default-avatar.png"
                                }
                                alt="Support Agent Avatar"
                                className="w-8 h-8 rounded-full  "
                              />
                              <div className="flex flex-col">
                                <div className="bg-gray-300 text-gray-800 p-3 rounded-lg max-w-xs break-words">
                                  {msg.message}
                                </div>
                                <p className="text-xs text-gray-500  ">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-center mt-6 space-y-4 bg-white p-2 md:p-6 rounded-lg shadow-md">
                    <div className="flex w-full items-center space-x-4 box-content">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        className="flex-2 p-3  border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-300"
                      />
                                    <Button
                      onClick={handleSendMessage}
                      className="flex items-center justify-center ml-4 bg-primary text-white hover:bg-yellow-700 transition-transform transform hover:scale-110"
                    >
                     <SendHorizontalIcon size={20}/>
                      <span className="hidden md:inline">Enviar</span>
                    </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
          <DialogHeader className="flex flex-col items-center">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={220}
              height={120}
              className="mb-4"
            />
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar cancelamento</DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
            Ao cancelar, você encerrará esta conversa e não poderá retomá-la.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
             
            <div className="bg-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                Lembre-se: Nossos atendentes estão aqui para ajudar. Se tiver dúvidas, é melhor continuar a conversa.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Voltar ao chat
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientView;