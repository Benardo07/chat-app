import { z } from "zod";
import { hash } from "bcrypt";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { friends, users } from "~/server/db/schema";
import { eq, or, and, sql } from "drizzle-orm";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
  // Register a new user
  getUser: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.select().from(users)
        .where(sql`${users.id} = ${input.userId}`)
        .execute();
      return user[0] ?? null; // Return the user data or null if not found
    }),
  register: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      accountId: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),  // Ensure password has a minimum length
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, accountId, email, password } = input;

      // Check if email or accountId already exists
      const existingUser = await ctx.db.select().from(users).where(
        or(
            eq(users.email, email),
            eq(users.accountId,accountId)
        )
      )

      if (existingUser.length != 0) {
        throw new Error("Email or Account ID already exists.");
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);  // Salt rounds = 10

      // Create new user in the database
      const [newUser] = await ctx.db.insert(users).values({
        name,
        accountId,
        email,
        password: hashedPassword,
        image: "/defaultProfile.jpeg",  
      }).returning();

      if(!newUser){
        throw new Error("Failed to register");
      }
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
    }),

    findByAccountId: publicProcedure
    .input(z.object({
        accountId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
        if (!ctx.session || !ctx.session.user) {
            throw new Error("Unauthorized");
        }
        const currentUserId = ctx.session.user.id;

        // Retrieve user by accountId
        const user = await db.select().from(users)
            .where(eq(users.accountId, input.accountId))
            .execute();

        // Check if the user was found
        if (user.length === 0) {
            throw new Error('User not found');
        }

        const foundUser = user[0];

        if(!foundUser){
            throw new Error('User not Found')
        }
        // Check friendship status
        const friendship = await db.select().from(friends)
            .where(
                and(
                    eq(friends.userId, currentUserId),
                    eq(friends.friendId, foundUser.id)  // Safe to use foundUser.id here as it cannot be undefined
                )
            )
            .execute();

        // Determine if they are friends
        const isFriend = friendship.length > 0;

        return {
            ...foundUser,
            isFriend
        };
    }),


});
