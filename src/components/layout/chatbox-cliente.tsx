import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { Button } from "../ui/button";
import { useUser } from "@clerk/nextjs";
import { collection, getDocs } from "firebase/firestore";
import db from "@/lib/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import AttendantView from "./attendant-view";
import ClientView from "./client-view";

export default function SuporteOurofino() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasMinimized, setHasMinimized] = useState(false);
  const [typeUser, setTypeUser] = useState("client");
  const { user } = useUser();

  const [valueTypeUser, loadingTypeUser, errorTypeUser] = useCollection(
    collection(db, "userAttendant"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

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
    const getTypeUser = async () => {
      if (!user) return;

      const attendantsSnapshot = await getDocs(collection(db, "userAttendant"));

      const isAttendant = attendantsSnapshot.docs.some(
        (doc) => doc.data().user_Id === user.id
      );

       
      setTypeUser(isAttendant ? "attendant" : "client");
    };

    getTypeUser();
  }, [user]);


const handleHasClosed=()=>{
   setIsOpen(false);
  setHasMinimized(true);
}

  return (
    <>
      {isOpen && !isMinimized && (
        <motion.div
          className="fixed z-50 bottom-0 right-0 w-full md:w-[500px] bg-white shadow-lg rounded-t-lg border border-gray-300 min-h-[600px]"
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
              onClick={() => setIsOpen(false)}
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="p-4">
            {typeUser === "client" ? <ClientView /> : <AttendantView />}
          </div>
        </motion.div>
      )}

      {!isOpen && (
        <button
          className="fixed bottom-0 right-0 m-4 bg-primary text-white p-5 rounded-full shadow-lg transition-transform transform hover:scale-110"
          onClick={()=>{setIsOpen(true)}}
        >
          <FiMessageCircle size={24} />
        </button>
      )}
    </>
  );
}
