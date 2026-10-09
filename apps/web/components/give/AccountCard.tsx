"use client";

import { useState } from "react";
import {
  IconBuilding,
  IconCheck,
  IconCoins,
  IconCopy,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { Card } from "@repo/ui/components/card";

const accountIcons = {
  building: IconBuilding,
  coins: IconCoins,
  "heart-handshake": IconHeartHandshake,
};

export function AccountCard({
  label,
  bank,
  account,
  icon,
  color,
  bg,
}: {
  label: string;
  bank: string;
  account: string;
  icon?: keyof typeof accountIcons;
  color?: string;
  bg?: string;
}) {
  const Icon = icon ? accountIcons[icon] : undefined;
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyToClipboard = async () => {
    setCopied(false);
    setCopyFailed(false);

    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <Card className="group relative overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <span className="mb-2 block text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <h3 className="font-heading text-xl font-bold">{bank}</h3>
        </div>
        {Icon && (
          <div className={`rounded-full p-3 ${bg} ${color}`}>
            <Icon className="size-6" />
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <p className="font-mono text-2xl font-bold tracking-wider text-foreground">
          {account}
        </p>
        <button
          onClick={copyToClipboard}
          className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Copy ${label} account number`}
        >
          {copied ? (
            <IconCheck className="size-5" />
          ) : (
            <IconCopy className="size-5" />
          )}
        </button>
      </div>
      {copyFailed && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Copy failed. Please copy the account number manually.
        </p>
      )}

      <div className="pointer-events-none absolute -bottom-16 -right-16 size-32 rounded-full bg-primary/5 blur-3xl transition-colors duration-500 group-hover:bg-primary/10" />
    </Card>
  );
}
