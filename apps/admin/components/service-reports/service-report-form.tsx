"use client";

import { useState, useTransition } from "react";
import {
  IconCheck,
  IconClipboardCheck,
  IconCurrencyNaira,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { submitServiceReport } from "@/lib/action/service-report";

const serviceTypes = [
  "Sunday Celebration Service",
  "Victory Communion Service",
  "Night of Blessings / Vigil",
  "Morning Glory Service",
  "Thanksgiving / Anointing Service",
  "Other",
] as const;

const attendanceFields = [
  { name: "men", label: "Men" },
  { name: "women", label: "Women" },
  { name: "children", label: "Children" },
  { name: "firstTimeAttendees", label: "First-time attendees" },
  { name: "newConverts", label: "New converts" },
] as const;

const incomeFields = [
  { name: "offering", label: "Offering" },
  { name: "tithes", label: "Tithes" },
  { name: "projectOffering", label: "Project offering" },
  { name: "sacrificialOffering", label: "Sacrificial offering" },
  { name: "specialSeeds", label: "Special seeds" },
  { name: "otherIncome", label: "Other income" },
] as const;

type AttendanceKey = (typeof attendanceFields)[number]["name"];
type IncomeKey = (typeof incomeFields)[number]["name"];
type ExpenseField =
  "purpose" | "amount" | "paymentMethod" | "approvedBy" | "remarks";
type ExpenseRow = Record<ExpenseField, string>;

const blankExpense = (): ExpenseRow => ({
  purpose: "",
  amount: "",
  paymentMethod: "",
  approvedBy: "",
  remarks: "",
});

function localDateValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function Field({
  children,
  htmlFor,
  label,
  hint,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextInput({
  id,
  label,
  name,
  required = false,
  type = "text",
  maxLength,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  defaultValue?: string;
}) {
  return (
    <Field htmlFor={id} label={label}>
      <Input
        autoComplete="off"
        defaultValue={defaultValue}
        id={id}
        maxLength={maxLength}
        name={name}
        required={required}
        type={type}
      />
    </Field>
  );
}

function NoteInput({
  id,
  label,
  name,
  rows = 3,
}: {
  id: string;
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <Field htmlFor={id} label={label}>
      <Textarea id={id} name={name} rows={rows} />
    </Field>
  );
}

export function ServiceReportForm() {
  const [serviceType, setServiceType] = useState<(typeof serviceTypes)[number]>(
    serviceTypes[0],
  );
  const [attendance, setAttendance] = useState<Record<AttendanceKey, string>>({
    men: "0",
    women: "0",
    children: "0",
    firstTimeAttendees: "0",
    newConverts: "0",
  });
  const [income, setIncome] = useState<Record<IncomeKey, string>>({
    offering: "",
    tithes: "",
    projectOffering: "",
    sacrificialOffering: "",
    specialSeeds: "",
    otherIncome: "",
  });
  const [expenses, setExpenses] = useState<ExpenseRow[]>(
    Array.from({ length: 10 }, blankExpense),
  );
  const [expenseError, setExpenseError] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const totalAttendance = Object.values(attendance).reduce(
    (total, count) => total + (Number(count) || 0),
    0,
  );
  const totalFunds = Object.values(income).reduce(
    (total, amount) => total + (Number(amount) || 0),
    0,
  );
  const totalExpenses = expenses.reduce(
    (total, expense) => total + (Number(expense.amount) || 0),
    0,
  );
  const balance = totalFunds - totalExpenses;

  function updateExpense(index: number, field: ExpenseField, value: string) {
    setExpenses((current) =>
      current.map((expense, rowIndex) =>
        rowIndex === index ? { ...expense, [field]: value } : expense,
      ),
    );
    setExpenseError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setExpenseError("");
    setSubmitted(false);

    const formData = new FormData(event.currentTarget);
    const expenseRows = expenses.filter((row) =>
      Object.values(row).some((value) => value.trim()),
    );
    const incompleteExpense = expenseRows.some(
      (row) => !row.purpose.trim() || !row.amount.trim(),
    );
    if (incompleteExpense) {
      setExpenseError(
        "Enter both the expense purpose and amount for each used row.",
      );
      return;
    }

    const numberFromForm = (name: string) => {
      const value = String(formData.get(name) ?? "");
      return value.trim() ? Number(value) : Number.NaN;
    };

    startTransition(async () => {
      const result = await submitServiceReport({
        serviceDate: String(formData.get("serviceDate") ?? ""),
        location: String(formData.get("location") ?? ""),
        serviceType,
        otherServiceType: String(formData.get("otherServiceType") ?? ""),
        minister: String(formData.get("minister") ?? ""),
        theme: String(formData.get("theme") ?? ""),
        men: numberFromForm("men"),
        women: numberFromForm("women"),
        children: numberFromForm("children"),
        firstTimeAttendees: numberFromForm("firstTimeAttendees"),
        newConverts: numberFromForm("newConverts"),
        attendanceRemarks: String(formData.get("attendanceRemarks") ?? ""),
        testimonies: String(formData.get("testimonies") ?? ""),
        offering: income.offering || "0",
        tithes: income.tithes || "0",
        projectOffering: income.projectOffering || "0",
        sacrificialOffering: income.sacrificialOffering || "0",
        specialSeeds: income.specialSeeds || "0",
        otherIncome: income.otherIncome || "0",
        expenses: expenseRows,
        soulsSaved: numberFromForm("soulsSaved"),
        followUpNotes: String(formData.get("followUpNotes") ?? ""),
        serviceSummary: String(formData.get("serviceSummary") ?? ""),
        nextPreparations: String(formData.get("nextPreparations") ?? ""),
        locationAdministrator: String(
          formData.get("locationAdministrator") ?? "",
        ),
        locationAdministratorSignature: String(
          formData.get("locationAdministratorSignature") ?? "",
        ),
        locationAdministratorDate: String(
          formData.get("locationAdministratorDate") ?? "",
        ),
        accountant: String(formData.get("accountant") ?? ""),
        accountantSignature: String(formData.get("accountantSignature") ?? ""),
        accountantDate: String(formData.get("accountantDate") ?? ""),
        residentPastor: String(formData.get("residentPastor") ?? ""),
        residentPastorSignature: String(
          formData.get("residentPastorSignature") ?? "",
        ),
        residentPastorDate: String(formData.get("residentPastorDate") ?? ""),
        declarationConfirmed: formData.get("declarationConfirmed") === "on",
        submittedByName: String(formData.get("submittedByName") ?? ""),
        submissionSignature: String(formData.get("submissionSignature") ?? ""),
        submissionDate: String(formData.get("submissionDate") ?? ""),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSubmitted(true);
    });
  }

  return (
    <form
      className="flex flex-col gap-6 px-4 pb-8 lg:px-6"
      onSubmit={handleSubmit}
    >
      <div className="rounded-xl border bg-card px-5 py-4">
        <p className="font-semibold tracking-wide">
          ARROW OF DELIVERANCE MINISTRIES (ADM GLOBAL)
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          To be completed and submitted immediately after each service by the
          Service Coordinator or Administrative Officer.
        </p>
      </div>

      {submitted && (
        <div
          className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm"
          role="status"
        >
          <IconCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium">Daily service report submitted.</p>
            <p className="mt-1 text-muted-foreground">
              The report has been saved to ADM Global official records.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClipboardCheck className="size-5 text-primary" />
            Section 1: Service details
          </CardTitle>
          <CardDescription>
            All fields are required unless otherwise indicated.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <TextInput
            id="service-date"
            label="Date of service"
            name="serviceDate"
            required
            type="date"
            defaultValue={localDateValue()}
          />
          <TextInput
            id="service-location"
            label="Location"
            name="location"
            required
            maxLength={200}
          />
          <Field htmlFor="service-type" label="Service type">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              id="service-type"
              onChange={(event) =>
                setServiceType(
                  event.target.value as (typeof serviceTypes)[number],
                )
              }
              required
              value={serviceType}
            >
              {serviceTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          {serviceType === "Other" && (
            <TextInput
              id="other-service-type"
              label="Specify other service type"
              name="otherServiceType"
              required
              maxLength={120}
            />
          )}
          <TextInput
            id="service-minister"
            label="Minister / preacher"
            name="minister"
            required
            maxLength={150}
          />
          <TextInput
            id="service-theme"
            label="Theme / sermon topic"
            name="theme"
            required
            maxLength={200}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="size-5 text-primary" />
            Section 2: Service attendance record
          </CardTitle>
          <CardDescription>Enter numerical values only.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attendanceFields.map((field) => (
              <Field
                htmlFor={`attendance-${field.name}`}
                key={field.name}
                label={field.label}
              >
                <Input
                  id={`attendance-${field.name}`}
                  inputMode="numeric"
                  min="0"
                  name={field.name}
                  onChange={(event) =>
                    setAttendance((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  required
                  step="1"
                  type="number"
                  value={attendance[field.name]}
                />
              </Field>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 px-4 py-3">
            <span className="font-medium">Total attendance</span>
            <span className="text-xl font-bold tabular-nums">
              {totalAttendance.toLocaleString()}
            </span>
          </div>
          <NoteInput
            id="attendance-remarks"
            label="General attendance remarks"
            name="attendanceRemarks"
          />
          <NoteInput
            id="testimonies"
            label="Notable testimonies / miracles recorded"
            name="testimonies"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCurrencyNaira className="size-5 text-primary" />
            Section 3: Service financial record
          </CardTitle>
          <CardDescription>
            Enter amounts in naira. Totals and the remaining balance are
            calculated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold">A. Funds received</h3>
              <p className="text-sm text-muted-foreground">
                Enter 0 for any income category with no funds.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incomeFields.map((field) => (
                <Field
                  htmlFor={`income-${field.name}`}
                  key={field.name}
                  label={`${field.label} (₦)`}
                >
                  <Input
                    id={`income-${field.name}`}
                    inputMode="decimal"
                    min="0"
                    onChange={(event) =>
                      setIncome((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    required
                    step="0.01"
                    type="number"
                    value={income[field.name]}
                  />
                </Field>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="font-medium">Total funds received</span>
              <span className="font-bold tabular-nums">
                ₦
                {totalFunds.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold">B. Expenses record</h3>
              <p className="text-sm text-muted-foreground">
                Complete up to 10 expense items. Leave unused rows blank.
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="w-12 px-3 py-3 font-medium">S/N</th>
                    <th className="px-3 py-3 font-medium">
                      Item / purpose of expense
                    </th>
                    <th className="w-40 px-3 py-3 font-medium">Amount (₦)</th>
                    <th className="w-40 px-3 py-3 font-medium">
                      Payment method
                    </th>
                    <th className="w-40 px-3 py-3 font-medium">Approved by</th>
                    <th className="px-3 py-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map((expense, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-muted-foreground">
                        {index + 1}
                      </td>
                      {(
                        [
                          "purpose",
                          "amount",
                          "paymentMethod",
                          "approvedBy",
                          "remarks",
                        ] as const
                      ).map((field) => (
                        <td className="px-2 py-2" key={field}>
                          <Input
                            aria-label={`Expense ${index + 1} ${field}`}
                            inputMode={
                              field === "amount" ? "decimal" : undefined
                            }
                            maxLength={field === "remarks" ? 300 : undefined}
                            min={field === "amount" ? "0" : undefined}
                            onChange={(event) =>
                              updateExpense(index, field, event.target.value)
                            }
                            step={field === "amount" ? "0.01" : undefined}
                            type={field === "amount" ? "number" : "text"}
                            value={expense[field]}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {expenseError && (
              <p className="text-sm text-destructive" role="alert">
                {expenseError}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="font-medium">Total expenses</span>
                <span className="font-bold tabular-nums">
                  ₦
                  {totalExpenses.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="font-medium">Balance remaining</span>
                <span
                  className={`font-bold tabular-nums ${balance < 0 ? "text-destructive" : "text-primary"}`}
                >
                  ₦
                  {balance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance remaining = Total funds received − Total expenses.
            </p>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 4: Service summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field htmlFor="souls-saved" label="Souls saved / rededicated">
            <Input
              id="souls-saved"
              min="0"
              name="soulsSaved"
              required
              step="1"
              type="number"
              defaultValue="0"
            />
          </Field>
          <div className="hidden sm:block" />
          <NoteInput
            id="follow-up-notes"
            label="Follow-up / visitation notes"
            name="followUpNotes"
          />
          <NoteInput
            id="service-summary"
            label="Service flow / observation summary"
            name="serviceSummary"
          />
          <div className="sm:col-span-2">
            <NoteInput
              id="next-preparations"
              label="Next service preparations / announcements"
              name="nextPreparations"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 5: Approvals &amp; confirmation</CardTitle>
          <CardDescription>
            Enter each approver&apos;s name, signature, and approval date.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-3">
          <div className="grid gap-4 rounded-lg border p-4">
            <h3 className="font-medium">Location administrator</h3>
            <TextInput
              id="location-administrator"
              label="Name"
              name="locationAdministrator"
              required
              maxLength={150}
            />
            <TextInput
              id="location-administrator-signature"
              label="Signature"
              name="locationAdministratorSignature"
              required
              maxLength={150}
            />
            <TextInput
              id="location-administrator-date"
              label="Date"
              name="locationAdministratorDate"
              required
              type="date"
              defaultValue={localDateValue()}
            />
          </div>
          <div className="grid gap-4 rounded-lg border p-4">
            <h3 className="font-medium">Accountant / cashier</h3>
            <TextInput
              id="accountant"
              label="Name"
              name="accountant"
              required
              maxLength={150}
            />
            <TextInput
              id="accountant-signature"
              label="Signature"
              name="accountantSignature"
              required
              maxLength={150}
            />
            <TextInput
              id="accountant-date"
              label="Date"
              name="accountantDate"
              required
              type="date"
              defaultValue={localDateValue()}
            />
          </div>
          <div className="grid gap-4 rounded-lg border p-4">
            <h3 className="font-medium">Resident pastor / location head</h3>
            <TextInput
              id="resident-pastor"
              label="Name"
              name="residentPastor"
              required
              maxLength={150}
            />
            <TextInput
              id="resident-pastor-signature"
              label="Signature"
              name="residentPastorSignature"
              required
              maxLength={150}
            />
            <TextInput
              id="resident-pastor-date"
              label="Date"
              name="residentPastorDate"
              required
              type="date"
              defaultValue={localDateValue()}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section 6: Final declaration</CardTitle>
          <CardDescription>
            This declaration is mandatory for submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <blockquote className="rounded-lg border-l-4 border-primary bg-muted/40 p-4 text-sm leading-6">
            Every service in this house shall overflow with divine presence,
            soul harvest, and kingdom increase. The Lord shall prosper the work
            of our hands and multiply His glory in our midst.
            <cite className="mt-2 block not-italic text-muted-foreground">
              Psalm 92:13–14; Zechariah 1:17
            </cite>
          </blockquote>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              className="mt-0.5 size-4 accent-primary"
              name="declarationConfirmed"
              required
              type="checkbox"
            />
            <span>I have read and confirm the final declaration above.</span>
          </label>
          <div>
            <h3 className="font-medium">Confirmation of submission</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              I hereby confirm that the information provided in this report is
              accurate and has been reviewed and approved for ADM Global
              official records by the Resident Pastor / Location Head.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <TextInput
              id="submitted-by-name"
              label="Name"
              name="submittedByName"
              required
              maxLength={150}
            />
            <TextInput
              id="submission-signature"
              label="Signature"
              name="submissionSignature"
              required
              maxLength={150}
            />
            <TextInput
              id="submission-date"
              label="Date"
              name="submissionDate"
              required
              type="date"
              defaultValue={localDateValue()}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Official ADM Global email:{" "}
          <a
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="mailto:admglobalofficial@gmail.com"
          >
            admglobalofficial@gmail.com
          </a>
        </p>
        <Button
          className="sm:min-w-64"
          disabled={pending}
          size="lg"
          type="submit"
        >
          {pending ? "Submitting report..." : "SUBMIT DAILY SERVICE REPORT"}
        </Button>
      </div>
    </form>
  );
}
