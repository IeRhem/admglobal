"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { IconAlertCircle, IconLoader, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { createTestimonyAction } from "@/lib/action/testimony";

interface NewTestimonyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewTestimonyDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewTestimonyDialogProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isVerified, setIsVerified] = React.useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || message.trim().length < 10) {
      toast.error(
        "Please provide a testimony message with at least 10 characters.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await createTestimonyAction({
        firstName,
        lastName,
        email,
        message,
        isVerified,
      });

      if (res.success) {
        toast.success("Testimony added successfully!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setMessage("");
        setIsVerified(true);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to create testimony");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <DrawerHeader className="gap-1 border-b pb-4">
            <DrawerTitle className="flex items-center gap-2 text-xl font-semibold">
              <IconPlus className="size-5" />
              Add Testimony
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              Record a testimony from a church service or direct submission.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="text-xs font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message" className="text-xs font-medium">
                Testimony Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Share what God did..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="min-h-32 text-sm leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <Checkbox
                id="isVerified"
                checked={isVerified}
                onCheckedChange={(checked) => setIsVerified(!!checked)}
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="isVerified"
                  className="cursor-pointer text-xs font-medium text-foreground"
                >
                  Publish Immediately
                </Label>
                <span className="text-xs text-muted-foreground">
                  Testimony will be approved and visible on public site
                </span>
              </div>
            </div>

            {!isVerified && (
              <Alert variant="warning">
                <IconAlertCircle className="size-4" />
                <AlertDescription className="text-xs">
                  This testimony will be saved as pending review and will not be
                  displayed on the public site until an admin approves it.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DrawerFooter className="flex-row items-center justify-end gap-2 border-t p-4">
            <DrawerClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </DrawerClose>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <IconLoader className="mr-1.5 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Testimony"
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
