import React from 'react';

const Header: React.FC = () => {
  return ( 
    <header className='fixed w-full z-50 bg-white'> 
      <div className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f4f2] px-10 py-3">
        <div className="flex items-center gap-4 text-[#111814]">
          {/* Icon and title */}
          <div className="w-12 h-12">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Chattr</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          {/* Navigation links and new chat button */}
          <div className="flex items-center gap-9">
            <a className="text-sm font-medium" href="#">Favorites</a>
            <a className="text-sm font-medium" href="#">Add Friend</a>
            <a className="text-sm font-medium" href="#">Groups</a>
          </div>
          <button className="min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#19cc64] text-sm font-bold">
            New chat
          </button>
          <div className="w-10 h-10 rounded-full bg-center bg-cover" style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/stability/0b408dde-97a2-4020-a55c-c36d5fdcffb5.png")' }}></div>
        </div>
      </div>
      
    </header>
  );
};

export default Header;
