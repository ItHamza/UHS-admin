"use server";
import { createUser, getUsers } from "@/lib/service/users";

export async function UsersActions() {
  const users = await getUsers();
  return users.data;
}

export async function UserCreateAction(user: any) {
  const users = await createUser(user);
  return users.data;
}
