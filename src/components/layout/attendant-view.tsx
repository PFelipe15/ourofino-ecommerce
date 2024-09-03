/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";
import db from "@/lib/firebase";
import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Chat, Message } from "../../../types/ChatType";
 

const AttendantView: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessagesCount, setNewMessagesCount] = useState<Record<string, number>>({});
  const { user } = useUser();
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<number | null>(null);

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

  const handleAttendChat = async (chatId: string) => {
    if (!user) return;

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      supportAgentName: user.fullName,
      status: "in progress",
      supportAgentAvatar: user.imageUrl,
    });
    setCurrentChat(chatId);

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
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      status: "closed",
    });
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChat === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
  };

  const getStatusStyles = (status: "open" | "in progress" | "closed") => {
    switch (status) {
      case "open":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "closed":
        return "bg-red-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className=" space-y-8">
      {chats.length > 0 ? (
        <div className="space-y-4 flex flex-col">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={(e) => {
                e.stopPropagation();
                handleAttendChat(chat.id);
              }}
              className={`flex cursor-pointer items-center p-2 justify-between rounded-lg shadow-lg transition-transform hover:scale-105 ${getStatusStyles(
                chat.status
              )}`}
            >
              <div className="flex items-center space-x-4">
                <img
                  alt="User Avatar"
                  src={chat.user_avatar}
                  className="w-14 h-14 rounded-full border-2 border-gray-300"
                />
                <div>
                  <p className="text-lg font-semibold">{chat.user_Name}</p>
                  <p className="text-sm font-medium">
                    Status:{" "}
                    {chat.status.charAt(0).toUpperCase() +
                      chat.status.slice(1)}
                  </p>
                </div>
                {newMessagesCount[chat.id] > 0 && (
                  <div className="relative">
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                      {newMessagesCount[chat.id] / 2}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Nenhum atendimento em andamento.
        </p>
      )}

      {currentChat && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="text-lg font-semibold mb-4">Histórico de Mensagens</h4>
          <div className="mb-4 max-h-[400px] overflow-y-auto space-y-2 scroll-smooth">          {messages.length > 0 ? (
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
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2"
              placeholder="Digite sua mensagem"
            />
            <Button onClick={handleSendMessage}>Enviar</Button>
            <Button
              onClick={() => handleCloseChat(currentChat)}
              className="bg-red-500 text-white"
            >
              Fechar Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendantView;
