export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-brutal bg-canvas">
      <div className="flex w-full flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:gap-3 sm:px-6 sm:text-left lg:px-10">
        <p className="flex flex-col items-center gap-1 font-display text-sm font-bold sm:flex-row sm:gap-2">
          denslab.
          <span className="font-mono text-xs font-normal">
            AI &amp; conceptual photography lab.
          </span>
        </p>

        <p className="font-mono text-xs">© {new Date().getFullYear()} denslab</p>
      </div>
    </footer>
  );
}
