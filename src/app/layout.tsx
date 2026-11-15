import type { Metadata } from "next";import "./globals.css";import Header from "@/components/Header";import Footer from "@/components/Footer";
export const metadata:Metadata={title:"YAGA GROUP | Three Business Divisions",description:"YAGA MOBILES, YAGA GOLD & FASHION and YAGA DIGITAL NEXUS."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<Footer/></body></html>}
