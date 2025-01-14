import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true };  // Update state to indicate error
    }
  
    componentDidCatch(error, errorInfo) {
      console.error('3D Model Error:', error, errorInfo);
      this.setState({ error, errorInfo }); // Optional: log error for debugging
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-500">Something went wrong loading the 3D model.</p>
          </div>
        );
      }
      return this.props.children;
    }
  }
  