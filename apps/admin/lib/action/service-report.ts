"use server";

import { revalidatePath } from "next/cache";
import { activity_log, db, service_report } from "@repo/database";
import { z } from "zod";
import { requirePageAccess } from "@/lib/branch-access";

const moneySchema = z
  .string()
  .trim()
  .regex(
    /^\d{1,10}(?:\.\d{1,2})?$/,
    "Enter a valid amount with up to 2 decimals.",
  );

const expenseSchema = z.object({
  purpose: z.string().trim().min(1).max(200),
  amount: moneySchema,
  paymentMethod: z.string().trim().max(80),
  approvedBy: z.string().trim().max(120),
  remarks: z.string().trim().max(300),
});

const reportSchema = z.object({
  serviceDate: z.iso.date(),
  location: z.string().trim().min(1).max(200),
  serviceType: z.enum([
    "Sunday Celebration Service",
    "Victory Communion Service",
    "Night of Blessings / Vigil",
    "Morning Glory Service",
    "Thanksgiving / Anointing Service",
    "Other",
  ]),
  otherServiceType: z.string().trim().max(120),
  minister: z.string().trim().min(1).max(150),
  theme: z.string().trim().min(1).max(200),
  men: z.number().int().min(0).max(1000000),
  women: z.number().int().min(0).max(1000000),
  children: z.number().int().min(0).max(1000000),
  firstTimeAttendees: z.number().int().min(0).max(1000000),
  newConverts: z.number().int().min(0).max(1000000),
  attendanceRemarks: z.string().trim().max(5000),
  testimonies: z.string().trim().max(5000),
  offering: moneySchema,
  tithes: moneySchema,
  projectOffering: moneySchema,
  sacrificialOffering: moneySchema,
  specialSeeds: moneySchema,
  otherIncome: moneySchema,
  expenses: z.array(expenseSchema).max(10),
  soulsSaved: z.number().int().min(0).max(1000000),
  followUpNotes: z.string().trim().max(5000),
  serviceSummary: z.string().trim().max(5000),
  nextPreparations: z.string().trim().max(5000),
  locationAdministrator: z.string().trim().min(1).max(150),
  locationAdministratorSignature: z.string().trim().min(1).max(150),
  locationAdministratorDate: z.iso.date(),
  accountant: z.string().trim().min(1).max(150),
  accountantSignature: z.string().trim().min(1).max(150),
  accountantDate: z.iso.date(),
  residentPastor: z.string().trim().min(1).max(150),
  residentPastorSignature: z.string().trim().min(1).max(150),
  residentPastorDate: z.iso.date(),
  declarationConfirmed: z
    .boolean()
    .refine((confirmed) => confirmed, "Confirm the final declaration."),
  submittedByName: z.string().trim().min(1).max(150),
  submissionSignature: z.string().trim().min(1).max(150),
  submissionDate: z.iso.date(),
});

type ServiceReportInput = z.infer<typeof reportSchema>;
type ActionResult = { success: true } | { success: false; error: string };

function toCents(amount: string) {
  const [whole = "0", fraction = ""] = amount.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function fromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function submitServiceReport(
  input: ServiceReportInput,
): Promise<ActionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Check the report fields and try again.",
    };
  }

  const report = parsed.data;
  if (report.serviceType === "Other" && !report.otherServiceType) {
    return { success: false, error: "Specify the service type." };
  }

  const receivedCents = [
    report.offering,
    report.tithes,
    report.projectOffering,
    report.sacrificialOffering,
    report.specialSeeds,
    report.otherIncome,
  ].reduce((sum, amount) => sum + toCents(amount), 0);
  const expensesCents = report.expenses.reduce(
    (sum, expense) => sum + toCents(expense.amount),
    0,
  );
  const maxCents = 999_999_999_999;
  if (receivedCents > maxCents || expensesCents > maxCents) {
    return {
      success: false,
      error: "The total funds or expenses exceed the supported amount.",
    };
  }

  const session = await requirePageAccess("/service-reports");

  try {
    const submittedAt = new Date();
    const [created] = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(service_report)
        .values({
          ...report,
          otherServiceType:
            report.serviceType === "Other" ? report.otherServiceType : null,
          totalAttendance:
            report.men +
            report.women +
            report.children +
            report.firstTimeAttendees +
            report.newConverts,
          totalFundsReceived: fromCents(receivedCents),
          totalExpenses: fromCents(expensesCents),
          balanceRemaining: fromCents(receivedCents - expensesCents),
          submittedBy: session.user.id,
          createdAt: submittedAt,
        })
        .returning({ id: service_report.id });

      if (!row) {
        throw new Error("The service report was not saved.");
      }

      await tx.insert(activity_log).values({
        actorUserId: session.user.id,
        actorName: session.user.name,
        action: "service_report_submitted",
        entityType: "service_report",
        entityId: row.id,
        description: `Submitted the ${report.serviceDate} service report for ${report.location}.`,
        createdAt: submittedAt,
      });

      return [row];
    });

    if (!created) {
      throw new Error("The service report was not saved.");
    }

    revalidatePath("/service-reports");
    revalidatePath("/activity-log");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit daily service report:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit the service report.",
    };
  }
}
