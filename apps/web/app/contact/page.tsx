import type { Metadata } from "next";
import { socialIconMap } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Arrow of Deliverance Ministries. We're here to help.",
};
import { ContactForm } from "@/components/forms/contact-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { socialLinks } from "@/lib/info";
import {
  IconArrowUpRight,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="w-full px-4 md:px-10 p-4 md:gap-4 overflow-hidden">
      <section
        id="get-in-touch"
        className="hero w-full mt-8 md:mt-10 py-4 md:p-10 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-4"
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
            {/* Social links */}
            <div className="flex flex-col mt-6">
              <h3 className="text-xs uppercase text-muted-foreground mb-4 font-semibold">
                Connect With Us
              </h3>
              <ul className="grid grid-cols-2 gap-3">
                {socialLinks.map(({ name, href }) => {
                  const Icon = socialIconMap[name];
                  return (
                    <li key={name}>
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-foreground/2 hover:bg-foreground/6 dark:bg-white/3 dark:hover:bg-white/8 transition-all duration-200"
                      >
                        {Icon && (
                          <Icon className="size-5 shrink-0 text-muted-foreground group-hover/social:text-foreground transition-colors" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {name}
                          </span>
                        </div>
                        <IconArrowUpRight className="size-3.5 ml-auto shrink-0 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/social:opacity-60 group-hover/social:translate-y-0 group-hover/social:translate-x-0 transition-all duration-200" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <Tabs
            defaultValue="prayer"
            orientation="horizontal"
            className="w-full sm:max-w-lg flex flex-col"
          >
            <TabsList className="w-full grid grid-cols-3 gap-2 p-1">
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

      <section className="mt-10">
        <h2 className="text-4xl font-bold text-center">Our Branches</h2>

        <div className="mt-8 w-full mx-auto">
          <Tabs
            defaultValue="main"
            orientation="horizontal"
            className="flex flex-col"
          >
            <TabsList className="mx-auto w-full grid grid-cols-4 p-1 gap-2">
              <TabsTrigger value="main">Jalingo</TabsTrigger>
              <TabsTrigger value="takum">Takum</TabsTrigger>
              <TabsTrigger value="wukari">Wukari</TabsTrigger>
              <TabsTrigger value="bali">Bali</TabsTrigger>
            </TabsList>
            <TabsContent
              value="main"
              className="outline-none focus-visible:ring-0 mt-0"
            >
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border shadow-inner">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8101216.517006437!2d1.9654510437231902!3d7.501401973473454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10f8d5348237416d%3A0x88d965d385deb963!2sArrow%20Of%20Deliverance%20Ministry!5e0!3m2!1sen!2sng!4v1781919354648!5m2!1sen!2sng"
                  title="Jalingo branch map"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </TabsContent>
            <TabsContent
              value="takum"
              className="outline-none focus-visible:ring-0 mt-0"
            >
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border shadow-inner bg-muted/30 flex items-center justify-center text-muted-foreground">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.956527775412!2d9.991782410355437!3d7.245787814318922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10584954322ae83d%3A0x6c4b50efc1cdca6f!2sArrow%20Of%20Deliverance%20Ministries%20Inc.%20Takum!5e0!3m2!1sen!2sng!4v1781920127610!5m2!1sen!2sng"
                  title="Takum branch map"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </TabsContent>
            <TabsContent
              value="wukari"
              className="outline-none focus-visible:ring-0 mt-0"
            >
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border shadow-inner bg-muted/30 flex items-center justify-center text-muted-foreground">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d307.56610056958255!2d9.790994572124639!3d7.868198972199061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x105771002a73aeaf%3A0xcd8528027a73ff83!2sArrow%20of%20Deliverance%20Ministries%2C%20Wukari!5e1!3m2!1sen!2sng!4v1781921827599!5m2!1sen!2sng"
                  title="Wukari branch map"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </TabsContent>
            <TabsContent
              value="bali"
              className="outline-none focus-visible:ring-0 mt-0"
            >
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border shadow-inner bg-muted/30 flex items-center justify-center text-muted-foreground">
                Map coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Visit Us CTA */}
      <section className="mt-10 mb-10 h-full relative overflow-hidden rounded-[2.5rem] bg-card/60 backdrop-blur-2xl border border-border shadow-2xl flex flex-col items-center justify-center p-12 md:p-24 text-center group">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent pointer-events-none z-20" />

        <h2 className="text-5xl md:text-7xl font-bold font-heading text-foreground mb-6 tracking-tight relative z-20">
          We look forward to your arrival!!!
        </h2>
      </section>
    </section>
  );
}
