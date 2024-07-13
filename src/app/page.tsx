import React from 'react';
import Sidebar from "./_components/sidebar";

import MessageArea from "./_components/messageArea";
import { getServerSession } from "next-auth";
import { HydrateClient } from "~/trpc/server";
import { authOptions } from '~/server/auth';
import ChatSidebar from './_components/chadSidebar';

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <HydrateClient>
      <div className="relative h-screen flex overflow-hidden bg-white" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="h-full w-16 pt-[73px]">
          <Sidebar />
        </div>
        <div className="flex flex-1 pt-[73px]">
          <ChatSidebar />

          <MessageArea />

          
        </div>
      </div>
    </HydrateClient>
  );
}
