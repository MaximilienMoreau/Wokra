export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
    >
      {children}
    </p>
  );
}
