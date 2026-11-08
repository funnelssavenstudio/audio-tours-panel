"use client";

import { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { ModalProvider } from "./contexts/ModalServerError";
import ModalComponent from "./components/modals/ServerErrorModal";
import SessionExpiryWatcher from "./components/SessionExpiryWatcher";

interface LayoutProps {
  children: ReactNode;
  session?: Session;
}
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, session }: LayoutProps) {
  const router = useRouter();

  // next-themes es SSR-safe (el <html> ya tiene suppressHydrationWarning), asi
  // que envolvemos siempre con el ThemeProvider. El parche viejo con `isClient`
  // renderizaba primero sin tema y despues cambiaba a dark, provocando un flash.
  return (
    <HeroUIProvider navigate={router.push}>
      <ModalProvider>
        <ModalComponent />
        <SessionProvider session={session}>
          <SessionExpiryWatcher />
          <NextThemesProvider attribute="class" defaultTheme="dark">
            {children}
          </NextThemesProvider>
        </SessionProvider>
      </ModalProvider>
    </HeroUIProvider>
  );
}
