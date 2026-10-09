import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import {
  IconArrowUpRight,
  IconCompass,
  IconTrendingUp,
  IconSend,
  IconMaximize,
  IconSparkles,
  IconAward,
  IconScale,
  IconHeart,
  IconFlame,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Discover who we are, what we stand for, and the mission God has entrusted to Arrow of Deliverance Ministries International.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden px-4">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="z-10 flex flex-col items-center mb-30">
            <span className="text-primary font-heading font-semibold tracking-wider text-lg mb-4">
              The Church
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 text-foreground tracking-tight">
              A Guiding Light to the Nations
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Discover who we are, what we stand for, and the mission God has
              entrusted to Arrow of Deliverance Ministries International.
            </p>
            <Link
              href="/plan-visit"
              className={cn(
                "group h-fit! items-center justify-center gap-2 pr-1! py-1! transition-transform duration-300 hover:-translate-y-0.5 inline-flex!",
                buttonVariants({ size: "lg", variant: "secondary" }),
                "bg-foreground! text-background! hover:bg-accent-foreground!",
              )}
            >
              Plan a Visit
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                <IconArrowUpRight className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
              </span>
            </Link>
          </div>
          <div className="relative h-100 lg:h-150 w-full rounded-3xl overflow-hidden shadow-2xl border border-primary/10">
            <Image
              src="/images/welcome.jpg"
              alt="Welcome to ADMI"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
        </div>
      </section>

      {/* 01 - Our Vision Section */}
      <section className="relative w-full py-24 md:py-32 px-4 flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/grid-image/image-10.jpg"
            alt="Vision Background"
            fill
            sizes="100vw"
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background via-background/80 to-background" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <span className="text-primary font-heading font-semibold tracking-wider text-lg mb-4">
            Our Vision
          </span>
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-10">
            A Guiding Light to the Nations
          </h2>
          
          <div className="relative group w-full mb-12">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-primary/10 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-background/60 backdrop-blur-xl border border-primary/20 rounded-[2rem] p-10 md:p-16 shadow-2xl">
              <blockquote className="text-3xl md:text-5xl font-serif italic text-foreground mb-6 leading-tight">
                &quot;A Guiding Light To The Nations.&quot;
              </blockquote>
              <p className="text-primary font-semibold tracking-widest uppercase text-sm">
                Isaiah 42:6–7 &middot; Acts 13:47
              </p>
            </div>
          </div>

          <p className="text-lg md:text-2xl text-muted-foreground/80 leading-relaxed max-w-3xl">
            Our vision is to be a guiding light to the nations, reflecting the
            light of Christ and making His truth, hope, and salvation known. We
            seek to serve as an instrument through which lives are transformed
            and people are directed toward God&apos;s purpose.
          </p>
        </div>
      </section>

      {/* 02 - Our Mission Section */}
      <section className="w-full py-24 md:py-32 px-4 bg-foreground">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="text-primary font-heading font-semibold tracking-wider text-lg mb-4">
            Our Mission
          </span>
            <div className="flex flex-col items-center justify-center text-center mb-24">
              <blockquote className="text-3xl md:text-5xl font-serif italic text-background mb-8 leading-tight">
                &quot;We empower men and women through the ministry of the Word
                and prayer, to discover, develop, release and maximize their
                potential in God.&quot;
              </blockquote>
              <p className="text-primary font-semibold tracking-widest uppercase text-sm">
                Isaiah 60:1–3 &middot; Acts 6:4 &middot; Philippians 2:13–15
              </p>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              {
                title: "Discover",
                icon: <IconCompass className="size-20 text-primary" />,
                description:
                  "Discover the purpose, gifts, and potential God has placed within you.",
                image: "/grid-image/image-34.jpg"
              },
              {
                title: "Develop",
                icon: <IconTrendingUp className="size-20 text-primary" />,
                description:
                  "Grow through God's Word, prayer, and spiritual development.",
                image: "/grid-image/image-13.jpg"
              },
              {
                title: "Release",
                icon: <IconSend className="size-20 text-primary" />,
                description:
                  "Put your God-given gifts, abilities, and potential into action.",
                image: "/grid-image/image-9.jpg"
              },
              {
                title: "Maximize",
                icon: <IconMaximize className="size-20 text-primary" />,
                description:
                  "Live out your purpose and make the fullest expression of your potential in God.",
                image: "/grid-image/image-6.jpg"
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group flex flex-col p-2 rounded-2xl border bg-card hover:bg-accent transition-colors duration-300 cursor-pointer shadow-sm"
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />               
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span>0{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex flex-col px-1 pb-1">
                  <div className="text-foreground text-lg font-bold font-heading flex items-center gap-2 mb-2 [&>svg]:size-5 [&>svg]:text-primary">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <h3 className="text-sm md:text-base font-medium leading-relaxed text-muted-foreground line-clamp-3">
                    {item.description}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 - Our Core Values Section */}
      <section className="w-full py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="text-primary font-semibold tracking-wider text-lg font-heading mb-4">
            Our Core Values
          </span>
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8 text-center">
            HEALS
          </h2>

          <div className="text-center max-w-4xl mb-20">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-muted-foreground">
              &quot;We conduct our activities in an atmosphere of Holiness,
              Excellence, Accountability, Love and Spirituality.&quot;
            </blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[
              {
                letter: "H",
                title: "Holiness to the Lord",
                icon: <IconSparkles className="size-8" />,
                description:
                  "We uphold holiness as a fundamental expression of our devotion to God, seeking to live and serve in a manner that honors Him.",
                scriptures: "Hebrews 12:14 · Exodus 28:36–38",
              },
              {
                letter: "E",
                title: "Excellence in All We Do",
                icon: <IconAward className="size-8" />,
                description:
                  "We pursue excellence in our service, conduct, responsibilities, and ministry, giving our best in all that God has entrusted to us.",
                scriptures: "Genesis 39:2–4 · Daniel 5:12 · Daniel 6:3–4",
              },
              {
                letter: "A",
                title: "Living With Accountability",
                icon: <IconScale className="size-8" />,
                description:
                  "We value responsibility and accountability before God and toward one another, recognizing that our words, actions, and stewardship matter.",
                scriptures: "Romans 14:12 · Matthew 12:36",
              },
              {
                letter: "L",
                title: "Walking in Love",
                icon: <IconHeart className="size-8" />,
                description:
                  "We are committed to demonstrating the love of Christ through the way we relate to God, one another, and the people we serve.",
                scriptures:
                  "John 13:34–35 · 1 John 3:11, 23–24 · Colossians 3:14",
              },
              {
                letter: "S",
                title: "A Life of Spirituality",
                icon: <IconFlame className="size-8" />,
                description:
                  "We cultivate a life centered on God through His Word, prayer, faith, and the work of the Holy Spirit.",
                scriptures: "John 3:5–8 · Romans 8:1–14",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group relative p-8 md:p-10 rounded-[2rem] border bg-background hover:border-primary transition-colors duration-500 flex flex-col items-start overflow-hidden shadow-sm hover:shadow-xl"
              >
                <div className="absolute -right-6 -top-10 text-[180px] font-black text-primary/5 group-hover:text-primary/10 transition-colors duration-500 font-heading select-none pointer-events-none">
                  {value.letter}
                </div>
                <div className="mb-8 p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500 z-10">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold font-heading mb-4 z-10">
                  {value.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-muted-foreground/90 grow mb-8 z-10 text-lg">
                  {value.description}
                </p>
                <div className="mt-auto z-10 w-full pt-6 border-t group-hover:border-primary/20">
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary flex flex-col gap-1">
                    Scriptures
                    <span className="text-foreground group-hover:text-foreground/90 normal-case font-normal mt-1">
                      {value.scriptures}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 - Gallery Section */}
      <section className="w-full py-24 md:py-32 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="text-primary font-heading font-semibold tracking-wider text-lg mb-4">
            Our Community
          </span>
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-16 text-center">
            Life at ADMI
          </h2>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 w-full">
            {[1, 9, 13, 20, 15, 6, 23, 21, 30].map((num) => (
              <div key={num} className="relative rounded-[2rem] overflow-hidden break-inside-avoid shadow-lg group border border-primary/10">
                <Image
                  src={`/grid-image/image-${num}.jpg`}
                  alt={`ADMI Community ${num}`}
                  width={600}
                  height={800}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <span className="text-white font-heading font-bold text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    ADMI Family
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
