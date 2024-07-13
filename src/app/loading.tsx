import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
