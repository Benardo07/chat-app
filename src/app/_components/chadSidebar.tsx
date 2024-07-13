  "use client"
  import React, { useEffect, useState } from 'react';
  import Image from 'next/image';
  import { api } from "~/trpc/react";
  import { useRouter } from 'next/navigation';
  import { useSession } from 'next-auth/react';
  import { useConversationRoom } from '../context/conversationRoomContext';
  import { ConversationRoom } from '../context/conversationRoomContext';

  const ChatSidebar: React.FC = () => {
    const router = useRouter();
    const {currentRoom, setCurrentRoom } = useConversationRoom();
    const { data: session, status } = useSession();
    const [showFriends, setShowFriends] = useState(false);

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
    
    const handleAddNewChat = () => {
      setShowFriends(true);
      if (isEnabled) {
        refetchFriends();
      }
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
      }else{
        console.log("undefined room")
      }
      
    } 

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
            rooms?.map((room, index) => (
              <div key={room.id} className={`flex items-center gap-4 px-4 py-2 min-h-[72px] justify-between ${room.id === currentRoom?.id ? "bg-slate-100" : "hover:bg-slate-100 duration-300"}`} onClick={() => handleClickRoom(room)}>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111814] text-base font-medium leading-normal line-clamp-1">{room?.name}</p>
                  <p className="text-[#638872] text-sm font-normal leading-normal line-clamp-2">tes</p>
                </div>
                <div><p className="text-[#638872] text-sm font-normal leading-normal">tes</p></div>
              </div>
            ))
          )}
          
        </div>
      </div>
    );
  };

  export default ChatSidebar;
