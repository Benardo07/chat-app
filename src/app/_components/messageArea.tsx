"use client";
import React, { useState } from 'react';

const messages = [
  {
    id: 1,
    sender: "Siqi Chen",
    content: "Really appreciate the insights. Question, you often cite reference various books for your arguments for deeper dives. Have you ever considered creating a book recommendation page?",
    time: "1:00 PM",
    type: "incoming",
    avatarUrl: "https://cdn.usegalileo.ai/stability/409de4ca-a0a6-4867-9278-c0fec6d192b8.png"
  },
  {
    id: 2,
    sender: "Me",
    content: "That's a great idea! I'll start working on it this weekend.",
    time: "1:05 PM",
    type: "outgoing",
    avatarUrl: "https://cdn.usegalileo.ai/stability/3b752bfb-7880-4020-9178-c0a04284dea7.png"
  },
  {
    id: 1,
    sender: "Siqi Chen",
    content: "Really appreciate the insights. Question, you often cite reference various books for your arguments for deeper dives. Have you ever considered creating a book recommendation page?",
    time: "1:00 PM",
    type: "incoming",
    avatarUrl: "https://cdn.usegalileo.ai/stability/409de4ca-a0a6-4867-9278-c0fec6d192b8.png"
  },
  {
    id: 2,
    sender: "Me",
    content: "That's a great idea! I'll start working on it this weekend.",
    time: "1:05 PM",
    type: "outgoing",
    avatarUrl: "https://cdn.usegalileo.ai/stability/3b752bfb-7880-4020-9178-c0a04284dea7.png"
  },
  {
    id: 1,
    sender: "Siqi Chen",
    content: "Really appreciate the insights. Question, you often cite reference various books for your arguments for deeper dives. Have you ever considered creating a book recommendation page?",
    time: "1:00 PM",
    type: "incoming",
    avatarUrl: "https://cdn.usegalileo.ai/stability/409de4ca-a0a6-4867-9278-c0fec6d192b8.png"
  },
  {
    id: 2,
    sender: "Me",
    content: "That's a great idea! I'll start working on it this weekend.",
    time: "1:05 PM",
    type: "outgoing",
    avatarUrl: "https://cdn.usegalileo.ai/stability/3b752bfb-7880-4020-9178-c0a04284dea7.png"
  }
];

const MessageArea: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage.trim()) {
      console.log("Sending message:", newMessage);  // Simulate message send
      setNewMessage('');  // Clear input after sending
    }
  };

  return (
    <div className="flex flex-col flex-1 max-w-[960px] h-full">
        <h1 className='w-full border-b-2 p-4 text-2xl font-bold'>Chat with Siqi Chen</h1>
        <div className='flex-grow overflow-auto p-4'>
            {messages.map((message) =>
                message.type === "incoming" ? (
                <div key={message.id} className="flex items-end gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-center bg-cover" style={{ backgroundImage: `url(${message.avatarUrl})` }}></div>
                    <div className="flex flex-1 flex-col gap-1 items-start">
                    <p className="text-[#638872] text-[13px] font-normal leading-normal max-w-[360px]">{message.sender}</p>
                    <p className="text-base font-normal flex max-w-[360px] rounded-xl px-4 py-3 bg-[#f0f4f2] text-[#111814]">
                        {message.content}
                    </p>
                    </div>
                </div>
                ) : (
                <div key={message.id} className="flex items-end gap-3 p-4 justify-end">
                    <div className="flex flex-1 flex-col gap-1 items-end">
                    <p className="text-[#638872] text-[13px] font-normal leading-normal max-w-[360px] text-right">{message.sender}</p>
                    <p className="text-base font-normal flex max-w-[360px] rounded-xl px-4 py-3 bg-[#19cc64] text-[#111814]">
                        {message.content}
                    </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-center bg-cover" style={{ backgroundImage: `url(${message.avatarUrl})` }}></div>
                </div>
                )
            )}
        </div>
        <div className="sticky bottom-0 p-4 bg-white border-t-2 flex flex-row">
            <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow form-input rounded-xl px-4 py-2 border-none bg-[#f0f4f2] text-[#111814]"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleSendMessage}
            />
            <button
                className="ml-4 flex items-center justify-center px-4 py-2 bg-[#19cc64] text-white font-medium rounded-xl"
                onClick={() => {
                    if (newMessage.trim()) {
                      console.log("Sending message:", newMessage);  // Simulate message send
                      setNewMessage('');  // Clear input after sending
                    }
                }}
            >
                Send
            </button>
        </div>
    </div>
  );
};

export default MessageArea;
