/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { collection, query, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { InfoIcon, LayoutGrid, LayoutList, MoveLeft, X, ThumbsUp, MessageCircle } from "lucide-react";
import { MdQuestionMark } from "react-icons/md";

import db from "@/lib/firebase";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

import { Chat, Message } from "../../../../types/ChatType";

/**
 * AttendantView Component
 * 
 * Este componente representa a visão do atendente no sistema de chat.
 * Ele gerencia a lista de chats, mensagens, e interações do atendente.
 */
const AttendantView: React.FC = () => {
  // Estados relacionados aos chats
  const [chats, setChats] = useState<Chat[]>([]);
  const [openChats, setOpenChats] = useState<string[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [canceledChat, setCanceledChat] = useState<Chat | null>(null);

  // Estados relacionados às mensagens
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [newMessagesCount, setNewMessagesCount] = useState<Record<string, number>>({});

  // Estados de UI
  const [layout1, setLayout1] = useState<boolean>(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showExitChatModal, setShowExitChatModal] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);

  // Estados de filtro e busca
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");

  // Outros estados
  const { user } = useUser();
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [chatToExit, setChatToExit] = useState<string | null>(null);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);

  const statusTranslations: Record<string, string> = {
    open: "Aberto",
    "in progress": "Ocorrendo",
    closed: "Fechado",
    canceled: "Cancelado",
  };

  const defaultMessages = [
    { icon: <InfoIcon size={24} />, message: "Olá {user_Name}, como posso ajudar você hoje?" },
    { icon: <MdQuestionMark size={24} />, message: "Você tem alguma dúvida sobre nossos serviços?" },
    { icon: <ThumbsUp size={24} />, message: "Fico feliz em ajudar! O que mais você precisa?" },
    { icon: <MessageCircle size={24} />, message: "Sinta-se à vontade para me enviar uma mensagem!" },
  ];

  // Funções auxiliares
  const getStatusStyles = (status: "open" | "in progress" | "closed" | "canceled") => {
    switch (status) {
      case "open":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "closed":
        return "bg-red-200 text-gray-800";
      case "canceled":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  
  const handleSendDefaultMessage = async (message: string) => {
    const chat = await chats.find((c) => c.id === currentChat);
    const userName = chat?.user_Name || "Usuário";  
    const formattedMessage = message.replace("{user_Name}", userName || "Cliente");
    if (!formattedMessage || !currentChat || !user) return;
  
    try {
      const chatRef = doc(db, "chats", currentChat);
  
      await updateDoc(chatRef, {
        messages: arrayUnion({
          message: formattedMessage,
          timestamp: new Date().toISOString(),
          sender: user.fullName,
          senderAvatar: user.imageUrl,
          visualizado: false, // Define como false ao enviar uma nova mensagem
        }),
      });
  
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Efeitos
  useEffect(() => {
    const fetchChats = async () => {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef);
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsList: Chat[] = querySnapshot.docs.map((doc) => ({
          ...doc.data() as Omit<Chat, 'id'>,
          id: doc.id,
        }));
  
        setChats(chatsList);
  
        if (!currentChat) {
          chatsList.forEach((chat) => {
            const newMessages = chat.messages || [];
            const newMessagesNotViewed = newMessages.filter(
              (msg) =>
                !msg.visualizado &&
                new Date(msg.timestamp).getTime() > (lastCheckedTimestamp || 0) &&
                msg.sender !== user?.fullName
            );
  
            if (newMessagesNotViewed.length > 0) {
              setNewMessagesCount((prev) => ({
                ...prev,
                [chat.id]: (prev[chat.id] || 0) + newMessagesNotViewed.length,
              }));
            }
          });
        }
      });
  
      return () => unsubscribe();
    };
  
    fetchChats();
  }, [currentChat, lastCheckedTimestamp, user, newMessage]);
  
  useEffect(() => {
    if (currentChat) {
      const chatRef = doc(db, "chats", currentChat);
  
      const unsubscribe = onSnapshot(chatRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatData = docSnapshot.data() as Chat;
          const newMessages = chatData.messages || [];
  
          // Atualiza mensagens como visualizadas
          const updatedMessages = newMessages.map((msg) => ({
            ...msg,
            visualizado: true, // Marca todas as mensagens como visualizadas
          }));
  
          // Atualiza o Firestore com as mensagens modificadas
          await updateDoc(chatRef, { messages: updatedMessages });
  
          setMessages(updatedMessages);
          setLastCheckedTimestamp(new Date().getTime());
  
          // Reseta a contagem de novas mensagens para este chat
          setNewMessagesCount((prev) => ({
            ...prev,
            [currentChat]: 0,
          }));
        }
      });
  
      return () => unsubscribe();
    }
  }, [currentChat, user]);

  // Handlers
  const handleAttendChat = async (chatId: string) => {
    if (!user) return;

    if (!openChats.includes(chatId)) {
      setOpenChats((prev) => [...prev, chatId]); // Adiciona o chat à lista de chats abertos
    }
    setCurrentChat(chatId);

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      supportAgentName: user.fullName,
      status: "in progress",
      supportAgentAvatar: user.imageUrl,
    });

    const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data() as Chat;
        setMessages(chatData.messages || []);
      }
    });

    return unsubscribe;
  };

  const handleSendMessage = async () => {
     if (!newMessage || !currentChat || !user) return;
  
    try {
      const chatRef = doc(db, "chats", currentChat);
  
      await updateDoc(chatRef, {
        messages: arrayUnion({
          message: newMessage,
          timestamp: new Date().toISOString(),
          sender: user.fullName,
          senderAvatar: user.imageUrl,
          visualizado: false, // Define como false ao enviar uma nova mensagem
        }),
      });
  
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleCloseChat = async (chatId: string) => {
    setChatToExit(chatId);
    setShowExitChatModal(true);
  };

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value);
  };

  const handleChatClick = (chat: Chat) => {
    if (chat.status === "canceled") {
      setErrorMessage("Não é possível reabrir um chat cancelado.");
      setCanceledChat(chat);
      setShowErrorDialog(true);
    } else {
      handleAttendChat(chat.id);
    }
  };

  const toggleLayout = () => {
    setLayout1(!layout1);
  };

  const handleViewHistory = () => {
    if (canceledChat) {
      setCurrentChat(canceledChat.id);
      setMessages(canceledChat.messages || []);
      setIsViewingHistory(true);
      setShowErrorDialog(false);
    }
  };

  const confirmExitChat = async () => {
    if (!user || !chatToExit) return;

    const chatRef = doc(db, "chats", chatToExit);
    await updateDoc(chatRef, {
      status: "closed", // Atualiza o status para fechado
    });
    setOpenChats((prev) => prev.filter((id) => id !== chatToExit)); // Remove o chat da lista de chats abertos
    if (currentChat === chatToExit) {
      setCurrentChat(null); // Reseta o chat atual se for fechado
    }
    setShowExitChatModal(false);
    setChatToExit(null);
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDate(event.target.value);
  };

  const filteredChats = chats.filter((chat) => {
    const matchesStatus = filter === "all" || chat.status === filter;
    const matchesSearchTerm = chat.user_Name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearchDate = searchDate === "" || new Date(chat.timestamp).toLocaleDateString() === new Date(searchDate).toLocaleDateString();
    return matchesStatus && matchesSearchTerm && matchesSearchDate;
  });

  // Renderização
  return (
    <div className="space-y-8">
      <div className="flex space-x-4">
        {openChats.map((chatId) => {
          const chat = chats.find((c) => c.id === chatId);
          const userName = chat?.user_Name || "Usuário";  

          return (
            <div key={chatId}  className={`relative px-4 py-2 rounded-lg ${currentChat === chatId ? 'bg-blue-500 text-white' : 'bg-gray-200'} ${newMessagesCount[chatId] ? 'border-2 border-red-500' : ''}`} >

              <button
                 onClick={() => setCurrentChat(chatId)}
                 
              >
                {userName} {newMessagesCount[chatId] > 0 && <span className="text-red-500"> </span>} {/* Exibe contagem de novas mensagens */}
              </button>
                <button onClick={() => handleCloseChat(chatId)} className=" absolute   bg-primary hover:bg-red-500 hover:text-white hover:border-2 hover:border-white hover:scale-105 transition-all   rounded-full right-[-10px] top-[-10px] text-red-500"><X size={20} /></button>
            </div>
          );
        })}
      </div>

      {currentChat ? (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Histórico de Mensagens</h4>
            <div className="flex space-x-4">
            {!isViewingHistory && (
              <Button onClick={() => handleCloseChat(currentChat)} className="bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 transition duration-200">Sair do Chat</Button>
            )}
              <Button onClick={() => {
                setCurrentChat(null)
                setIsViewingHistory(false)
              }} className="bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg px-4 py-2 transition duration-200"> <MoveLeft size={20} /> </Button>
            </div>
          </div> 
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <span className={`text-xs font-bold py-1 px-2 rounded-full ${getStatusStyles(currentChat.status)}`}>
                {statusTranslations[currentChat.status]}
              </span>
             </div>
          </div>
          {/* Seção de Emojis */}
          
          <div className="mb-4 min-h-[400px] max-h-[400px] overflow-y-auto space-y-2 scroll-smooth">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 ${
                    msg.sender === user?.fullName ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === user?.fullName ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-start justify-center">
                          <p className={`bg-blue-500 text-white p-3 rounded-lg max-w-xs break-words ${!msg.visualizado ? 'font-bold' : ''}`}>
                            {msg.message}
                          </p>
                          <p className="text-xs text-gray-500 text-right mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <img
                          alt="Support Avatar"
                          src={user?.imageUrl || "./default-avatar.png"}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <img
                          alt="User Avatar"
                          src={
                            chats.find((chat) => chat.id === currentChat)
                              ?.user_avatar || "./default-avatar.png"
                          }
                          className="w-8 h-8 rounded-full mb-1"
                        />
                        <p className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className={`bg-gray-200 p-3 rounded-lg max-w-xs break-words ${!msg.visualizado ? 'font-bold' : ''}`}>
                        {msg.message}
                      </p>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma mensagem.</p>
            )}
          </div>
          {!isViewingHistory && (  
            <div className="flex  flex-col   space-x-2">
              {currentChat && (
            <div className="flex space-x-2 mb-4">
                {defaultMessages.map((msg, index) => (
                    <TooltipProvider key={index}>
                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    onClick={() => handleSendDefaultMessage(msg.message)}
                                    className="hover:scale-110 bg-primary text-white p-2 rounded-md transition-all"
                                >
                                    {msg.icon}  
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{msg.message.replace("{user_Name}", currentChat.user_Name || "Cliente")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
          )}
          <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2"
                placeholder="Digite sua mensagem"
              />
              <Button onClick={handleSendMessage} className="bg-blue-500 text-white hover:bg-blue-600">Enviar</Button>
            </div>

          </div>
          )}
        </div>
      ) : ( // Se não houver chat aberto, exibe a lista de chats
        <div className="space-y-4 flex flex-col">
          {chats.length === 0 ? ( // Verifica se não há chats
            <p className="text-center text-gray-500">Não há chats para atendimento, você está livre.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">

                <Button size={'icon'} onClick={toggleInfoModal} className="bg-primary text-white hover:bg-yellow-800"><InfoIcon size={20} /></Button>  
                <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
        <Button size={'icon'} onClick={toggleLayout} className="bg-gray-300 text-gray-700 hover:bg-gray-400">
                  {layout1 ? <LayoutGrid size={20} /> : <LayoutList size={20} />}
                </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mudar Layout de exibição dos chats</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
                
                </div>
                <select value={filter} onChange={handleFilterChange} className="border border-gray-300 rounded-lg p-2">
                  <option value="all">Todos</option>
                  <option value="open">Abertos</option>
                  <option value="in progress">Em andamento</option>
                  <option value="closed">Fechados</option>
                  <option value="canceled">Cancelados</option>
                </select>
              </div>
              <div className="flex gap-2 flex-col md:flex-row md:gap-4 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className="  flex-1 border border-gray-300 rounded-lg p-2"
                  placeholder="Buscar por usuário"
                />
                <input
                  type="date"
                  value={searchDate}
                  onChange={handleSearchDateChange}
                  className=" flex-2 md:flex-1 border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className={`grid ${layout1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 min-h-[500px] max-h-[500px] content-start overflow-y-scroll` }>
      {filteredChats.map((chat) => {
        const lastMessage = chat.messages?.[chat.messages.length - 1]; // Obtém a última mensagem
        return layout1 ? ( // Verifica se está no layout 1
          <TooltipProvider>
  <Tooltip>
    <TooltipTrigger className="w-full">
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleChatClick(chat);
        }}
        className="flex cursor-pointer items-center p-4 justify-between rounded-lg shadow-lg transition-transform hover:scale-105 bg-white border border-gray-300 hover:shadow-xl w-full"
      >
        <div className="flex items-center gap-2 md:gap-4 w-full">
          <img
            alt="User Avatar"
            src={chat.user_avatar}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-gray-300 flex-shrink-0"
          />
          <div className="flex flex-col gap-1 flex-grow min-w-0">
            <p className="text-base md:text-lg font-semibold truncate">
              {chat.user_Name.split(' ')[0]}
            </p>
            <p className={`text-xs font-bold p-1 rounded-md inline-block ${getStatusStyles(chat.status)}`}>
              {statusTranslations[chat.status]}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {new Date(chat.createdAt).toLocaleDateString()}
            </p>
          </div>
          {newMessagesCount[chat.id] > 0 && (
            <div className="flex-shrink-0">
              <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                {newMessagesCount[chat.id]}
              </span>
            </div>
          )}
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      Última mensagem: {lastMessage ? lastMessage.message : 'Nenhuma mensagem'}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

        ) : (  
          <div
            key={chat.id}
            onClick={(e) => {
              e.stopPropagation();
              handleChatClick(chat);
            }}
            className={`flex cursor-pointer items-center p-4 max-h-[150px] justify-between rounded-lg shadow-lg transition-transform hover:scale-105 bg-white border border-gray-300 hover:shadow-xl relative`}
          >
            <div className="flex items-center gap-2   ">
              <img
                alt="User Avatar"
                src={chat.user_avatar}
                className="w-14 h-14 rounded-full border-2 border-gray-300"
              />
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold">{chat.user_Name}</p>
                <p className={`text-sm font-bold p-1 rounded-md  absolute right-2  ${getStatusStyles(chat.status)}`}>
                  {statusTranslations[chat.status]}
                </p>
                
                 <p className="text-sm text-gray-600">
                  Última mensagem: {lastMessage ? lastMessage.message : 'Nenhuma mensagem'}
                </p>
                <p className="text-sm text-gray-600"> {new Date(chat.createdAt).toLocaleDateString()}</p>

               </div>
              {newMessagesCount[chat.id] > 0 && (
                <div className="">
                  <span className="absolute -top-0 w-5 h-5 -left-0 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">

                   </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
            </>
          )}
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
          <DialogHeader className="flex flex-col items-center">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={120}
              height={60}
              className="mb-4"
            />
            <DialogTitle className="text-2xl font-bold text-gray-800">Atenção</DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <div className="bg-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                Lembre-se: Suas ações afetam diretamente a experiência do cliente. Considere cuidadosamente antes de prosseguir.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                onConfirmCallback(null);
              }}
              className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDialogOpen(false);
                onConfirmCallback(true);
              }}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showInfoModal && (
        <Dialog open={showInfoModal} onOpenChange={toggleInfoModal}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
            <DialogHeader className="flex flex-col items-center">
              <Image
                src="/logotipoourofino.svg"
                alt="Ourofino Logo"
                width={120}
                height={60}
                className="mb-4"
              />
              <DialogTitle className="text-2xl font-bold text-gray-800">Informações sobre Atendimento ao Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <section>
                <h5 className="text-md font-semibold mb-2">Status dos Chats</h5>
                <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                  <li><strong>Aberto:</strong> O chat está disponível para atendimento.</li>
                  <li><strong>Em andamento:</strong> O atendimento está ativo.</li>
                  <li><strong>Fechado:</strong> O chat foi encerrado.</li>
                  <li><strong>Cancelado:</strong> O atendimento foi cancelado. Somente o usuário pode cancelar um chat.</li>
                </ul>
              </section>
              <section>
                <h5 className="text-md font-semibold mb-2">Como Abrir um Chat</h5>
                <p className="text-sm text-gray-700 mb-2">
                  Para abrir um chat, clique em um dos cards de chat na lista. Se o chat estiver aberto ou em andamento, você poderá enviar mensagens.
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Se o chat estiver cancelado, você poderá visualizar o histórico, mas não poderá enviar novas mensagens.
                </p>
              </section>
              <section>
                <h5 className="text-md font-semibold mb-2">Tutoriais</h5>
                <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                  <li><a href="#" className="text-blue-500 hover:underline">Como iniciar um atendimento</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Como encerrar um atendimento</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Como visualizar o histórico de mensagens</a></li>
                </ul>
              </section>
            </div>
            <DialogFooter className="sm:justify-center space-x-4 mt-6">
              <Button
                onClick={toggleInfoModal}
                className="w-full sm:w-auto bg-primary text-white hover:bg-yellow-700"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {showErrorDialog && (
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
            <DialogHeader className="flex flex-col items-center">
              <Image
                src="/logotipoourofino.svg"
                alt="Ourofino Logo"
                width={170}
                height={170}
                className="mb-4"
              />
              <DialogTitle className="text-xxl font-bold text-gray-800">Atenção!</DialogTitle>
              <DialogDescription className="text-center text-gray-600 mt-2">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center space-x-4 mt-6">
              <Button
                onClick={() => setShowErrorDialog(false)}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              >
                Fechar
              </Button>
              {canceledChat && (
                <Button
                  onClick={handleViewHistory}
                  className="w-full sm:w-auto bg-primary text-white hover:bg-yellow-700"
                >
                  Ver Histórico
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={showExitChatModal} onOpenChange={setShowExitChatModal}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-yellow-50 to-yellow-100">
          <DialogHeader className="flex flex-col items-center">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={120}
              height={60}
              className="mb-4"
            />
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar saída do chat</DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Você tem certeza que deseja sair do chat? Informe ao cliente que você terá que sair do atendimento por tempo indeterminado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <div className="bg-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                Lembre-se: Sua saída afetará diretamente a experiência do cliente. Certifique-se de que todas as questões foram resolvidas antes de sair.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowExitChatModal(false)}
              className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmExitChat}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmar saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendantView;