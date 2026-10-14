export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="text-muted-foreground flex w-full flex-col items-center justify-between gap-2 px-4 py-6 text-center text-sm sm:flex-row sm:gap-3 sm:px-6 sm:text-left lg:px-10">
        <p className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
          denslab.
          <span className="text-xs">AI &amp; conceptual photography lab.</span>
        </p>

        <p className="text-xs">© {new Date().getFullYear()} denslab</p>
      </div>
    </footer>
  );
}
