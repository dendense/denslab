"use client";

import { Check, Copy, ExternalLink, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
      <DialogTrigger className="border-brutal-thin inline-flex items-center gap-2 px-3 py-1.5 font-display text-sm font-bold brutal-press">
        <Heart className="h-4 w-4" aria-hidden="true" />
        Donate
      </DialogTrigger>

      <DialogContent className="border-brutal max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-canvas p-5 text-ink shadow-brutal-lg sm:rounded-none sm:p-6">
        <DialogHeader className="mb-5 flex-row items-start justify-between gap-4 space-y-0 border-b-brutal pb-4 text-left">
          <div className="space-y-1">
            <DialogTitle className="font-display text-xl font-bold sm:text-2xl">
              Support denslab
            </DialogTitle>
            <DialogDescription className="font-mono text-xs leading-relaxed sm:text-sm">
              Every contribution keeps the laboratory running. Thank you.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {OPTIONS.map((option) => (
            <section
              key={option.id}
              className="border-brutal-thin flex flex-col bg-canvas"
            >
              <div className="border-b-brutal-thin px-3 py-2">
                <h3 className="font-display text-base font-bold">
                  {option.label}
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wide">
                  {option.caption}
                </p>
              </div>

              <div className="p-3">
                <div className="border-brutal bg-white">
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
                <div className="mt-auto border-t-brutal-thin p-3">
                  <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wide">
                    Wallet address
                  </p>
                  <AddressField address={option.address} />
                </div>
              )}
            </section>
          ))}
        </div>

        <p className="mt-5 border-t-brutal-thin pt-4 font-mono text-[11px] leading-relaxed">
          Only send USDT on the TRC20 network to the address above. Funds sent on
          another network cannot be recovered.
        </p>
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
      <code className="border-brutal-thin block break-all bg-canvas px-2 py-1.5 font-mono text-[11px] leading-relaxed">
        {address}
      </code>

      {/* Controls sit side by side with an explicit gap so the link is never
          flush against the button. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="border-brutal-thin inline-flex items-center gap-1.5 px-2.5 py-1.5 font-display text-xs font-bold brutal-press"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy address"}
        </button>

        <a
          href={`https://tronscan.org/#/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-brutal-thin inline-flex items-center gap-1.5 px-2.5 py-1.5 font-display text-xs font-bold brutal-press"
        >
          View on Tronscan
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
