import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Bridge - Career Guidance Platform",
  description: "Choose Your Career Goal & Get Personalized Guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="flex justify-between items-center px-6 py-4 gap-4 h-16 bg-[#0a0e27] border-b border-gray-800">
            <nav className="flex items-center gap-6">
              <Link href="/landing" className="text-lg font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                SkillBridge Pro
              </Link>
              <SignedIn>
                <Link href="/landing" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Home
                </Link>
                <Link href="/guidance" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Guidance
                </Link>
                <Link href="/assignments" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Assignments
                </Link>
                <Link href="/progress" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Progress
                </Link>
                <Link href="/collaborate" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Collaborate
                </Link>
              </SignedIn>
            </nav>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm h-10 px-5 cursor-pointer transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/landing" />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
