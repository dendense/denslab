import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "denslab — AI & Conceptual Photo Portfolio",
    template: "%s | denslab",
  },
  description:
    "Personal laboratory for AI generated images & conceptual photography.",
};

export const viewport: Viewport = {
  themeColor: "#fffdf8",
};

/**
 * Reads the current session for the nav. Returns `null` on the server when
 * Supabase is not configured or nobody is signed in.
 */
async function getSessionUser() {
  const supabase = await createClient();

  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = user.email ?? null;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email ??
    "Member";

  return {
    email,
    displayName: name,
    initial: name.charAt(0).toUpperCase(),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col bg-canvas text-foreground">
        <SiteHeader user={user} />
        {children}
        <SiteFooter />
        <Script id="theme-color-sync">{`var m=document.querySelector('meta[name="theme-color"]');if(m){var u=function(){m.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim()||'#fffdf8')};u();new MutationObserver(u).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}`}</Script>
      </body>
    </html>
  );
}
