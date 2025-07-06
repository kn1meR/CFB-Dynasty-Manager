import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface InsightErrorBoundaryState {
  hasError: boolean;
}

class InsightErrorBoundary extends React.Component<
  { children: React.ReactNode },
  InsightErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): InsightErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Insight error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  Insights Temporarily Unavailable
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  There was an issue generating insights. Try refreshing the page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default InsightErrorBoundary;
