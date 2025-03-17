import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/layouts/AppLayout";

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
    <html lang='en'>
      <head>
        <link
          href='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </head>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
