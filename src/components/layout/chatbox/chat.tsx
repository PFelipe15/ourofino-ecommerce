/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiX, FiLoader } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { collection, getDocs } from "firebase/firestore";
import db from "@/lib/firebase";
import AttendantView from "./attendant-view";
import ClientView from "./client-view";
import { getParametroLoginRequeridoAtendimento } from "@/_actions/Parametros";

export default function SuporteOurofino() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasMinimized, setHasMinimized] = useState(false);
  const [typeUser, setTypeUser] = useState('client');
  const [loading, setLoading] = useState(false);
  const [requeredLogin, setRequeredLogin] = useState(true);
  const { user } = useUser();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const getTypeUser = async () => {
      if(!isOpen) return;
      if (!user && requeredLogin) {
        return;
      }

      setLoading(true);
      const attendantsSnapshot = await getDocs(collection(db, "userAttendant"));

      const isAttendant = user && attendantsSnapshot.docs.some(
        (doc) => doc.data().user_Id === user.id
      );

      setTypeUser(isAttendant ? "attendant" : "client");
      setLoading(false);
    };

    getTypeUser();
  }, [user, requeredLogin]);

  useEffect(() => {
    if(hasMinimized){
      const autoOpenInterval = setInterval(() => {
        setIsOpen(true);
        setIsMinimized(false);
      }, 80000);

      return () => clearInterval(autoOpenInterval);
    }
  }, [hasMinimized]);

  useEffect(() => {
    const getParametros = async () => {
      const requeredLoginBoolean = await getParametroLoginRequeridoAtendimento();
      setRequeredLogin(requeredLoginBoolean);
    }
    getParametros();
  }, []);

  useEffect(() => {
    const chatInteracted = localStorage.getItem('chatInteracted');
    if (chatInteracted) {
      setHasInteracted(true);
    } else {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasInteracted(true);
        localStorage.setItem('chatInteracted', 'true');
      }, 60000); // Abre após 1 minuto

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {loading ? (
        <div className="fixed z-50 bottom-0 right-0 w-full md:w-[500px] bg-white shadow-lg rounded-t-lg border border-gray-300 min-h-[600px] md:min-h-[650px] flex flex-col items-center justify-center space-y-6">
          <img src="./logotipoourofino.svg" alt="Logo da Empresa" className="w-48 h-48 md:w-56 md:h-56 animate-pulse" />
          <div className="flex flex-col items-center">
            <FiLoader className="animate-spin text-primary w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold text-primary">Preparando o suporte...</h2>
          </div>
        </div>
      ) : (
        isOpen && !isMinimized && (
          <motion.div
            className="fixed z-50 bottom-0 right-0 w-full bg-white shadow-lg rounded-t-lg border border-gray-300 md:w-[500px] md:max-h-[650px] max-h-[90vh]"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="p-4 border-b flex justify-between items-center bg-primary rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-800">
                {typeUser === "client" ? "Suporte ao Cliente" : "Suporte ao Atendente"}
              </h2>
              <button
                className="text-gray-600 hover:text-gray-800 transition-transform transform hover:scale-110"
                onClick={() => {
                  setIsOpen(false);
                  setHasMinimized(true);
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4">
              {typeUser === "client" ? (
                <ClientView requeredLogin={requeredLogin} />
              ) : (
                <AttendantView />
              )}
            </div>
          </motion.div>
        )
      )}

      {!isOpen && (
        <button
          className="fixed bottom-0 right-0 m-4 bg-primary text-white p-5 rounded-full shadow-lg transition-transform transform hover:scale-110"
          onClick={() => {
            setIsOpen(true);
            setHasInteracted(true);
            localStorage.setItem('chatInteracted', 'true');
          }}
        >
          <FiMessageCircle size={24} />
        </button>
      )}
    </>
  );
}
