import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from "~/trpc/react"; // Adjust import path as needed

interface AddFriendModalProps {
  onClose: () => void;
}

interface User {
  id: string;
  name: string | null;
  accountId: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  isFriend: boolean;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'unauthenticated' || !session?.user) {
    router.push('/login');
    return null; // Return null while redirecting
  }

  const [accountId, setAccountId] = useState('');
  const [userFound, setUserFound] = useState<User | null>(null);
  const [isFriend, setIsFriend] = useState(false);

  // Setup queries with manual refetching
  const findByAccountId = api.user.findByAccountId.useQuery({ accountId }, { enabled: false });
  

  const { mutateAsync: addFriend } = api.friend.addFriend.useMutation();

  const handleSearch = async () => {
    console.log(accountId)
    if (!accountId) return; // Prevent empty accountId search
    try {
      const userResult = await findByAccountId.refetch();
      if (userResult.data) {
        setUserFound(userResult.data);

        setIsFriend(userResult.data.isFriend);
        
      } else {
        setUserFound(null);
        setIsFriend(false);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setUserFound(null);
      setIsFriend(false);
    }
  };

  const handleAddFriend = async () => {
    if (userFound) {
      await addFriend({ userId: session.user.id, friendId: userFound.id });
      setIsFriend(true); // Assume friendship is true upon successful addition
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded-3xl w-3/4 h-1/2 max-w-[500px] min-h-[400px] flex flex-col gap-3 items-center">
        <h2 className='text-2xl font-bold'>Add Friend</h2>
        <div className='w-full flex flex-row gap-3 '>
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Enter Account ID"
            className='w-full px-5 py-3 border-2 rounded-2xl'
          />
          <button onClick={handleSearch} className='bg-green-500 px-3 py-2 rounded-full font-bold'>Search</button>
        </div>
        {userFound ? (
          <div className='flex flex-col gap-2 items-center h-full'>
            <Image src={userFound.image || '/defaultProfile.jpeg'} alt="Profile" width={50} height={50} className='rounded-full' />
            <p>{userFound.name}</p>
            <button onClick={handleAddFriend} disabled={isFriend} className='bg-green-500 px-3 py-2 rounded-full font-bold'>
              {isFriend ? 'Already Friends' : 'Add Friend'}
            </button>
          </div>
        ) : (
          <p className='h-full'>No user found.</p>
        )}
        <button onClick={onClose} className='bg-green-500 px-3 py-2 rounded-full'>Close</button>
      </div>
    </div>
  );
};

export default AddFriendModal;
