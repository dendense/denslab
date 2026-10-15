"use client";

import { Check, Copy, ExternalLink, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Donation targets. Images live in /public.
 *
 * NOTE: replace USDT_TRC20_ADDRESS with the real wallet address before
 * deploying. The placeholder is deliberately obvious so a copied value is never
 * mistaken for a working address.
 */
const USDT_TRC20_ADDRESS = "TFX8aD5KwR8fNtaV8icaZWkDeSvcNZhCVhn";

const OPTIONS = [
  {
    id: "dana",
    label: "QRIS Dana",
    caption: "by DANA",
    image: "/qris-dana.jpg",
    alt: "QRIS code for donating via DANA",
    /** QR encodes the payment link, so no address text is shown. */
    address: null,
  },
  {
    id: "usdt",
    label: "Crypto USDT",
    caption: "Network TRC20",
    image: "/qris-usdt.png",
    alt: "QRIS code for donating USDT on the TRC20 network",
    address: USDT_TRC20_ADDRESS,
  },
] as const;

/**
 * The modal shell is shadcn Dialog: Radix supplies the focus trap, Escape
 * handling, scroll lock and `aria-modal` wiring that used to be hand-rolled
 * here. Only the donation content stays custom.
 */
export function DonateButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Heart aria-hidden="true" />
          Donate
        </Button>
      </DialogTrigger>

      {/*
        Height is capped on the PANEL so a visible margin stays above and below
        it on phones (80vh instead of 90vh); desktop keeps the old 90vh, which
        never binds there. Scrolling is moved to the inner wrapper below: if the
        panel itself scrolled, the absolutely positioned close button would
        scroll out of view with the content.

        Width uses `w-` and not `max-w-`: an `sm:max-w-3xl` cap goes full-bleed
        on every viewport between 640 and 768. A plain `max-w-3xl` stays as the
        desktop cap and lets `calc` keep 32px per side below it.
      */}
      <DialogContent className="flex max-h-[80vh] w-[calc(100%-4rem)] max-w-3xl flex-col overflow-hidden sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Support denslab</DialogTitle>
          <DialogDescription>
            Every contribution keeps the laboratory running. Thank you.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {OPTIONS.map((option) => (
              <Card key={option.id} className="flex flex-col">
                <div className="space-y-1 p-4">
                  <h3 className="text-base font-semibold leading-none font-mono">
                    {option.label}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {option.caption}
                  </p>
                </div>

                <div className="px-4">
                  <div className="rounded-md border bg-white">
                    <Image
                      src={option.image}
                      alt={option.alt}
                      width={480}
                      height={480}
                      sizes="(min-width: 640px) 40vw, 90vw"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>

                {option.address && (
                  <div className="mt-auto space-y-2 p-4">
                    <p className="text-sm font-medium leading-none">
                      Wallet address
                    </p>
                    <AddressField address={option.address} />
                  </div>
                )}
              </Card>
            ))}
          </div>

          <p className="text-muted-foreground text-sm">
            Only send USDT on the TRC20 network to the address above. Funds sent
            on another network cannot be recovered.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Address plus a copy button, since transcribing a wallet address by hand is error-prone. */
function AddressField({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission).
    }
  }

  return (
    <div className="space-y-3">
      <code className="bg-muted block break-all rounded-md px-2 py-1.5 font-mono text-xs leading-relaxed">
        {address}
      </code>

      {/* Controls sit side by side with an explicit gap so the link is never
          flush against the button. */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy address"}
        </Button>

        <Button asChild variant="outline" size="sm">
          <a
            href={`https://tronscan.org/#/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Tronscan
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}
