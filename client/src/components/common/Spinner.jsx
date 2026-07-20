import React from 'react';

const Spinner = ({ size = 'md', center = false }) => {
  const spinnerEl = <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />;
  if (center) {
    return <div className="spinner-center">{spinnerEl}</div>;
  }
  return spinnerEl;
};

export default Spinner;
