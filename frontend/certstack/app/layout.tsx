import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertStack — Medical Exam Prep Platform",
  description: "AI-powered exam prep platform for medical students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, height: "100vh", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
