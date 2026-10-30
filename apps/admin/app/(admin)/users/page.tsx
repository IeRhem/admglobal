import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { db, desc, user } from "@repo/database";
import { auth } from "@/lib/auth";
import { UsersPage } from "@/components/users/users-page";

export const metadata: Metadata = {
  title: "Users | ADM Global Admin",
  description: "Manage dashboard users and their roles.",
};

async function getUsers() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return users.map((managedUser) => ({
    ...managedUser,
    createdAt: managedUser.createdAt.toISOString(),
  }));
}

async function UsersContent() {
  const users = await getUsers();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Users
            </h1>
            <p className="text-sm text-muted-foreground">
              Admins have full dashboard access; users are directed to the
              waiting area.
            </p>
          </div>
          <UsersPage initialUsers={users} />
        </div>
      </div>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        <div className="h-24 animate-pulse rounded-xl border bg-muted/40" />
      </div>
      <div className="h-80 animate-pulse rounded-xl border bg-muted/30" />
    </div>
  );
}

export default function UsersRoute() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}
