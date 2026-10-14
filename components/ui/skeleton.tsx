import { cn } from "@/lib/utils"

/**
 * shadcn Skeleton shell, restyled to the denslab neobrutalist look: the moving
 * diagonal stripe already reads as "loading" without a spinner, so the default
 * `animate-pulse` is dropped. `aria-hidden` keeps it out of the a11y tree.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("brutal-skeleton border-brutal-thin bg-canvas", className)}
      {...props}
    />
  )
}

export { Skeleton }
