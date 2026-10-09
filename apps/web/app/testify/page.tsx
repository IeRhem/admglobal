import type { Metadata } from "next";
import { TestifyForm } from "@/components/forms/testify-form";

export const metadata: Metadata = {
  title: "Share Your Testimony",
  description: "Share what God has done in your life to encourage others.",
};

export default function TestifyPage() {
    return (
        <section className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Testimonies</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We overcome by the blood of the Lamb and the word of our testimony. Share what God has done in your life to encourage others.
                    </p>
                </div>
                
                <div className="w-full">
                    <TestifyForm />
                </div>
            </div>
        </section>
    );
}