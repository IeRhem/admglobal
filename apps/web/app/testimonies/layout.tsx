import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonies",
  description: "Read the amazing things God is doing in the lives of our members.",
};

export default function TestimoniesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
