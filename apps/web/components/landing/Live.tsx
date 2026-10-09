import { embedLink, liveServiceImage_mobile } from "@/lib/info";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@repo/ui/components/button";
import { IconMapPin } from "@tabler/icons-react";

export default function LiveService() {
  return (
    <section className="rounded-b-4xl w-full h-screen overflow-hidden flex flex-col items-center justify-center relative">
      {/* <iframe
        className="w-full md:h-screen h-full"
        src={embedLink}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe> */}

      <div className="relative h-full w-full">
        <Image
          src={liveServiceImage_mobile}
          alt="Live Service"
          fill
          sizes="100vw"
        />
      </div>
      <div className="bg-foreground justify-center p-6 rounded-4xl absolute bottom-0 md:bottom-8">
        <h1 className="text-2xl font-bold font-heading text-background">
          We Are Live
        </h1>
        <p className="text-muted-foreground">
          Join us live as we worship and praise the Lord. Click the link below to
          watch the live service on YouTube.
        </p>
        <div className="flex gap-4 mt-6 items-center">
          <Link
            href={embedLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "destructive",
              size: "lg",
            })}
          >
            Watch Live
          </Link>
          <span className="text-background">Or</span>
          <Link
            href={embedLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
            })}
          >
            <IconMapPin className="size-5" />
            Join us Live
          </Link>
        </div>
      </div>
    </section>
  );
}
