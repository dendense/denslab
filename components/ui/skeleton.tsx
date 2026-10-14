import { cn } from "@/lib/utils"

/**
 * shadcn Skeleton: a muted pulse that reads as "loading" without a spinner.
 * `aria-hidden` keeps it out of the a11y tree.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
