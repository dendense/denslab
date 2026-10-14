import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "denslab — AI & Conceptual Photo Portfolio",
    template: "%s | denslab",
  },
  description:
    "Personal laboratory for AI generated images & conceptual photography.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        {/*
          Runs before paint so the stored theme wins over the server default.
          Only the `data-theme` attribute is set here; `color-scheme` is driven
          by that attribute in globals.css (no inline style to drift from it).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="denslab-theme",s=localStorage.getItem(k),d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
        <SiteFooter />
        <Script id="theme-color-sync">{`var m=document.querySelector('meta[name="theme-color"]');if(m){var u=function(){m.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--background').trim()||'#fff')};u();new MutationObserver(u).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}`}</Script>
      </body>
    </html>
  );
}
