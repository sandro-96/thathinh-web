import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center bg-linear-to-b from-rose-50 to-white dark:from-background dark:to-background">
      <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-300 animate-float">
        <Compass className="h-7 w-7" />
      </div>
      <div className="animate-fade-up stagger-1">
        <h1 className="text-3xl font-bold text-rose-600">404</h1>
        <p className="text-muted-foreground mt-1">Không tìm thấy trang bạn đang tìm.</p>
      </div>
      <div className="flex gap-2">
        <Button asChild className="bg-rose-500 hover:bg-rose-600">
          <Link to="/topics">Về trang chính</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
