// server/routers/messageRouter.ts
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { messages, users } from '~/server/db/schema';
import { and, asc, sql ,eq, not} from 'drizzle-orm';
import { z } from 'zod';

export const messageRouter = createTRPCRouter({
    getMessages: publicProcedure
    .input(z.object({
      conversationRoomId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.select({
        messageId: messages.id,
        conversationRoomId: messages.conversationRoomId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        read: messages.read,
        replyToId: messages.replyToId,
        deleted: messages.deleted,
        senderName: users.name,
        senderImage: users.image
      })
      .from(messages)
      .leftJoin(users, sql`${messages.senderId} = ${users.id}`) // Join users table to fetch sender details
      .where(sql`${messages.conversationRoomId} = ${input.conversationRoomId}`)
      .orderBy(asc(messages.createdAt))
      .execute();
    }),


  sendMessage: publicProcedure
    .input(z.object({
      conversationRoomId: z.number(),
      senderId: z.string(),
      content: z.string(),
      replyToId: z.number().optional(),
      
    }))
    .mutation(async ({ ctx, input }) => {
      const newMessage = await ctx.db.insert(messages).values({
        conversationRoomId: input.conversationRoomId,
        senderId: input.senderId,
        content: input.content,
        replyToId: input.replyToId,
        createdAt: new Date(),  // Assuming the database defaults do not apply
      }).returning().execute();

      if (newMessage.length === 0) {
        throw new Error('Failed to send message');
      }
      return newMessage[0];
    }),

    markMessagesAsRead: publicProcedure
    .input(z.object({
      conversationRoomId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || !ctx.session.user) {
        throw new Error("Unauthorized");
      }

      const result = await ctx.db.update(messages)
        .set({
          read: true
        })
        .where(and(
          eq(messages.conversationRoomId, input.conversationRoomId),
          not(eq(messages.senderId, ctx.session.user.id)),
          eq(messages.read, false)
        ))
        .execute();

      return { success: true, updated: result.count };
    }),
});
