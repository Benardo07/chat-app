import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="px-4 py-3">
      <div className="flex w-full items-stretch rounded-xl bg-[#f0f4f2]">
        <div className="text-[#638872] flex items-center justify-center pl-4 rounded-l-xl">
          {/* Magnifying glass icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
          </svg>
        </div>
        <input
          placeholder="Search"
          className="flex w-full min-w-0 flex-1 rounded-xl text-[#111814] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f2] placeholder:text-[#638872] px-4 rounded-l-none"
        />
      </div>
    </div>
  );
};

export default SearchBar;
