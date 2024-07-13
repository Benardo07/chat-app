
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { friendRouter } from "./routers/friend";
import { conversationRoomRouter } from "./routers/conversationRoom";
import { messageRouter } from "./routers/message";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    user : userRouter,
    friend : friendRouter,
    conversationRoom : conversationRoomRouter,
    message: messageRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
