"use client";
import React, { useState } from 'react';
import Image from 'next/image'; // Import the Image component from next/image
import AddFriendModal from './addFriend';

const Sidebar: React.FC = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const handleOpenModal = () => {
        setModalOpen(true);
    };
  return (
    <div className="h-full w-16 bg-white text-black flex flex-col items-center py-5">
      {/* Profile Icon */}
      <div className="icon hover:bg-gray-700 p-3 rounded">
        <Image src="/user.png" alt="Profile" width={24} height={24} />
      </div>
      {/* Add Friend Icon */}
      <div className="icon hover:bg-gray-700 p-3 rounded" onClick={handleOpenModal}>
        <Image src="/addUser.png" alt="Add Friend" width={24} height={24} />
      </div>
      {/* Friend Icon */}
      <div className="icon hover:bg-gray-700 p-3 rounded">
        <Image src="/group.png" alt="Friend" width={24} height={24} />
      </div>
      {/* Group Icon */}
      <div className="icon hover:bg-gray-700 p-3 rounded">
        <Image src="/setting.png" alt="Group" width={24} height={24} />
      </div>

      {isModalOpen && <AddFriendModal onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default Sidebar;
