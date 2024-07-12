import React from 'react';

const users = [
  { id: 1, name: "Siqi Chen", message: "How are you doing?", time: "3:20 PM" },
  { id: 2, name: "Sarah Huo", message: "I'm doing well. How about you?", time: "2:45 PM" },
  { id: 3, name: "Alex Sims", message: "Do you want to join us for dinner tonight?", time: "1:30 PM" }
];

const ChatSidebar: React.FC = () => {
  return (
    <div className="w-1/4 bg-white p-6 border-r-2">
      <div className="px-4 py-3">
        <label className="flex flex-col w-full">
          <div className="flex w-full items-stretch rounded-xl bg-[#f0f4f2]">
            <div className="text-[#638872] flex items-center justify-center pl-4 rounded-l-xl">
              {/* Magnifying glass icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
            </div>
            <input
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111814] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f2] placeholder:text-[#638872] px-4 rounded-l-none pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>
      <div>
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 px-4 py-2 min-h-[72px] justify-between">
            <div className="flex flex-col justify-center">
              <p className="text-[#111814] text-base font-medium leading-normal line-clamp-1">{user.name}</p>
              <p className="text-[#638872] text-sm font-normal leading-normal line-clamp-2">{user.message}</p>
            </div>
            <div><p className="text-[#638872] text-sm font-normal leading-normal">{user.time}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
