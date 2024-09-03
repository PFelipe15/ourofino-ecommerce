/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, SetStateAction } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { collection, doc, setDoc, updateDoc, query, where, onSnapshot } from "firebase/firestore";
import db from "@/lib/firebase";
import { Chat } from "../../../types/ChatType";

const ClientView = () => {
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<null | string>(null);
  const { user } = useUser();
  const [agentActive, setAgentActive] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("userId", "==", user.id));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
       const typeChatList = chatsList as unknown
        setChats( typeChatList as SetStateAction<Chat[]>);
        if (chatsList.length > 0 && !activeChat) {
          setActiveChat(chatsList[0].id); // Open the first chat by default
        }

        // Verifica se o atendente abriu o chat ativo
        const currentChat = chatsList.find(chat => chat.id === activeChat) as Chat;
        if (currentChat) {
          setAgentActive(currentChat.status === 'in progress' || false);
        }
      });

      return () => unsubscribe();
    };

    if (user) {
      fetchChats();
    }
  }, [user, activeChat]);

  const startNewChat = async () => {
    if (!user) return;
    const newChatRef = doc(collection(db, "chats"));
    await setDoc(newChatRef, {
      userId: user.id,
      user_Name: user.fullName,
      supportAgentName: null,
      supportAgentAvatar: null,
      messages: [],
      status: "open",
      agentIsActive: false, // Novo campo para indicar se o atendente abriu o chat
      user_avatar: user.imageUrl,
      createdAt: new Date().toISOString(),
    });
  };

  const addMessage = async (chatId:string, message:string, sender:string) => {
    const chatRef = doc(db, "chats", chatId);
    const chat = chats.find((chat) => chat.id === chatId);
    if (!chat) return;

    await updateDoc(chatRef, {
      messages: [
        ...chat.messages,
        {
          timestamp: new Date().toISOString(),
          sender,
          message,
        },
      ],
    });
  };

  const closeChat = async (chatId:string) => {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      status: "closed",
    });
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && activeChat) {
      addMessage(activeChat, newMessage, "user");
      setNewMessage(""); // Clear the input field after sending
    }
  };

  const handleChatClick = (chatId:string) => {
    if (activeChat === chatId) {
      setActiveChat(null); // Close chat if it's already active
    } else {
      setActiveChat(chatId); // Open the clicked chat
      const currentChat = chats.find((chat) => chat.id === chatId);
      setAgentActive(currentChat?.agentIsActive || false); // Atualiza o status de ativo do atendente
    }
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const handleWhatsAppRedirect = () => {
    window.location.href = "https://wa.me/SEUNUMERO"; // Substitua SEUNUMERO pelo número de WhatsApp real
  };

  return (
    <>
      <SignedOut>
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Por favor, faça login para ser atendido:
          </h3>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SignInButton mode="modal" fallbackRedirectUrl={"/"}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Criar Conta / Login
              </Button>
            </SignInButton>
            <Button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Quero ir para o WhatsApp
            </Button>
          </motion.div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="p-4 flex flex-col bg-gray-100 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
            Bem-vindo ao Suporte da Ourofino!
          </h3>
          <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: '70vh' }}>
          {chats.length > 0 ? (
  <div className="space-y-4">
    {chats.map((chat) => (
  <motion.div
    key={chat.id}
    className={`flex items-center  p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
      activeChat === chat.id ? "border-2 border-primary" : "border border-gray-200"
    }`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    onClick={() => handleChatClick(chat.id)}
  >
    {chat.supportAgentName && (
      <img
        alt="Support Avatar"
        src={chat.supportAgentAvatar || "./default-avatar.png"}
        className="w-12 h-12 rounded-full mr-4"
      />
    )}
    <div className="flex gap-2 flex-col">
      <p className="font-semibold text-gray-800 truncate">
        {chat.supportAgentName || "Aguardando atendente..."}
      </p>

      {chat.supportAgentName && (

      <p className="text-sm text-gray-500 truncate">
        Sou seu atendente!
      </p>
      )}
      {!chat.supportAgentName && (
        <p className="text-sm text-primary">Seu atendente responderá em breve.</p>
      )}
      
    </div>
    <Button
      className="ml-4   transition-transform transform hover:scale-110"
      onClick={(e) => {
        e.stopPropagation(); // Prevent closing chat when clicking on "Fechar"
        closeChat(chat.id);
      }}
    >
      Fechar  
    </Button>
  </motion.div>
))}

  </div>
) : (
  <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg shadow-md">
    <p className="text-gray-600 text-lg font-medium">Nenhum chat encontrado.</p>
    <Button
      onClick={handleNewChat}
      className="w-full bg-primary hover:bg-primary-dark text-white transition-all"
    >
      Novo Atendimento
    </Button>
    <Button
      onClick={handleWhatsAppRedirect}
      className="w-full bg-green-500 hover:bg-green-600 text-white transition-all"
    >
      Ir para WhatsApp
    </Button>
  </div>
)}

          </div>
          {activeChat && (
            <div className="flex flex-col border-t mt-4 pt-4">
              {agentActive ? (
                <div className="bg-green-100 text-green-600 p-2 rounded-lg text-center mb-4">
                  Seu atendente está disponível para chat agora.
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg text-center mb-4">
                  Você será respondido em breve.
                </div>
              )}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: '30vh' }}>
              <ul className="space-y-2">
  {chats
    .find((chat) => chat.id === activeChat)
    ?.messages.map((msg, index) => (
      <li
  key={index}
  className={`flex items-start p-2 space-x-3 rounded-lg text-sm ${
    msg.sender === "user"
      ? "justify-end"
      : "justify-start"
  }`}
>
  {msg.sender === "user" ? (
    <>
      <div className="flex items-start space-x-2">
        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs break-words">
          {msg.message}
        </div>
        <img
          src={user?.imageUrl || "./default-avatar.png"}
          alt="User Avatar"
          className="w-8 h-8 rounded-full"
        />
      </div>
      <p className="text-xs text-gray-500 self-end">{new Date(msg.timestamp).toLocaleTimeString()}</p>
    </>
  ) : (
    <>
      <img
        src={chats.find(chat => chat.id === activeChat)?.supportAgentAvatar || "./default-avatar.png"}
        alt="Support Agent Avatar"
        className="w-8 h-8 rounded-full mr-2"
      />
      <div className="flex flex-col">
        <div className="bg-gray-300 text-gray-800 p-3 rounded-lg max-w-xs break-words">
          {msg.message}
        </div>
        <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
      </div>
    </>
  )}
</li>
    ))}
</ul>

              </div>
              <div className="flex items-center mt-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                <Button
                  onClick={handleSendMessage}
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
};

export default ClientView;
