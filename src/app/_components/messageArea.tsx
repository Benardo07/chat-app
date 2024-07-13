"use client";
import React, { useState, useEffect, useRef } from 'react';
import { workerData } from 'worker_threads';
import { useConversationRoom } from '../context/conversationRoomContext';
import { api } from '~/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  accountId: string;
  email: string;
  emailVerified: Date | null;
  password: string;
  image: string | null;
} 

interface ChatMessage {
  type: 'message' | 'join' | 'leave';
  roomId: number;
  messageId?: number; // Assuming you might also want the message ID
  senderId?: string;
  content?: string;
  senderName?: string | null;
  senderImage?: string | null;
  createdAt?: Date | null;
  read: boolean;
  replyToId?: number | null; // This is optional, referencing another message ID
  deleted: boolean;
}
const MessageArea: React.FC = () => {
  const router = useRouter();
  const { currentRoom } = useConversationRoom();
  const { data: session , status} = useSession();
  const [newMessage, setNewMessage] = useState('');
  const [userData, setUserData] = useState<User | null | undefined>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);


  // Redirect if not authenticated or if session is not present after loading
  if (status === 'unauthenticated' || !session?.user?.id) {
    redirect("/login")
  }

  const { data: userDetails, isLoading: isLoadingUserDetails, isError: isErrorUserDetails } = api.user.getUser.useQuery({ userId: session?.user?.id }, {
    enabled: !!session?.user?.id
  });

  const markChatAsRead = api.message.markMessagesAsRead.useMutation();

  useEffect(() => {
    if (userDetails) {
      setUserData(userDetails);
      console.log("User data fetched:", userDetails);
    }
  }, [userDetails]);
  const { data: fetchedMessages, isLoading: isLoadingMessages, refetch } = api.message.getMessages.useQuery({
    conversationRoomId: currentRoom?.id ?? 0
  }, {
    enabled: !!currentRoom?.id
  });

  useEffect(() => {
    if (fetchedMessages) {
      const transformedMessages: ChatMessage[] = fetchedMessages.map(msg => ({
        ...msg,
        type: 'message', // Default type since it's missing in the original data
        roomId: currentRoom?.id ?? 0, // Ensure roomId is assigned
      }));
  
      // Sort messages by createdAt date
      transformedMessages.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  
      setMessages(transformedMessages);
      console.log('Transformed and sorted messages:', transformedMessages);
    }
  }, [fetchedMessages, currentRoom?.id]);
  const sendMessage = api.message.sendMessage.useMutation();

  

  const [ws, setWs] = useState<WebSocket | null>(null);

  const markMessagesAsRead = async (roomId: number) => {
    try {
        await markChatAsRead.mutateAsync({
            conversationRoomId: roomId
        });
        console.log("Messages marked as read.");
    } catch (error) {
        console.error("Failed to mark messages as read:", error);
    }
};

  useEffect(() => {
    if (!currentRoom?.id) return;

    const websocket = new WebSocket('ws://chat-app-server.competitive-conni.internal:8000');
    websocket.onopen = () => {
      console.log('WebSocket connected');
      const joinMessage: ChatMessage = {
        type: 'join',
        roomId: currentRoom.id,
        read: true, // Default to true for a join message
        deleted: false
      };
      websocket.send(JSON.stringify(joinMessage));

      markMessagesAsRead(currentRoom.id);
    };

    websocket.onmessage = async (event) => {
      const message: ChatMessage = JSON.parse(event.data);
      if (message.type === 'message') {
        setMessages(prevMessages => [...prevMessages, message]);
        await markMessagesAsRead(currentRoom.id);
        void refetch();
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      websocket.close();
    };

    setWs(websocket);

    return () => {
      websocket.close(); // Ensure to close WebSocket connection when component unmounts
    };
  }, [currentRoom?.id]);
  

  const handleSendMessage = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("Key Pressed:", event.key);  // Check which key was pressed
    if (event.key === 'Enter') {
      console.log("Enter key pressed");
      if (newMessage.trim()) {
        console.log("Message is not empty");
        console.log(currentRoom)
        console.log(userData)
        if (currentRoom && userData) {
          console.log("Current room and user data are available");
  
          const messageToSend: ChatMessage = {
            type: 'message',
            roomId: currentRoom.id,
            senderId: session.user.id,
            content: newMessage,
            senderName: userData?.name,
            senderImage: userData.image,
            createdAt : new Date(),
            read: false, // Sent messages are 'read' by the sender
            deleted: false
          };
  
          console.log("Message to send:", messageToSend);
  
          await sendMessage.mutateAsync({
            conversationRoomId: currentRoom.id,
            senderId: session.user.id,
            content: newMessage,
          });
  
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(messageToSend));
            setNewMessage('');  // Clear input after sending
            console.log("Message sent via WebSocket");
          } else {
            console.error("WebSocket is not open.");
          }
  
          void refetch();
        } else {
          console.log("Current room or user data is missing");
        }
      } else {
        console.log("Message is empty");
      }
    } else {
      console.log("Key pressed is not Enter");
    }
  };

  useEffect(() => {
    // Scroll to the bottom every time messages change
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Start a Conversation</h2>
          <p>Select a chat to start messaging or use the "New Chat" button to create a new conversation.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col flex-1 max-w-[960px] h-full border-r-2">
        <h1 className='w-full border-b-2 p-4 text-2xl font-bold'>{currentRoom?.name}</h1>
        <div className='flex-grow overflow-auto p-4 scroll-hidden'>
          {messages.map((message, index) => (
              <div key={index} className={`flex items-end gap-3 p-4 ${message.senderId === session?.user?.id ? "flex-row-reverse" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-center bg-cover" style={{ backgroundImage: `url(${message.senderImage})` }}>
                </div>
                <div className={`flex flex-1 flex-col gap-1 ${message.senderId === session?.user?.id ? "items-end text-right" : "items-start text-left"}`}>
                  <p className="text-[#638872] text-[13px] font-normal leading-normal max-w-[360px]">{message.senderId === session?.user?.id ? "Me" : message.senderName}</p>
                  <div className={`${message.senderId === session?.user?.id ? "flex-row-reverse" : "flex-row"} flex gap-3`}>
                    <p className="text-base font-normal flex max-w-[360px] rounded-xl px-4 py-3 bg-[#f0f4f2] text-[#111814]">
                      {message.content}
                    </p>
                    <div className={`${message.senderId === session?.user?.id ? "text-left self-end" : "text-right self-end"} text-xs text-gray-500`}>
                      <p className="text-xs text-gray-500">
                        {message.read && message.senderId === session?.user?.id && "Read"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { timeStyle: 'short' }) : ""}
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            ))}
            <div ref={endOfMessagesRef} />
        </div>
        <div className="sticky bottom-0 p-4 bg-white border-t-2 flex flex-row">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-grow form-input rounded-xl px-4 py-2 border-none bg-[#f0f4f2] text-[#111814]"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleSendMessage}
          />
          <button
            className="ml-4 flex items-center justify-center px-4 py-2 bg-[#19cc64] text-white font-medium rounded-xl"
            onClick={() => {
              if (newMessage.trim()) {
                handleSendMessage({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>);
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
