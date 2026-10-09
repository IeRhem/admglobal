"use client";

import { useState } from "react";
import {
  IconBuilding,
  IconBuildingBank,
  IconCheck,
  IconCoins,
  IconCopy,
  IconHeartHandshake,
  IconWorld,
  type TablerIcon,
} from "@tabler/icons-react";
import { Card } from "@repo/ui/components/card";

const localAccounts = [
  {
    purpose: "Tithe & Offering",
    bank: "Zenith Bank",
    account: "1013128806",
    icon: IconCoins,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    purpose: "Mission / Project",
    bank: "UBA Plc",
    account: "2267845118",
    icon: IconBuilding,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    purpose: "Welfare",
    bank: "GTBank",
    account: "0812101817",
    icon: IconHeartHandshake,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

const internationalAccounts = [
  {
    currency: "USD",
    bank: "GTBank",
    account: "3001229239",
  },
  {
    currency: "USD",
    bank: "Zenith Bank",
    account: "5070233099",
  },
  {
    currency: "POUNDS",
    bank: "GTBank",
    account: "3001229246",
  },
  {
    currency: "EURO",
    bank: "GTBank",
    account: "3001229260",
  },
];

function AccountCard({ 
  label, 
  bank, 
  account, 
  icon: Icon, 
  color, 
  bg 
}: { 
  label: string; 
  bank: string; 
  account: string;
  icon?: TablerIcon;
  color?: string;
  bg?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
            {label}
          </span>
          <h3 className="font-heading text-xl font-bold">{bank}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${bg} ${color}`}>
            <Icon className="size-6" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <p className="font-mono text-2xl font-bold tracking-wider text-foreground">
          {account}
        </p>
        <button
          onClick={copyToClipboard}
          className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Copy ${label} account number`}
        >
          {copied ? <IconCheck className="size-5" /> : <IconCopy className="size-5" />}
        </button>
      </div>
      
      {/* Decorative background accent */}
      <div className="absolute -bottom-16 -right-16 size-32 rounded-full bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
    </Card>
  );
}

export default function Give() {
  return (
    <section className="w-full px-4 pb-24 pt-32 md:px-10 min-h-screen">
      <div className="mx-auto max-w-5xl">
        
        {/* Page header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-lg font-heading tracking-widest text-primary">
            Partner With Us
          </p>
          <h1 className="font-heading text-5xl font-bold leading-tight md:text-7xl mb-6">
            Worship through giving.
          </h1>
          <p className="mx-auto text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Your generous contributions help us continue our mission of spreading the Gospel, 
            supporting the community, and expanding the kingdom of God. 
            Thank you for your faithful partnership.
          </p>
        </div>

        {/* Local Accounts Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <IconBuildingBank className="size-6 text-primary" />
            <h2 className="text-2xl font-heading font-bold">Local Transfers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {localAccounts.map((acc, i) => (
              <AccountCard
                key={i}
                label={acc.purpose}
                bank={acc.bank}
                account={acc.account}
                icon={acc.icon}
                color={acc.color}
                bg={acc.bg}
              />
            ))}
          </div>
        </div>

        {/* International Accounts Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <IconWorld className="size-6 text-primary" />
            <h2 className="text-2xl font-heading font-bold">International Transfers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {internationalAccounts.map((acc, i) => (
              <AccountCard
                key={i}
                label={acc.currency}
                bank={acc.bank}
                account={acc.account}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
