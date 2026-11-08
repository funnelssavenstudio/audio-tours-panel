// app/components/ThemeSwitcher.tsx
"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher({ layout }: { layout: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`flex ${
        layout === "login" ? "items-center justify-end cursor-pointer" : ""
      }`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {layout === "login" && <p className="text-xs mr-1">Cambiar modo</p>}
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Icon icon="bi:moon-fill" />
        ) : (
          <Icon icon="f7:sun-min-fill" />
        )}
      </Button>
    </div>
  );
}
