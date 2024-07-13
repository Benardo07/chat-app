  "use client"
  import React, { useEffect, useRef, useState } from 'react';
  import Image from 'next/image';
  import { api } from "~/trpc/react";
  import { useRouter } from 'next/navigation';
  import { useSession } from 'next-auth/react';
  import { useConversationRoom } from '../context/conversationRoomContext';
  import { ConversationRoom } from '../context/conversationRoomContext';
  import ws from 'ws';
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

interface ConversationRoomBeta {
  id: number;
  roomType: string | null;
  name: string | null;
  unreadCount : number;
  latestMessage : {
    content?: string | null;
    createdAt?: Date | null;
  }
}


  const ChatSidebar: React.FC = () => {
    const router = useRouter();
    const {currentRoom, setCurrentRoom } = useConversationRoom();
    const { data: session, status } = useSession();
    const [showFriends, setShowFriends] = useState(false);
    const [roomsShow, setRooms] = useState<ConversationRoomBeta[]>([]);
    const ws = useRef<WebSocket | null>(null);

    // Only call the query if the userId is defined
    const userId = session?.user?.id;
    const isEnabled = status === 'authenticated' && userId != null;

    const { data: rooms, refetch: refetchRooms } = api.conversationRoom.listConversationRooms.useQuery();
    const { data: friends, refetch: refetchFriends } = api.friend.listFriends.useQuery();
    const startChat = api.conversationRoom.ensureConversationRoom.useMutation();

    useEffect(() => {
      if (status === 'unauthenticated' || !userId) {
        router.push('/login');
      }
    }, [status, userId, router]);

    useEffect(() => {
      if (rooms){
        const sortedRooms = rooms.sort((a, b) => {
          const dateA = new Date(a.latestMessage.createdAt || 0);
          const dateB = new Date(b.latestMessage.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setRooms(sortedRooms);
      }
      
    }, [rooms])
    useEffect(() => {
      ws.current = new WebSocket('ws://chat-app-server.competitive-conni.internal:8000');
      ws.current.onopen = () => {
        console.log("WebSocket connection established");
        rooms?.forEach((room: ConversationRoom) => {
          ws.current?.send(JSON.stringify({ type: 'join', roomId: room.id }));
        });
      };
  
      ws.current.onmessage = (event: MessageEvent) => {
        const message: ChatMessage = JSON.parse(event.data);
        console.log("Received message:", message);
        console.log(currentRoom?.id)

        if (message.type === 'message' && message.roomId !== currentRoom?.id) {
          updateUnreadCount(message.roomId);
        }

        updateLatestMessage(message);
      };
  
      return () => {
        ws.current?.close();
      };
    }, [rooms]);
    
    const handleAddNewChat = () => {
      setShowFriends(true);
      if (isEnabled) {
        refetchFriends();
      }
    };
    const updateUnreadCount = (roomId: number) => {
      console.log("count")
      setRooms(prevRooms =>
        prevRooms.map(room => 
          room.id === roomId ? { ...room, unreadCount: room.unreadCount + 1 } : room
        )
      );
    };

    const updateLatestMessage = (message: ChatMessage) => {
      console.log("halo");
      setRooms(prevRooms =>
        prevRooms.map(room => 
          room.id === message.roomId ? { ...room, latestMessage: { content: message.content, createdAt: message.createdAt } } : room
        )
      );
    };

    const updateUnreadCounttoZero = (roomId: number) => {
      setRooms(prevRooms =>
        prevRooms.map(room => 
          room.id === roomId ? { ...room, unreadCount: 0} : room
        )
      );
    };

    const startChatWith = async (id: string) => {
      if (!userId) return;

      try {
        const room = await startChat.mutateAsync({
          userId,
          targetUserId: id,
        });
        if (room) {
          setCurrentRoom(room);
        }
        refetchRooms();
        console.log("Chat room ensured", room);
        setShowFriends(false)
      } catch (err) {
        console.error('Error ensuring chat room:', err);
      }
    }

    const handleClickRoom = (room :ConversationRoom | undefined ) => {
      if(room){
        setCurrentRoom(room)
        updateUnreadCounttoZero(room.id)
      }else{
        console.log("undefined room")
      }
      
    } 

    const displayDate = (dateString?: Date|null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    if (status === 'loading') {
      return <div>Loading...</div>; // Show loading or a spinner here
    }


    return (
      <div className="w-1/4 bg-white p-6 border-r-2">
        <div className="px-4 py-3">
          <label className="flex flex-row items-center justify-center w-full gap-5">
            <div className="flex w-full items-stretch rounded-xl bg-[#f0f4f2]">
              <div className="text-[#638872] flex items-center justify-center pl-4 rounded-l-xl">
                {/* Magnifying glass icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                </svg>
              </div>
              <input
                placeholder="Search"
                className="flex w-full  py-3 min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111814] focus:outline-0 focus:ring-0 border-none bg-[#f0f4f2] placeholder:text-[#638872] px-5 rounded-l-none pl-2 text-base font-normal leading-normal"
              />
            </div>
            <div className='rounded-full hover:bg-slate-400 p-2' onClick={handleAddNewChat}>
            <Image src="/addChat.png" alt='addChat' width={25} height={25}></Image>
            </div>
            
          </label>
        </div>
        <div>
        {showFriends ? (
            friends?.map(friend => (
              <div key={friend.userId} className="flex items-center gap-4 px-4 py-2 w-full mt-4">
                <div className="flex flex-row justify-between w-full items-center">
                  <p className="font-bold">{friend.userName}</p>
                  <button onClick={() => startChatWith(friend.userId)} className='px-4 py-2 bg-green-500 rounded-2xl font-bold'>Chat Now</button>
                </div>
              </div>
            ))
          ) : (
            roomsShow?.map((room, index) => (
              <div key={room.id} className={`flex items-center gap-4 px-4 py-2 min-h-[72px] justify-between ${room.id === currentRoom?.id ? "bg-slate-100" : "hover:bg-slate-100 duration-300"}`} onClick={() => handleClickRoom(room)}>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111814] text-base font-medium leading-normal line-clamp-1">{room?.name}</p>
                  <p className="text-[#638872] text-sm font-normal leading-normal line-clamp-2">{room.latestMessage.content}</p>
                </div>
                <div className='flex flex-col items-end justify-end'>
                  <p className="text-[#638872] text-sm font-normal leading-normal">{displayDate(room.latestMessage.createdAt)}</p>
                  {room.unreadCount > 0 && <p className='bg-green-400 rounded-full text-sm text-center w-[20px] h-[20px] flex items-center justify-center'>{room.unreadCount}</p>}
                </div>
              </div>
            ))
          )}
          
        </div>
      </div>
    );
  };

  export default ChatSidebar;
