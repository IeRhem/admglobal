"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { addUser, updateUserRole } from "@/lib/action/users";
import { USER_ROLES, type ManagedUser, type UserRole } from "@/lib/users";

const roleNames: Record<UserRole, string> = {
  admin: "Admin",
  user: "User",
};

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.some((option) => option === value);
}

function RoleEditor({ user }: { user: ManagedUser }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(
    isUserRole(user.role) ? user.role : "user",
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const unchanged = role === user.role;

  function saveRole() {
    setError("");
    startTransition(async () => {
      const result = await updateUserRole({ userId: user.id, role });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
      <select
        aria-label={`Role for ${user.name}`}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        disabled={pending}
        onChange={(event) => {
          if (isUserRole(event.target.value)) {
            setRole(event.target.value);
          }
        }}
        value={role}
      >
        {USER_ROLES.map((option) => (
          <option key={option} value={option}>
            {roleNames[option]}
          </option>
        ))}
      </select>
      {!unchanged && (
        <Button
          disabled={pending}
          onClick={saveRole}
          size="sm"
          variant="outline"
        >
          {pending ? "Saving..." : "Save"}
        </Button>
      )}
      {error && (
        <p className="text-xs text-destructive sm:basis-full" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function UsersPage({
  canManage,
  initialUsers,
}: {
  canManage: boolean;
  initialUsers: ManagedUser[];
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAddUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await addUser({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        role,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      form.reset();
      setRole("user");
      setIsDialogOpen(false);
      router.refresh();
    });
  }

  const adminCount = initialUsers.filter(
    (managedUser) => managedUser.role === "admin",
  ).length;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total users</CardTitle>
            <IconUsers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
      </div>

      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-semibold">All users</h2>
            <p className="text-sm text-muted-foreground">
              Manage who can access the admin dashboard.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <IconPlus className="size-4" />
              Add user
            </Button>
          )}
        </div>

        {initialUsers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No users yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">Name</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Email</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Role</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialUsers.map((managedUser) => (
                  <tr key={managedUser.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium sm:px-6">
                      {managedUser.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground sm:px-6">
                      {managedUser.email}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      {canManage ? (
                        <RoleEditor user={managedUser} />
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                          {managedUser.role}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground sm:px-6">
                      <time dateTime={managedUser.createdAt}>
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeZone: "UTC",
                        }).format(new Date(managedUser.createdAt))}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canManage && (
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a user</DialogTitle>
              <DialogDescription>
                Create an account and choose its dashboard role.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleAddUser}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="user-name">Name</Label>
                <Input
                  autoComplete="name"
                  id="user-name"
                  maxLength={100}
                  name="name"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  autoComplete="email"
                  id="user-email"
                  maxLength={254}
                  name="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-user-role">Role</Label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  id="new-user-role"
                  onChange={(event) => {
                    if (isUserRole(event.target.value)) {
                      setRole(event.target.value);
                    }
                  }}
                  value={role}
                >
                  {USER_ROLES.map((option) => (
                    <option key={option} value={option}>
                      {roleNames[option]}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Accounts are created without a password. Users sign in with
                Google using this email; Google sign-in must be configured.
              </p>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button
                  disabled={pending}
                  onClick={() => setIsDialogOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button disabled={pending} type="submit">
                  {pending ? "Adding..." : "Add user"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
