"use client";
import { useTheme } from "next-themes";

export default function AccessDeniedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <section
      className={`flex p-4 h-screen justify-center ${
        theme === "dark"
          ? "[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#210060_100%)]"
          : "[background:radial-gradient(125%_125%_at_50%_10%,#FFF_40%,#05d9e8_100%)]"
      }`}
    >
      {children}
    </section>
  );
}
