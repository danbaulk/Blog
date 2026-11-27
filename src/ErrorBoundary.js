import React from 'react';

/**
 * Renders `fallback` instead of its children if they throw while rendering - including a
 * React.lazy chunk that fails to load (offline, or a tab left open across a deploy that
 * replaced the hashed chunk files), which would otherwise unmount the whole app.
 */
class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default ErrorBoundary;
