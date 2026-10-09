"use client";

import { buttonVariants } from "@repo/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { heroGridItems } from "@/lib/info";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import {
  IconArrowUpRight,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import GridMotion from "@/components/ui/GridMotion";
import DepthCarousel from "@/components/ui/DepthCarousel";
import { cn } from "@repo/ui/lib/utils";
import { TestimonySlideshow } from "@/components/landing/TestimonyCard";
import { FeaturedSermon } from "@/components/sermons/FeaturedSermon";
import { youTubeVideos } from "@/data/youtubevideos";
import { RegularEvents } from "@/components/landing/RegularEvents";
import { UpcomingEvents } from "@/components/landing/UpcomingEvent";

const visionCarouselItems = Array.from({ length: 12 }, (_, i) => ({
  image: `/grid-image/image-${i + 1}.jpg`,
  alt: `Church gallery image ${i + 1}`,
}));

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 pb-8">
      <section
        id="hero"
        className="w-full h-screen relative flex items-center justify-center overflow-hidden rounded-b-4xl"
      >
        {/* GridMotion Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <GridMotion items={heroGridItems} gradientColor="var(--background)" />
        </div>
        <div className="px-4 md:px-6 flex flex-col items-center justify-center mx-auto text-center relative z-10">
          {/* radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 md:w-125 h-75 md:h-125 bg-primary/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <span
            id="welcome-text"
            className="text-foreground/60 font-semibold font-heading drop-shadow-sm text-xl md:text-3xl"
          >
            Welcome to
          </span>
          <h1
            id="church-name"
            className="text-foreground text-5xl sm:text-5xl leading-none md:text-8xl lg:text-9xl font-bold font-heading tracking-tight drop-shadow-lg"
          >
            Arrow of Deliverance Ministries
          </h1>
          <Link
            href="/contact"
            className={cn(
              "group hidden h-fit! items-center justify-center gap-2 pr-1! py-1! transition-transform duration-300 hover:-translate-y-0.5 md:flex",
              buttonVariants({ size: "lg", variant: "secondary" }),
              "bg-foreground! text-background! hover:bg-foreground/80! hover:text-background! mt-8",
            )}
          >
            Plan a Visit
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
              <IconArrowUpRight className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
            </span>
          </Link>
          <div id="regular-events" className="mt-20 w-full">
            <RegularEvents />
          </div>
        </div>
      </section>

      <section
        id="latest-sermon"
        className="w-full px-4 py-16 md:px-10 md:py-24"
      >
        <FeaturedSermon videos={youTubeVideos} />
      </section>

      <section id="events" className="w-full p-4 md:p-10 overflow-hidden">
        <div className="mb-4 md:mb-8">
          <span className="text-primary text-lg">Upcoming</span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">
            Events
          </h1>
        </div>
        <UpcomingEvents />
      </section>

      <section
        id="vision"
        className="w-full px-4 md:px-10 p-4 bg-foreground"
      >
        <div className="w-full flex flex-col md:flex-row items-center justify-between md:gap-4 overflow-hidden">
          <div className="text-left mb-10 md:mb-0 md:pl-10 md:max-w-[45%] shrink-0">
            <span className="text-muted-foreground text-xl ml-1 font-heading">
              We are
            </span>
            <p className="text-5xl md:text-7xl font-heading font-semibold text-background">
              A Shining Light to the Nations
            </p>
            <h1 className="text-2xl text-muted-foreground">
              Proclaiming the Gospel of Jesus Christ and bringing hope, truth,
              and salvation to the nations through the power of God&apos;s Word.
            </h1>
            <div className="flex gap-4 mt-6 mb-6 items-center">
              <Link href="/about" className={buttonVariants({ size: "lg" })}>
                Learn More
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "visit-us",
                )}
              >
                Visit Us
                <IconMapPin size={30} />
              </Link>
            </div>
          </div>
          <div className="w-full md:w-[55%] h-112.5 md:h-150">
            <DepthCarousel
              items={visionCarouselItems}
              showControls={false}
              showIndicators={false}
              autoplay={true}
              autoplayDelay={4000}
              loop={true}
              cardWidth={450}
              cardHeight={550}
              radius={24}
              depth={200}
              spread={80}
              tilt={20}
              blur={5}
              falloff={0.25}
            />
          </div>
        </div>
        <div className="max-w-full w-4xl p-4 md:p-10 flex flex-col items-center justify-center gap-4 mx-auto">
          <p className="text-2xl md:text-4xl text-center text-background font-semibold font-heading list-none">
            For this is what the Lord has commanded us:{" "}
            <span className="italic text-primary">
              <br />
              “I have made you a light for the Gentiles, that you may bring
              salvation to the ends of the earth.”
            </span>
          </p>
          <span className="text-muted-foreground text-lg">Acts 13:47 NIV</span>
        </div>
      </section>

      <section id="testimony" className="w-full py-10 overflow-hidden">
        <div className="max-w-full px-4 md:px-10 mb-4 md:mb-8">
          <span className="text-primary text-lg">Showmelujah Report</span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">
            What God has Done
          </h1>
        </div>
        <TestimonySlideshow />
      </section>

      <section
        id="get-in-touch"
        className="hero w-full mt-8 md:mt-0 p-4 md:p-10 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-4"
      >
        <div className="flex-1 md:pr-10 md:sticky top-24">
          <h1 className="text-4xl md:text-6xl font-heading font-bold">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            We&apos;re here to help. Reach out for prayer requests, counseling,
            or general inquiries.
          </p>
          <div className="mt-8">
            <span className="flex items-center gap-2 mt-4">
              <IconPhone className="size-5 text-muted-foreground" />
              09029018318
            </span>
            <span className="flex items-center gap-2 mt-4">
              <IconMail className="size-5 text-muted-foreground" />
              info@amdi.com
            </span>
            <span className="flex gap-2 mt-4">
              <IconMapPin className="size-6 text-muted-foreground" />
              <span>
                Arrow of Deliverance Ministry, Opposite State Polytechnic,
                Jalingo, Taraba State, Nigeria
              </span>
            </span>
          </div>
        </div>
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <Tabs defaultValue="prayer" className="w-full sm:max-w-lg flex flex-col">
            <TabsList className="w-full grid grid-cols-3 gap-4 p-1">
              <TabsTrigger value="prayer">Prayer</TabsTrigger>
              <TabsTrigger value="counseling">Counseling</TabsTrigger>
              <TabsTrigger value="inquiry">Inquiry</TabsTrigger>
            </TabsList>
            <TabsContent value="prayer">
              <ContactForm type="prayer" />
            </TabsContent>
            <TabsContent value="counseling">
              <ContactForm type="counseling" />
            </TabsContent>
            <TabsContent value="inquiry">
              <ContactForm type="inquiry" />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </section>
  );
}
