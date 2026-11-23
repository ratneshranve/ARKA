import { useRouteError } from 'react-router-dom';

/** Router-level error screen (e.g. a lazy chunk failed to load after a new deploy). */
export default function RouteError() {
  const error = useRouteError();
  const chunkFailed = /dynamically imported module|Loading chunk|Failed to fetch/i.test(String(error?.message || error));
  console.error(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-6 text-center">
      <img src="/images/logo-icon.png" alt="" className="mb-6 h-20 w-auto" />
      <h1 className="text-2xl font-bold text-primary">Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        {chunkFailed ? 'A new version of the website is available.' : 'An unexpected error occurred.'} Please reload the page.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent px-6 font-semibold text-primary hover:bg-accent-hover"
        >
          Reload
        </button>
        <a href="/" className="inline-flex min-h-[44px] items-center rounded-lg border-2 border-primary px-6 font-semibold text-primary">
          Home
        </a>
      </div>
    </div>
  );
}
