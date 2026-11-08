import {
  Dispatch,
  Key,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import {
  Button,
  Chip,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";

import { columns, statusOptions } from "@/data/dummy";
import { User as UserProps } from "@/services/users/getUsers";
import { deleteUser } from "@/services/users/deleteUser";
import DataTable from "@/app/components/DataTable";

const INITIAL_VISIBLE_COLUMNS = ["name", "email", "roles", "active", "actions"];

const UsersTable = ({
  data: users,
  isLoading,
  token,
  changeData,
}: {
  data: UserProps[] | [];
  isLoading: boolean;
  token: string;
  changeData: Dispatch<SetStateAction<number>>;
}) => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [errorMsgDelete, setErrorMsgDelete] = useState<string | null>("");
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const onDelete = async () => {
    if (selectedUser && token) {
      await deleteUser(token, selectedUser.uuid)
        .then(() => {
          changeData((prev) => prev + 1);
          setSelectedUser(null);
        })
        .catch((error) => {
          setErrorMsgDelete(error.message);
        });
    }
  };

  const renderCell = useCallback(
    (user: UserProps, columnKey: Key) => {
      const cellValue = user[columnKey as keyof UserProps];

      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{user.name}</p>
              <p className="text-tiny text-default-400">{user.last_name}</p>
            </div>
          );
        case "email":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">{user.email}</p>
              <p className="text-tiny text-default-400">{user.phone_number}</p>
            </div>
          );
        case "roles":
          return (
            <div className="flex gap-2">
              {user.roles &&
                user.roles.map((role, i) => (
                  <Chip key={i} className="capitalize" size="sm" variant="flat">
                    {role === "administrator"
                      ? "Admin"
                      : role === "tour_guide"
                      ? "Agente"
                      : "Turista"}
                  </Chip>
                ))}
            </div>
          );
        case "active":
          return (
            <Chip
              className="capitalize"
              color={cellValue ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {cellValue ? "Activo" : "Inactivo"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex">
              <Button
                size="sm"
                isIconOnly
                radius="full"
                variant="light"
                onClick={() =>
                  router.push(`/backoffice/users/edit-user/${user.uuid}`)
                }
              >
                <Icon icon="solar:pen-line-duotone" width="18" />
              </Button>
              <Button
                size="sm"
                isIconOnly
                radius="full"
                variant="light"
                onClick={() => {
                  setSelectedUser(user);
                  onOpen();
                }}
              >
                <Icon
                  icon="solar:user-block-rounded-line-duotone"
                  width="20"
                  className={"text-danger"}
                />
              </Button>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onOpen, router]
  );

  const filterByText = useCallback(
    (user: UserProps, search: string) =>
      user.name.toLowerCase().includes(search.toLowerCase()),
    []
  );

  return (
    <>
      <DataTable<UserProps>
        data={users}
        isLoading={isLoading}
        columns={columns}
        statusOptions={statusOptions}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        initialSortColumn="name"
        getRowKey={(user) => user.uuid}
        renderCell={renderCell}
        filterByText={filterByText}
        ariaLabel="Users list table"
        emptyLabel="No hay usuarios en el sistema"
        totalLabel={(count) => `${count} Usuarios en total`}
        topRightAction={
          <Link href="/backoffice/users/create-user">
            <Button
              color="secondary"
              endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
            >
              Nuevo Usuario
            </Button>
          </Link>
        }
      />
      {selectedUser && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h5 className="text-lg">¿Estás completamente seguro?</h5>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm">
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente la cuenta del usuario{" "}
                    {<span className="text-primary">{selectedUser?.name}</span>}{" "}
                    {
                      <span className="text-primary">
                        {selectedUser?.last_name}
                      </span>
                    }{" "}
                    y sus datos de nuestros servidores.
                  </p>
                </ModalBody>
                <ModalFooter>
                  {errorMsgDelete && (
                    <p className="text-danger text-tiny">{errorMsgDelete}</p>
                  )}
                  <Button color="danger" variant="light" onPress={onDelete}>
                    Eliminar usuario
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      setSelectedUser(null);
                      onClose;
                    }}
                  >
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default UsersTable;
