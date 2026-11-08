import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  User,
} from "@heroui/react";
import {
  adminItemsMenu,
  generalItemsMenu,
  toursItemsMenu,
} from "@/data/menuItems";
import { Icon } from "@iconify/react/dist/iconify.js";

import Logo from "../icons/logo";

const Sidebar = ({ isOpen, toggle }: any) => {
  const { data: session, status } = useSession();
  const currentPath = usePathname();
  const router = useRouter();

  const showAnimation = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.1,
      },
    },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.4,
      },
    },
  };

  const mapRoleToName = (role: string): string => {
    switch (role) {
      case "administrator":
        return "Administrador";
      case "tour_guide":
        return "Agente";
      default:
        return "Rol desconocido";
    }
  };

  // Muestra solo los roles relevantes para el panel (admin / agente).
  // Evita mostrar "turista" u otros como "Rol desconocido".
  const rolesLabel = (roles: string[]): string => {
    const labels = roles
      .filter((role) => role === "administrator" || role === "tour_guide")
      .map((role) => mapRoleToName(role));
    return labels.length ? labels.join(", ") : "Sin rol";
  };

  return (
    <motion.div
      key="toggleSidebar"
      initial={{ width: "260px" }}
      animate={{ width: isOpen ? "260px" : "0px" }}
      transition={{
        duration: 0.4,
        type: "spring",
        damping: 15,
      }}
      className="border-r-small border-divider h-screen fixed top-0 left-0 z-50 overflow-x-hidden overflow-y-auto"
    >
      <div className="px-4 py-8">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="sidebar"
              variants={showAnimation}
              initial="show"
              animate="show"
              exit="hidden"
              className="flex flex-col gap-2 px-2"
            >
              <div className="flex">
                <Logo width={120} height={43} />
              </div>
              <div className="my-8">
                <Dropdown placement="bottom-start">
                  <DropdownTrigger>
                    <User
                      as="button"
                      avatarProps={{
                        src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                        size: "sm",
                      }}
                      className="transition-transform"
                      description={rolesLabel(session?.user?.roles ?? [])}
                      name={session?.user?.name}
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="User Actions"
                    disabledKeys={["profile"]}
                    variant="flat"
                  >
                    <DropdownSection aria-label="Profile & Actions" showDivider>
                      <DropdownItem
                        isReadOnly
                        key="profile"
                        className="h-14 gap-2"
                      >
                        <p>Tienes rol de</p>
                        <p className="font-bold">
                          {rolesLabel(session?.user?.roles ?? [])}
                        </p>
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownItem
                      key="logout"
                      onPress={async () => {
                        await signOut({ redirect: false });
                        window.location.href = "/login";
                      }}
                      color="danger"
                    >
                      Cerrar sesión
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-tiny text-default-500">General</span>
                {generalItemsMenu.map((item, index) => (
                  <Button
                    key={index}
                    fullWidth={true}
                    onPress={() => router.push(item.href)}
                    variant="light"
                    startContent={
                      <Icon icon={item.icon} width={24} height={24} />
                    }
                    className={`justify-start ${
                      currentPath === item.href
                        ? "text-primary"
                        : "text-default-500"
                    }`}
                  >
                    {item.title}
                  </Button>
                ))}
                <span className="text-tiny text-default-500 mt-2">Tours</span>
                {toursItemsMenu.map((item, index) => (
                  <Button
                    key={index}
                    fullWidth={true}
                    onPress={() => router.push(item.href)}
                    variant="light"
                    startContent={
                      <Icon icon={item.icon} width={24} height={24} />
                    }
                    className={`justify-start ${
                      currentPath === item.href
                        ? "text-primary"
                        : "text-default-500"
                    }`}
                  >
                    {item.title}
                  </Button>
                ))}
                <span className="text-tiny text-default-500 mt-2">
                  Administración
                </span>
                {adminItemsMenu.map((item, index) => (
                  <Button
                    key={index}
                    fullWidth={true}
                    onPress={() => router.push(item.href)}
                    variant="light"
                    startContent={
                      <Icon icon={item.icon} width={24} height={24} />
                    }
                    className={`justify-start ${
                      currentPath === item.href
                        ? "text-primary"
                        : "text-default-500"
                    }`}
                  >
                    {item.title}
                  </Button>
                ))}
              </div>
              <div className="flex pt-16">
                <span className="text-tiny text-foreground-400">
                  APP v{process.env.NEXT_PUBLIC_APP_VERSION}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;
