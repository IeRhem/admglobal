import { Suspense } from "react";
import type { Metadata } from "next";
import {
  branch_role,
  branch_staff,
  church_branch,
  db,
  desc,
  eq,
  inArray,
  user,
} from "@repo/database";
import { BranchesPage } from "@/components/branches/branches-page";
import { requirePageAccess } from "@/lib/branch-access";

export const metadata: Metadata = {
  title: "Branches | ADM Global Admin",
  description: "Manage church locations, staff, and branch roles.",
};

async function BranchesContent() {
  const session = await requirePageAccess("/branches");

  const [branchRows, roles, users] = await Promise.all([
    db.select().from(church_branch).orderBy(desc(church_branch.createdAt)),
    db.select().from(branch_role).orderBy(branch_role.name),
    db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .orderBy(user.name),
  ]);
  const branchIds = branchRows.map((branch) => branch.id);
  const staffRows =
    branchIds.length > 0
      ? await db
          .select({
            branchId: branch_staff.branchId,
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: branch_role.id,
            roleName: branch_role.name,
          })
          .from(branch_staff)
          .innerJoin(user, eq(branch_staff.userId, user.id))
          .innerJoin(branch_role, eq(branch_staff.roleId, branch_role.id))
          .where(inArray(branch_staff.branchId, branchIds))
      : [];

  const staffByBranch = new Map<string, typeof staffRows>();
  for (const staffMember of staffRows) {
    const branchStaff = staffByBranch.get(staffMember.branchId) ?? [];
    branchStaff.push(staffMember);
    staffByBranch.set(staffMember.branchId, branchStaff);
  }

  const branches = branchRows.map((branch) => ({
    ...branch,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString(),
    staff: (staffByBranch.get(branch.id) ?? []).map((staffMember) => ({
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      roleId: staffMember.roleId,
      roleName: staffMember.roleName,
    })),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Branches
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage church locations, assign staff, and define reusable roles.
        </p>
      </div>
      <BranchesPage
        branches={branches}
        canManage={session.user.role === "admin"}
        roles={roles.map((role) => ({
          id: role.id,
          name: role.name,
          pages: role.pages,
        }))}
        users={users}
      />
    </div>
  );
}

function BranchesSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6" aria-busy="true">
      <div className="h-56 animate-pulse rounded-xl border bg-muted/30" />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border bg-muted/30" />
        <div className="h-80 animate-pulse rounded-xl border bg-muted/30" />
      </div>
    </div>
  );
}

export default function BranchesRoute() {
  return (
    <Suspense fallback={<BranchesSkeleton />}>
      <BranchesContent />
    </Suspense>
  );
}
