import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from '@vercel/analytics/react';
 
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ToolkitForSEO - AI-Powered SEO Tools",
  description: "A toolkit for SEO professionals to enhance their productivity and efficiency using AI.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
		<html lang='en'>
			<link
				rel='icon'
				href='/favicon.ico'
				type='image/x-icon'
			/>
			<script src="https://analytics.ahrefs.com/analytics.js" data-key="voEcCH/3yyMtWQq+My7DCg" async></script>
			<body
				className={inter.className}
				suppressHydrationWarning
			>
				<Analytics />
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}


import './globals.css'
