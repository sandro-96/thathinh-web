import { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Đã xảy ra lỗi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Có gì đó không ổn. Vui lòng tải lại trang.
            </p>
          </div>
          <Button onClick={this.handleReload} className="bg-rose-500 hover:bg-rose-600">
            Tải lại trang
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
