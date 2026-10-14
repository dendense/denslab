import type { Metadata } from "next";
import Image from "next/image";
import { imgurFullUrl } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About",
  description:
    "denslab is a community for people who see images as more than pictures: AI-generated art, conceptual photography, and the ideas behind them.",
};

/** Landscape entry shown below the statement. Replaced by Supabase later. */
const aboutImage = {
  imgurId: "n6Bm2Fq",
  title: "Horizon, Interrupted",
  width: 1900,
  height: 1050,
};

export default function AboutPage() {
  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <article className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
        <header className="space-y-3 border-b border-border pb-6 sm:space-y-4">
          <Badge>About denslab</Badge>
          <h1 className="text-3xl font-semibold tracking-tight leading-tight sm:text-4xl lg:text-5xl">
            A laboratory for images and the ideas behind them.
          </h1>
        </header>

        <p className="text-lg leading-relaxed sm:text-xl lg:text-2xl">
          We&rsquo;re a community for people who see images as more than
          pictures. A place to share AI-generated art, conceptual photography,
          and the ideas behind them. Whether you&rsquo;re experimenting with new
          tools or capturing a vision through your lens, this is where
          imagination finds an audience and inspiration keeps moving.
        </p>

        <figure className="bg-card overflow-hidden rounded-xl border shadow-sm">
          <Image
            src="https://i.imgur.com/syCkh06.jpeg"
            alt={aboutImage.title}
            width={aboutImage.width}
            height={aboutImage.height}
            sizes="(min-width: 1024px) 896px, (min-width: 640px) 90vw, 100vw"
            className="h-auto w-full border-b border-border object-cover"
          />
          <figcaption className="text-muted-foreground px-4 py-3 text-sm">
            Art by @bloodexer - SMRRY
          </figcaption>
        </figure>
      </article>
    </main>
  );
}
