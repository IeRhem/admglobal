"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  activity_log,
  and,
  branch_role,
  branch_staff,
  church_branch,
  db,
  eq,
  user,
} from "@repo/database";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { BRANCH_ACCESS_PAGE_PATHS } from "@/lib/branch-pages";

type ActionResult = { success: true } | { success: false; error: string };

const branchInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Enter a branch name.").max(120),
  location: z.string().trim().max(200).optional(),
  state: z.string().trim().min(1, "Enter a state or province.").max(120),
  country: z.string().trim().min(1, "Enter a country.").max(120),
  city: z.string().trim().min(1, "Enter a city.").max(120),
  address: z.string().trim().min(1, "Enter a street address.").max(300),
  googleMapsUrl: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        const googleHost =
          url.hostname === "google.com" ||
          url.hostname.endsWith(".google.com") ||
          url.hostname === "maps.app.goo.gl" ||
          url.hostname === "goo.gl";
        return (
          url.protocol === "https:" &&
          googleHost &&
          (url.pathname.includes("maps") || url.hostname === "maps.app.goo.gl")
        );
      } catch {
        return false;
      }
    }, "Use a secure Google Maps URL."),
});

const roleInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Enter a role name.").max(80),
  pages: z.array(z.enum(BRANCH_ACCESS_PAGE_PATHS)).max(20),
});

const assignStaffSchema = z.object({
  branchId: z.uuid(),
  userId: z.string().trim().min(1),
  roleId: z.uuid(),
});

const removeStaffSchema = z.object({
  branchId: z.uuid(),
  userId: z.string().trim().min(1),
});

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

function revalidateManagementPages() {
  revalidatePath("/branches");
  revalidatePath("/activity-log");
  revalidatePath("/");
}

export async function saveBranch(input: {
  id?: string;
  name: string;
  location?: string;
  state: string;
  country: string;
  city: string;
  address: string;
  googleMapsUrl?: string;
}): Promise<ActionResult> {
  const parsed = branchInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid branch details.",
    };
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        success: false,
        error: "You must be an administrator to manage branches.",
      };
    }

    const values = {
      name: parsed.data.name,
      location: parsed.data.location || null,
      state: parsed.data.state,
      country: parsed.data.country,
      city: parsed.data.city,
      address: parsed.data.address,
      googleMapsUrl: parsed.data.googleMapsUrl || null,
      updatedAt: new Date(),
    };

    await db.transaction(async (tx) => {
      if (parsed.data.id) {
        const [updated] = await tx
          .update(church_branch)
          .set(values)
          .where(eq(church_branch.id, parsed.data.id))
          .returning({ id: church_branch.id });
        if (!updated) {
          throw new Error("That branch could not be found.");
        }
        await tx.insert(activity_log).values({
          actorUserId: session.user.id,
          actorName: session.user.name,
          action: "branch_updated",
          entityType: "branch",
          entityId: updated.id,
          description: `Updated branch "${parsed.data.name}".`,
        });
      } else {
        const [created] = await tx
          .insert(church_branch)
          .values({
            ...values,
            createdBy: session.user.id,
          })
          .returning({ id: church_branch.id });
        if (!created) {
          throw new Error("The branch could not be created.");
        }
        await tx.insert(activity_log).values({
          actorUserId: session.user.id,
          actorName: session.user.name,
          action: "branch_created",
          entityType: "branch",
          entityId: created.id,
          description: `Created branch "${parsed.data.name}".`,
        });
      }
    });

    revalidateManagementPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to save church branch:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unable to save this branch.",
    };
  }
}

export async function saveBranchRole(input: {
  id?: string;
  name: string;
  pages: string[];
}): Promise<ActionResult> {
  const parsed = roleInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid role details.",
    };
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        success: false,
        error: "You must be an administrator to manage roles.",
      };
    }

    await db.transaction(async (tx) => {
      if (parsed.data.id) {
        const [updated] = await tx
          .update(branch_role)
          .set({
            name: parsed.data.name,
            pages: parsed.data.pages,
            updatedAt: new Date(),
          })
          .where(eq(branch_role.id, parsed.data.id))
          .returning({ id: branch_role.id });
        if (!updated) {
          throw new Error("That role could not be found.");
        }
        await tx.insert(activity_log).values({
          actorUserId: session.user.id,
          actorName: session.user.name,
          action: "role_updated",
          entityType: "role",
          entityId: updated.id,
          description: `Updated the "${parsed.data.name}" role and its page access.`,
        });
      } else {
        const [created] = await tx
          .insert(branch_role)
          .values({
            name: parsed.data.name,
            pages: parsed.data.pages,
            createdBy: session.user.id,
          })
          .returning({ id: branch_role.id });
        if (!created) {
          throw new Error("The role could not be created.");
        }
        await tx.insert(activity_log).values({
          actorUserId: session.user.id,
          actorName: session.user.name,
          action: "role_created",
          entityType: "role",
          entityId: created.id,
          description: `Created the "${parsed.data.name}" role.`,
        });
      }
    });

    revalidateManagementPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to save branch role:", error);
    return {
      success: false,
      error:
        error instanceof Error &&
        error.message.includes("branch_role_name_unique")
          ? "A role with that name already exists."
          : error instanceof Error
            ? error.message
            : "Unable to save this role.",
    };
  }
}

