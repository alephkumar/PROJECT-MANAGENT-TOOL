import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => (
  <div className="not-found">
    <h1>404</h1>
    <h2>Page not found</h2>
    <p className="text-muted">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>
      <FiHome /> Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
