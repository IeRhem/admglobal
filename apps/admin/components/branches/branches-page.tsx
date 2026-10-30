"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuildingChurch,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconShield,
  IconTrash,
  IconUserPlus,
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
import { BRANCH_ACCESS_PAGES } from "@/lib/branch-pages";
import {
  assignBranchStaff,
  deleteBranchRole,
  removeBranchStaff,
  saveBranch,
  saveBranchRole,
} from "@/lib/action/branches";

type BranchRole = {
  id: string;
  name: string;
  pages: string[];
};

type BranchStaffMember = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
};

type Branch = {
  id: string;
  name: string;
  location: string | null;
  state: string;
  country: string;
  city: string;
  address: string;
  googleMapsUrl: string | null;
  staff: BranchStaffMember[];
};

type UserOption = { id: string; name: string; email: string };

function mapEmbedUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !(
        url.hostname === "google.com" || url.hostname.endsWith(".google.com")
      ) ||
      !url.pathname.includes("maps")
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function BranchDialog({
  branch,
  onOpenChange,
  open,
}: {
  branch: Branch | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveBranch({
        id: branch?.id,
        name: String(formData.get("name") ?? ""),
        location: String(formData.get("location") ?? ""),
        state: String(formData.get("state") ?? ""),
        country: String(formData.get("country") ?? ""),
        city: String(formData.get("city") ?? ""),
        address: String(formData.get("address") ?? ""),
        googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {branch ? "Edit branch" : "Create a branch"}
          </DialogTitle>
          <DialogDescription>
            Add the church location and an optional Google Maps link.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="branch-name">Branch name</Label>
            <Input
              autoComplete="organization"
              defaultValue={branch?.name}
              id="branch-name"
              maxLength={120}
              name="name"
              placeholder="ADM Global — Central"
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="branch-location">
              Location / campus (optional)
            </Label>
            <Input
              defaultValue={branch?.location ?? ""}
              id="branch-location"
              maxLength={200}
              name="location"
              placeholder="Main campus"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch-country">Country</Label>
            <Input
              autoComplete="country-name"
              defaultValue={branch?.country}
              id="branch-country"
              name="country"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch-state">State / province</Label>
            <Input
              autoComplete="address-level1"
              defaultValue={branch?.state}
              id="branch-state"
              name="state"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch-city">City</Label>
            <Input
              autoComplete="address-level2"
              defaultValue={branch?.city}
              id="branch-city"
              name="city"
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="branch-address">Street address</Label>
            <Input
              autoComplete="street-address"
              defaultValue={branch?.address}
              id="branch-address"
              name="address"
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="branch-map-url">Google Maps URL</Label>
            <Input
              defaultValue={branch?.googleMapsUrl ?? ""}
              id="branch-map-url"
              name="googleMapsUrl"
              placeholder="https://www.google.com/maps/embed?pb=..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              For an embedded map, paste a Google Maps embed URL.
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending
                ? "Saving..."
                : branch
                  ? "Save changes"
                  : "Create branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({
  role,
  onOpenChange,
  open,
}: {
  role: BranchRole | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const router = useRouter();
  const [pages, setPages] = useState<string[]>(role?.pages ?? []);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function togglePage(page: string) {
    setPages((current) =>
      current.includes(page)
        ? current.filter((entry) => entry !== page)
        : [...current, page],
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    startTransition(async () => {
      const result = await saveBranchRole({ id: role?.id, name, pages });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setPages(role?.pages ?? []);
          setError("");
        }
        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {role ? "Edit global role" : "Create global role"}
          </DialogTitle>
          <DialogDescription>
            Roles can be assigned at any branch. Choose which admin pages this
            role can open.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              defaultValue={role?.name}
              id="role-name"
              maxLength={80}
              name="name"
              placeholder="Branch coordinator"
              required
            />
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">Page access</legend>
            {BRANCH_ACCESS_PAGES.map((page) => (
              <label
                className="flex cursor-pointer items-center gap-3 text-sm"
                key={page.path}
              >
                <input
                  checked={pages.includes(page.path)}
                  className="size-4 accent-primary"
                  onChange={() => togglePage(page.path)}
                  type="checkbox"
                />
                <span>{page.label}</span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Saving..." : role ? "Save role" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StaffAssignment({
  branch,
  roles,
  users,
}: {
  branch: Branch;
  roles: BranchRole[];
  users: UserOption[];
}) {
  const router = useRouter();
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const assignedIds = new Set(branch.staff.map((member) => member.id));
  const availableUsers = users.filter((option) => !assignedIds.has(option.id));

  function saveAssignment(userId: string, selectedRoleId: string) {
    setError("");
    startTransition(async () => {
      const result = await assignBranchStaff({
        branchId: branch.id,
        userId,
        roleId: selectedRoleId,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = String(
      new FormData(event.currentTarget).get("userId") ?? "",
    );
    saveAssignment(userId, roleId);
  }

  function remove(userId: string) {
    setError("");
    startTransition(async () => {
      const result = await removeBranchStaff({ branchId: branch.id, userId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="border-t px-5 py-5">
      <div className="mb-3 flex items-center gap-2">
        <IconUsers className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Branch staff</h3>
        <span className="text-xs text-muted-foreground">
          {branch.staff.length}
        </span>
      </div>
      {branch.staff.length > 0 ? (
        <div className="divide-y rounded-lg border">
          {branch.staff.map((member) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
              key={member.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label={`Role for ${member.name}`}
                  className="h-8 max-w-36 rounded-md border border-input bg-background px-2 text-xs"
                  disabled={pending}
                  onChange={(event) =>
                    saveAssignment(member.id, event.target.value)
                  }
                  value={member.roleId}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <Button
                  aria-label={`Remove ${member.name} from ${branch.name}`}
                  disabled={pending}
                  onClick={() => remove(member.id)}
                  size="icon"
                  variant="ghost"
                >
                  <IconTrash className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
          No staff assigned to this branch yet.
        </p>
      )}
      {roles.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Create a global role before assigning staff.
        </p>
      ) : availableUsers.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          All users have already been assigned to this branch.
        </p>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={submit}
        >
          <select
            aria-label={`Choose a staff member for ${branch.name}`}
            className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            name="userId"
            required
          >
            <option value="">Select a user</option>
            {availableUsers.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} · {option.email}
              </option>
            ))}
          </select>
          <select
            aria-label="Choose a branch role"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => setRoleId(event.target.value)}
            value={roleId}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <Button disabled={pending || !roleId} size="sm" type="submit">
            <IconUserPlus className="size-4" />
            Assign
          </Button>
        </form>
      )}
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function BranchesPage({
  branches,
  canManage,
  roles,
  users,
}: {
  branches: Branch[];
  canManage: boolean;
  roles: BranchRole[];
  users: UserOption[];
}) {
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedRole, setSelectedRole] = useState<BranchRole | null>(null);
  const [roleError, setRoleError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function removeRole(role: BranchRole) {
    if (!window.confirm(`Delete the "${role.name}" role?`)) return;
    setRoleError("");
    startTransition(async () => {
      const result = await deleteBranchRole(role.id);
      if (!result.success) {
        setRoleError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-8 lg:px-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="size-5 text-primary" />
              Global staff roles
            </CardTitle>
            <CardDescription className="mt-1">
              Define reusable roles and choose which admin pages each role can
              access.
            </CardDescription>
          </div>
          {canManage && (
            <Button
              onClick={() => {
                setSelectedRole(null);
                setRoleDialogOpen(true);
              }}
            >
              <IconPlus className="size-4" />
              New role
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {roles.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No roles yet. Create a role to assign staff and configure page
              access.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <div className="rounded-lg border p-4" key={role.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{role.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.pages.length}{" "}
                        {role.pages.length === 1 ? "page" : "pages"} accessible
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          aria-label={`Edit ${role.name}`}
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleDialogOpen(true);
                          }}
                          size="icon"
                          variant="ghost"
                        >
                          <IconPencil className="size-4" />
                        </Button>
                        <Button
                          aria-label={`Delete ${role.name}`}
                          disabled={pending}
                          onClick={() => removeRole(role)}
                          size="icon"
                          variant="ghost"
                        >
                          <IconTrash className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.pages.map((pagePath) => {
                      const page = BRANCH_ACCESS_PAGES.find(
                        (candidate) => candidate.path === pagePath,
                      );
                      return page ? (
                        <span
                          className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                          key={pagePath}
                        >
                          {page.label}
                        </span>
                      ) : null;
                    })}
                    {role.pages.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No pages selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {canManage && roleError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {roleError}
            </p>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Church branches</h2>
            <p className="text-sm text-muted-foreground">
              Manage locations and the people serving at each branch.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => {
                setSelectedBranch(null);
                setBranchDialogOpen(true);
              }}
            >
              <IconPlus className="size-4" />
              Create branch
            </Button>
          )}
        </div>

        {branches.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <IconBuildingChurch className="mx-auto size-9 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No branches yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first church branch to get started.
            </p>
            {canManage && (
              <Button
                className="mt-5"
                onClick={() => {
                  setSelectedBranch(null);
                  setBranchDialogOpen(true);
                }}
              >
                <IconPlus className="size-4" />
                Create branch
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {branches.map((branch) => {
              const embedUrl = mapEmbedUrl(branch.googleMapsUrl);
              return (
                <Card className="overflow-hidden" key={branch.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2">
                        <IconBuildingChurch className="size-5 shrink-0 text-primary" />
                        <span className="truncate">{branch.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-start gap-1.5">
                        <IconMapPin className="mt-0.5 size-4 shrink-0" />
                        <span>
                          {[
                            branch.location,
                            branch.address,
                            branch.city,
                            branch.state,
                            branch.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </CardDescription>
                    </div>
                    {canManage && (
                      <Button
                        onClick={() => {
                          setSelectedBranch(branch);
                          setBranchDialogOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <IconPencil className="size-4" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  {embedUrl && (
                    <div className="mx-5 overflow-hidden rounded-lg border">
                      <iframe
                        className="h-48 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={embedUrl}
                        title={`Map of ${branch.name}`}
                      />
                    </div>
                  )}
                  {branch.googleMapsUrl && !embedUrl && (
                    <div className="mx-5 rounded-lg border bg-muted/30 p-3 text-sm">
                      Map preview unavailable.{" "}
                      <a
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        href={branch.googleMapsUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  )}
                  {!branch.googleMapsUrl && (
                    <div className="mx-5 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      No Google Maps URL added.
                    </div>
                  )}
                  {canManage && (
                    <StaffAssignment
                      branch={branch}
                      roles={roles}
                      users={users}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {canManage && (
        <>
          <BranchDialog
            key={selectedBranch?.id ?? "new-branch"}
            branch={selectedBranch}
            onOpenChange={setBranchDialogOpen}
            open={branchDialogOpen}
          />
          <RoleDialog
            key={selectedRole?.id ?? "new-role"}
            role={selectedRole}
            onOpenChange={setRoleDialogOpen}
            open={roleDialogOpen}
          />
        </>
      )}
    </div>
  );
}
