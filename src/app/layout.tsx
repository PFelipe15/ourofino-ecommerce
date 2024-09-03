import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
const inter = Inter({ subsets: ["latin"] });
import { ptBR } from "@clerk/localizations";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Ourofino - Alianças ",
  description: "Loja de aliançãs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <ClerkProvider localization={ptBR}>
      <html lang="en">

        <body className={inter.className}>
      <Header />
        <ToastContainer />

          {children}
        </body>
      </html>
    </ClerkProvider>
  )

}
