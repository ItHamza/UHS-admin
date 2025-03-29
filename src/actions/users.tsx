"use server";
import { getAllMembers } from "@/lib/service/teams";
import { createUser, getUsers, updateTeam } from "@/lib/service/users";

export async function UsersActions() {
  const users = await getUsers();
  return users.data;
}

export async function UserCreateAction(user: any) {
  const users = await createUser(user);
  return users.data;
}

export async function UserUpdateAction(user: any[], team_id?: string | null) {
  const users = await Promise.all(
    user.map(async (u) => {
      const updateUser = await updateTeam({ team_id: team_id, id: u.id });
      return updateUser.data;
    })
  );
  return users;
}

export async function TeamMembersAction() {
  const users = await getAllMembers();
  return users.data;
}
