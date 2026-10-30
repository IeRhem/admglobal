import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { branch_role, branch_staff, db, eq } from "@repo/database";
import { auth } from "@/lib/auth";
import { BRANCH_ACCESS_PAGES } from "@/lib/branch-pages";

export async function getUserPageAccess(userId: string): Promise<string[]> {
  const assignments = await db
    .select({ pages: branch_role.pages })
    .from(branch_staff)
    .innerJoin(branch_role, eq(branch_staff.roleId, branch_role.id))
    .where(eq(branch_staff.userId, userId));

  return [...new Set(assignments.flatMap((assignment) => assignment.pages))];
}

export async function requirePageAccess(pagePath: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role === "admin") {
    return session;
  }

  const allowedPages = await getUserPageAccess(session.user.id);
  if (!allowedPages.includes(pagePath)) {
    const firstAllowedPage = BRANCH_ACCESS_PAGES.find((page) =>
      allowedPages.includes(page.path),
    );
    redirect(firstAllowedPage?.path ?? "/auth/waiting-area");
  }

  return session;
}
