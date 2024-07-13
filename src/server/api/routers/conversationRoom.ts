// server/routers/conversationRoomRouter.ts
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { conversationRooms, messages, roomParticipants, users } from '~/server/db/schema';
import { and, count, desc, eq, exists, max, not, sql } from 'drizzle-orm';
import { z } from 'zod';
import { alias } from 'drizzle-orm/pg-core';

export const conversationRoomRouter = createTRPCRouter({
  listConversationRooms: publicProcedure
  .query(async ({ ctx }) => {
    // Ensure session and user exist before proceeding
    if (!ctx.session || !ctx.session.user) {
      throw new Error("Unauthorized");
    }

    // Proceed with fetching data knowing that ctx.session and ctx.session.user are defined
    const roomsWithParticipants = await ctx.db.select({
      roomId: roomParticipants.roomId,
      roomType: conversationRooms.roomType,
      roomName: conversationRooms.name
    })
    .from(roomParticipants)
    .leftJoin(conversationRooms, eq(roomParticipants.roomId, conversationRooms.id))
    .where(eq(roomParticipants.userId, ctx.session.user.id))
    .execute();

    if (roomsWithParticipants.length === 0) {
      throw new Error("No room yet");
    }

    const rooms = await Promise.all(roomsWithParticipants.map(async (room) => {

      if (!ctx.session){
        throw new Error("unauthorize")
      }
      const messagesInfo = await ctx.db.select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        eq(messages.conversationRoomId, room.roomId),
      )
      .orderBy(desc(messages.createdAt))
      .execute();

      const unreadCountResult = await ctx.db.select({count: count()})
          .from(messages)
          .where(and(
            eq(messages.conversationRoomId, room.roomId),
            eq(messages.read, false),
            not(eq(messages.senderId, ctx.session.user.id))
          ));

      const unreadCount = unreadCountResult[0]?.count ?? 0;

      

      
      
      if (room.roomType === 'private' && ctx.session) {
        const otherParticipant = await ctx.db.select({ name: users.name })
          .from(users)
          .leftJoin(roomParticipants, eq(roomParticipants.userId, users.id))
          .where(and(
            eq(roomParticipants.roomId, room.roomId),
            not(eq(roomParticipants.userId, ctx.session.user.id))
          ))
          .execute();

        return {
          id: room.roomId,
          roomType: room.roomType,
          name: otherParticipant.map(u => u.name).join(', '),
          unreadCount : unreadCount,
          latestMessage: {
            content: messagesInfo[0]?.message.content,
            createdAt : messagesInfo[0]?.message.createdAt,
          }
        };
      } else{


          return {
            id: room.roomId,
            roomType: room.roomType,
            name: room.roomName,
            unreadCount: unreadCount,
            latestMessage: {
              content: messagesInfo[0]?.message.content,
            createdAt : messagesInfo[0]?.message.createdAt,
            }
          };
        
        
        
      }
    }));

    return rooms;
  }),

    ensureConversationRoom: publicProcedure
  .input(z.object({
    userId: z.string(),
    targetUserId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check for existing conversation room between these two users
    const existingRoom = await ctx.db.select()
      .from(conversationRooms)
      .leftJoin(roomParticipants, eq(roomParticipants.roomId, conversationRooms.id))
      .where(and(
        eq(roomParticipants.userId, input.userId),
        exists(
          ctx.db.select()
            .from(alias(roomParticipants,'rp'))  // Aliasing to avoid ambiguity
            .where(and(
              eq(sql`rp.room_id`, roomParticipants.roomId),  // Use alias
              eq(sql`rp.user_id`, input.targetUserId)  // Use direct value, no alias needed
            ))
        )
      ))
      .execute();

    if (existingRoom.length > 0) {
      return existingRoom[0]?.conversation_room; // Assuming this returns the full room object directly
    }

    // Create a new conversation room if not found
    const newRoom = await ctx.db.insert(conversationRooms)
      .values({
        roomType: 'private' // Assuming a private room type for direct chats
      })
      .returning()
      .execute();
    
    if(newRoom.length === 0 || !newRoom[0]){
      throw new Error("Failed to Create Conversation");
    }

    // Add both users as participants
    await Promise.all([
      ctx.db.insert(roomParticipants).values({ roomId: newRoom[0].id, userId: input.userId }).execute(),
      ctx.db.insert(roomParticipants).values({ roomId: newRoom[0].id, userId: input.targetUserId }).execute()
    ]);

    return newRoom[0]; // Return the newly created room
  }),

});
