// components/ChatInProgress.js
import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, updateDoc, doc } from "firebase/firestore";
import db from "@/lib/firebase";
import { Button } from "../ui/button";
import { useUser } from "@clerk/nextjs";

const ChatInProgress = ({ chatId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useUser();

  useEffect(() => {
    if (!chatId) return;

    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");
    const q = query(messagesRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage || !chatId) return;

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      messages: [
        ...messages,
        {
          message: newMessage,
          timestamp: new Date(),
          sender: user.fullName,
        },
      ],
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg p-4 rounded-lg">
      <div className="flex overflow-y-auto mb-4">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={`p-2 mb-2 rounded ${msg.sender === user.fullName ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              <p><strong>{msg.sender}:</strong> {msg.message}</p>
            </div>
          ))
        ) : (
          <p>Nenhuma mensagem ainda.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Digite sua mensagem..."
        />
        <Button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSendMessage}
        >
          Enviar
        </Button>
      </div>
      <Button
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        onClick={onClose}
      >
        Fechar Chat
      </Button>
    </div>
  );
};

export default ChatInProgress;
