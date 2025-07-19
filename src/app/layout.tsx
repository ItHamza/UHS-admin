import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layouts/AppLayout";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import {
  ClerkProvider
} from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "Urban Hospitality Services",
  description: "Admin Dashboard for Urban Hospitality Services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider  signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
      <html lang='en'>
        <head>
          <link
            href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
            rel='stylesheet'
          />
        </head>
        <body>
          <AppLayout>
            <Providers>{children}</Providers>
          </AppLayout>
          <Toaster position='bottom-center' />
        </body>
      </html>
    </ClerkProvider>

  );
}
