"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  generalItemsMenu,
  toursItemsMenu,
  adminItemsMenu,
  internalRoutes,
  backofficeSections,
} from "@/data/menuItems";
import Sidebar from "@/app/components/theme/Sidebar";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ThemeSwitcher } from "@/app/components/theme/ThemeSwitcher";
import { useTheme } from "next-themes";
import withAuth from "@/helpers/withAuth";

const BackOfficeLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme, setTheme } = useTheme();
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const getTitle = (currentPath: string) => {
    const menuItems = [
      ...generalItemsMenu,
      ...toursItemsMenu,
      ...adminItemsMenu,
    ];
    const exactMatch = menuItems.find((item) => item.href === currentPath);
    if (exactMatch) return exactMatch.title;

    const internalMatch = internalRoutes.find(
      (item) =>
        currentPath === item.href || currentPath.startsWith(`${item.href}/`),
    );
    return internalMatch ? internalMatch.title : "";
  };

  const title = getTitle(currentPath);

  const backSection = backofficeSections.find(
    (section) =>
      currentPath.startsWith(`${section.basePath}/`) &&
      currentPath !== section.basePath,
  );

  return (
    <div
      className={`flex ${
        theme === "dark"
          ? "[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#210060_100%)]"
          : "[background:radial-gradient(125%_125%_at_50%_10%,#FFF_40%,#05d9e8_100%)]"
      }`}
    >
      <Sidebar isOpen={isOpen} toggle={toggleSidebar} />
      <motion.div
        initial={{ marginLeft: "280px" }}
        animate={{ marginLeft: isOpen ? "280px" : "0px" }}
        transition={{
          duration: 0.4,
          type: "spring",
          damping: 15,
        }}
        className={`flex-auto`}
      >
        <div className="flex min-h-screen w-full flex-1 flex-col px-8 py-6 items-center">
          <header className="flex w-full max-w-7xl items-center justify-between gap-3 rounded-medium border-small border-divider p-4">
            <div className="flex gap-3">
              <Icon
                icon={
                  isOpen
                    ? "solar:sidebar-minimalistic-outline"
                    : "solar:siderbar-outline"
                }
                width={24}
                height={24}
                onClick={toggleSidebar}
                className="cursor-pointer"
              />

              <h2 className="text-medium font-medium text-default-700">
                {title}
              </h2>

              {backSection && (
                <>
                  <div className="h-5 w-px self-center bg-divider" />
                  <Link
                    href={backSection.basePath}
                    className="flex items-center gap-1 text-small text-default-500 hover:text-default-700"
                  >
                    <Icon
                      icon="solar:arrow-left-linear"
                      width={16}
                      height={16}
                    />
                    Volver a {backSection.listLabel}
                  </Link>
                </>
              )}
            </div>
            <div className="flex">
              <ThemeSwitcher layout="backoffice" />
            </div>
          </header>
          <main className="mt-4 h-full w-full max-w-7xl overflow-visible">
            <div className="flex w-full flex-col gap-4 rounded-medium border-small border-divider bg-content1 p-4">
              {children}
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

export default withAuth(BackOfficeLayout, ["administrator"]);
