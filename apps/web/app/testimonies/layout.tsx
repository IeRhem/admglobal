import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonies",
  description:
    "Read inspiring testimonies of what God is doing in the lives of members at Arrow of Deliverance Ministries (ADMI) — Victory Chapel, Victory Family.",
  alternates: { canonical: "/testimonies" },
};

export default function TestimoniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
