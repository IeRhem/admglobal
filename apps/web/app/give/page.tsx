import { IconBuildingBank, IconWorld } from "@tabler/icons-react";
import { AccountCard } from "@/components/give/AccountCard";

export const metadata = {
  title: "Give",
  description: "Partner with us and worship through giving.",
};

const localAccounts = [
  {
    purpose: "Tithe & Offering",
    bank: "Zenith Bank",
    account: "1013128806",
    icon: "coins",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    purpose: "Mission / Project",
    bank: "UBA Plc",
    account: "2267845118",
    icon: "building",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    purpose: "Welfare",
    bank: "GTBank",
    account: "0812101817",
    icon: "heart-handshake",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
] as const;

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
