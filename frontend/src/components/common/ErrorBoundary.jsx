import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-6 text-center">
        <img src="/images/logo-icon.png" alt="" className="mb-6 h-20 w-auto" />
        <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
        <p className="mt-2 max-w-md text-ink-muted">An unexpected error occurred. Please reload the page.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-6 font-semibold text-primary hover:bg-accent-hover"
        >
          Reload
        </button>
      </div>
    );
  }
}
