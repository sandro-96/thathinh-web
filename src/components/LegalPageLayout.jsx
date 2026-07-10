import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function LegalPageLayout({ title, children }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-rose-50 to-white">
      <header className="border-b bg-background/80 backdrop-blur px-4 py-4">
        <div className="container max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8 prose prose-sm prose-neutral dark:prose-invert max-w-none">
        {children}
        <footer className="mt-12 pt-6 border-t text-xs text-muted-foreground not-prose flex gap-4">
          <Link to="/terms" className="hover:underline">Điều khoản</Link>
          <Link to="/privacy" className="hover:underline">Quyền riêng tư</Link>
          <Link to="/" className="hover:underline">Trang chủ</Link>
        </footer>
      </main>
    </div>
  );
}
