import { Component } from "react";

/**
 * Top-level error boundary. Keeps a rendering crash in any page or lazy
 * chunk from blanking the entire app, and offers a recovery path.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#080808] px-6 text-center text-stone-300">
          <div className="max-w-md space-y-5">
            <h1 className="text-lg font-medium text-white">Something went wrong</h1>
            <p className="text-sm text-stone-400">
              An unexpected error interrupted CareerForge. Your saved data is safe — reloading usually resolves this.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-medium text-black transition hover:bg-amber-300"
              >
                Reload CareerForge
              </button>
              <button
                onClick={this.handleHome}
                className="rounded-lg border border-stone-700 px-4 py-2 text-xs text-stone-300 transition hover:border-stone-500"
              >
                Go to home
              </button>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
