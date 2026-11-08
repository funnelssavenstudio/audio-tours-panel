"use client";

import { getUsers } from "@/services/users/getUsers";
import UsersTable from "./components/UsersTable";
import { useListPage } from "@/helpers/useListPage";

export default function Users() {
  const props = useListPage(getUsers);
  return <UsersTable {...props} />;
}
