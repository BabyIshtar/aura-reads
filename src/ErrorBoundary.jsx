import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Aura hit a render error." };
  }

  componentDidCatch(error, info) {
    console.error("Aura render error", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07080a] px-5 text-white">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-white/38">Aura recovered</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.06em]">No black screen.</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/58">
            Something in the UI crashed, but Aura caught it safely instead of going fully black.
          </p>
          {this.state.message && (
            <p className="mt-3 rounded-2xl bg-black/30 px-3 py-2 text-xs text-white/45">{this.state.message}</p>
          )}
          <button
            onClick={this.reset}
            className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition active:scale-95"
          >
            Reopen Aura
          </button>
        </div>
      </main>
    );
  }
}
