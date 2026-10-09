import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Give",
  description: "Partner with us and worship through giving.",
};

export default function GiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
