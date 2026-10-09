import { io } from "next/cache";

export default async function FooterCopyright() {
  await io();

  return (
    <span className="mt-6 text-sm text-muted-foreground">
      © {new Date().getFullYear()} Arrow of Deliverance Ministries Int&apos;l.
      All rights reserved.
    </span>
  );
}
