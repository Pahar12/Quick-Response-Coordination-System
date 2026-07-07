import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldOff } from 'lucide-react';

function NotFound() {
  return (
    <div
      style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }}
      className="flex items-center justify-center p-6"
    >
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={36} className="text-slate-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-3">Page not found</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been moved. Please check the URL or navigate back to the homepage.
        </p>
        <Link to="/" className="btn btn-primary btn-lg inline-flex">
          <ArrowLeft size={17} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;