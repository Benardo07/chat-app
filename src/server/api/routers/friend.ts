import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { friends, users } from "~/server/db/schema";
import { and, eq, or } from "drizzle-orm";
import { db } from "~/server/db";

export const friendRouter = createTRPCRouter({
    addFriend: publicProcedure
    .input(z.object({
      userId: z.string(),
      friendId: z.string()
    }))
    .mutation(async ({ input }) => {
      // Check if the friendship already exists
      const friendshipExists = await db.select().from(friends).where(
        and(
            eq(friends.userId, input.userId),
            eq(friends.friendId, input.friendId)
          )
      ).execute();

      if (friendshipExists.length > 0) {
        throw new Error('Friendship already exists');
      }

      // Create new friendship
      const newFriendship = await db.insert(friends).values({
        userId: input.userId,
        friendId: input.friendId
      }).returning().execute();

      if (newFriendship.length === 0){
        throw new Error('UFailed add friend');
      }
      return newFriendship[0];
    }),

    checkFriendship: publicProcedure
    .input(z.object({
      userId: z.string(),
      friendId: z.string()
    }))
    .query(async ({ input }) => {
      const friendship = await db.select().from(friends).where(
        and(
          eq(friends.userId, input.userId),
          eq(friends.friendId, input.friendId)
        )
      ).execute();


      // Return true if friendship exists, false otherwise
      return { isFriend: friendship.length > 0 };
    }),

    listFriends: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user.id) {
        throw new Error("User must be logged in to fetch friends list.");
      }
      const userFriends = await ctx.db.select({
        userId: friends.friendId,
        userName: users.name,
        userProfile: users.image
      })
      .from(friends)
      .leftJoin(users, eq(friends.friendId, users.id))
      .where(eq(friends.userId, ctx.session.user.id))
      .execute();

      return userFriends;
    }),

})