export async function deleteBranchRole(roleId: string): Promise<ActionResult> {
  const parsedId = z.uuid().safeParse(roleId);
  if (!parsedId.success) {
    return { success: false, error: "Choose a valid role." };
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        success: false,
        error: "You must be an administrator to manage roles.",
      };
    }

    const [existingRole] = await db
      .select({ id: branch_role.id, name: branch_role.name })
      .from(branch_role)
      .where(eq(branch_role.id, parsedId.data))
      .limit(1);
    if (!existingRole) {
      return { success: false, error: "That role could not be found." };
    }

    const assignments = await db
      .select({ userId: branch_staff.userId })
      .from(branch_staff)
      .where(eq(branch_staff.roleId, parsedId.data))
      .limit(1);
    if (assignments.length > 0) {
      return {
        success: false,
        error: "Reassign staff before deleting this role.",
      };
    }

    await db.transaction(async (tx) => {
      await tx.delete(branch_role).where(eq(branch_role.id, parsedId.data));
      await tx.insert(activity_log).values({
        actorUserId: session.user.id,
        actorName: session.user.name,
        action: "role_deleted",
        entityType: "role",
        entityId: existingRole.id,
        description: `Deleted the "${existingRole.name}" role.`,
      });
    });

    revalidateManagementPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete branch role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unable to delete this role.",
    };
  }
}

export async function assignBranchStaff(input: {
  branchId: string;
  userId: string;
  roleId: string;
}): Promise<ActionResult> {
  const parsed = assignStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Choose a valid staff member and role." };
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        success: false,
        error: "You must be an administrator to assign branch staff.",
      };
    }

    const [[branch], [staffMember], [role], [existingAssignment]] =
      await Promise.all([
        db
          .select({ name: church_branch.name })
          .from(church_branch)
          .where(eq(church_branch.id, parsed.data.branchId))
          .limit(1),
        db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, parsed.data.userId))
          .limit(1),
        db
          .select({ name: branch_role.name })
          .from(branch_role)
          .where(eq(branch_role.id, parsed.data.roleId))
          .limit(1),
        db
          .select({ roleId: branch_staff.roleId })
          .from(branch_staff)
          .where(
            and(
              eq(branch_staff.branchId, parsed.data.branchId),
              eq(branch_staff.userId, parsed.data.userId),
            ),
          )
          .limit(1),
      ]);
    if (!branch || !staffMember || !role) {
      return {
        success: false,
        error: "The branch, staff member, or role could not be found.",
      };
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(branch_staff)
        .values({
          branchId: parsed.data.branchId,
          userId: parsed.data.userId,
          roleId: parsed.data.roleId,
          assignedBy: session.user.id,
        })
        .onConflictDoUpdate({
          target: [branch_staff.branchId, branch_staff.userId],
          set: { roleId: parsed.data.roleId, assignedBy: session.user.id },
        });
      await tx.insert(activity_log).values({
        actorUserId: session.user.id,
        actorName: session.user.name,
        action: existingAssignment ? "staff_role_updated" : "staff_assigned",
        entityType: "branch_staff",
        entityId: `${parsed.data.branchId}:${parsed.data.userId}`,
        description: existingAssignment
          ? `Changed ${staffMember.name}'s role to "${role.name}" at "${branch.name}".`
          : `Assigned ${staffMember.name} the "${role.name}" role at "${branch.name}".`,
      });
    });

    revalidateManagementPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to assign branch staff:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to assign this staff member.",
    };
  }
}

export async function removeBranchStaff(input: {
  branchId: string;
  userId: string;
}): Promise<ActionResult> {
  const parsed = removeStaffSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Choose a valid staff assignment." };
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        success: false,
        error: "You must be an administrator to remove branch staff.",
      };
    }

    const [assignment] = await db
      .select({
        branchName: church_branch.name,
        staffName: user.name,
      })
      .from(branch_staff)
      .innerJoin(church_branch, eq(branch_staff.branchId, church_branch.id))
      .innerJoin(user, eq(branch_staff.userId, user.id))
      .where(
        and(
          eq(branch_staff.branchId, parsed.data.branchId),
          eq(branch_staff.userId, parsed.data.userId),
        ),
      )
      .limit(1);
    if (!assignment) {
      return {
        success: false,
        error: "That staff assignment could not be found.",
      };
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(branch_staff)
        .where(
          and(
            eq(branch_staff.branchId, parsed.data.branchId),
            eq(branch_staff.userId, parsed.data.userId),
          ),
        );
      await tx.insert(activity_log).values({
        actorUserId: session.user.id,
        actorName: session.user.name,
        action: "staff_removed",
        entityType: "branch_staff",
        entityId: `${parsed.data.branchId}:${parsed.data.userId}`,
        description: `Removed ${assignment.staffName} from "${assignment.branchName}".`,
      });
    });

    revalidateManagementPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to remove branch staff:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove this staff member.",
    };
  }
}
