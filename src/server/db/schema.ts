import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `chat-app_${name}`);


export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: varchar("account_id", { length: 255 })
    .notNull()
    .unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  password: varchar("password", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  conversationRooms: many(conversationRooms)
}));

export const messages = createTable(
  "message",
  {
    id: serial("id").primaryKey(),
    conversationRoomId: integer("conversation_room_id")
      .notNull()
      .references(() => conversationRooms.id),
    senderId: varchar("sender_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
    read: boolean("read").notNull().default(false),
    replyToId: integer("reply_to_id").references(() :AnyPgColumn => messages.id),
    deleted: boolean("deleted").notNull().default(false)
  }
);

export const messageRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  conversationRoom: one(conversationRooms, { fields: [messages.conversationRoomId], references: [conversationRooms.id] }),
  replyToMessage: one(messages, { fields: [messages.replyToId], references: [messages.id]}),
}));


export const conversationRooms = createTable(
  "conversation_room",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    roomType: varchar("room_type", { length: 50 }).notNull(), // Could be 'private' or 'group'
  }
);

export const conversationRoomRelations = relations(conversationRooms, ({ many }) => ({
  messages: many(messages),
  participants: many(users), // Many-to-many relation through an intermediary table
}));



export const roomParticipants = createTable(
  "room_participant",
  {
    roomId: integer("room_id")
      .notNull()
      .references(() => conversationRooms.id),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (rp) => ({
    compoundKey: primaryKey({ columns: [rp.roomId, rp.userId] }),
  })
);

export const friends = createTable(
  "friend",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    friendId: varchar("friend_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (friend) => ({
    compoundKey: primaryKey({ columns: [friend.userId, friend.friendId] }),
  })
);


export const groups = createTable(
  "group",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    adminId: varchar("admin_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    conversationRoomId: integer("conversation_room_id")  // Adding reference to conversationRoom
      .notNull()
      .references(() => conversationRooms.id),
    
  }
);

export const groupRelations = relations(groups, ({ one, many }) => ({
  admin: one(users, { fields: [groups.adminId], references: [users.id] }),
  members: many(users), 
  conversationRoom: one(conversationRooms, { fields: [groups.conversationRoomId], references: [conversationRooms.id] }),
}));

export const groupMembers = createTable(
  "group_member",
  {
    groupId: integer("group_id") // Changed from varchar to serial to match the 'groups' table's 'id' type
      .notNull()
      .references(() => groups.id),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (gm) => ({
    compoundKey: primaryKey({ columns: [gm.groupId, gm.userId] }),
  })
);

export const groupMemberRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}));




export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
