import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigUpIcon, CommandIcon } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleCopy = async () => {
    const { error } = this.state;
    if (!error) return;

    const errorDetails = `Error Message: ${error.message}\n\nStack Trace:\n${error.stack || 'N/A'}\n\nTimestamp: ${new Date().toISOString()}`;

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { error, copied } = this.state;
      const errorDetails = `Error Message: ${error.message}\n\nStack Trace:\n${error.stack || 'N/A'}\n\nTimestamp: ${new Date().toISOString()}`;

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-3xl space-y-6 px-6">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-bold text-red-600">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                An error occurred while processing your request
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Error Details</h3>
                  <Button
                    onClick={this.handleCopy}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copied ? 'Copied' : 'Copy to Clipboard'}
                  </Button>
                </div>
                <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-4 font-mono text-xs text-gray-800">
                  {errorDetails}
                </pre>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-semibold">Troubleshooting Tips:</p>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Try refreshing the page</li>
                  <li>
                    Clear your browser cache (Ctrl + Shift{' '}
                    <ArrowBigUpIcon className="inline size-3.5 object-center" />{' '}
                    + R on Windows/Linux, Cmd{' '}
                    <CommandIcon className="inline size-3.5 object-center" /> +
                    Shift{' '}
                    <ArrowBigUpIcon className="inline size-3.5 object-center" />{' '}
                    + R on Mac)
                  </li>
                  <li>
                    If the problem persists, try to seek help with the error
                    details above
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={this.handleRefresh} variant="outline">
                Refresh Page
              </Button>
              <Button onClick={this.handleGoHome} variant="default">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
