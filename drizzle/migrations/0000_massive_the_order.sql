CREATE TABLE IF NOT EXISTS "chat-app_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "chat-app_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_conversation_room" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_friend" (
	"user_id" varchar(255) NOT NULL,
	"friend_id" varchar(255) NOT NULL,
	CONSTRAINT "chat-app_friend_user_id_friend_id_pk" PRIMARY KEY("user_id","friend_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_group_member" (
	"group_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	CONSTRAINT "chat-app_group_member_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"admin_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_room_id" integer NOT NULL,
	"sender_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_room_participant" (
	"room_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	CONSTRAINT "chat-app_room_participant_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"password" varchar(255) NOT NULL,
	"image" varchar(255),
	CONSTRAINT "chat-app_user_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat-app_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "chat-app_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_account" ADD CONSTRAINT "chat-app_account_user_id_chat-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_friend" ADD CONSTRAINT "chat-app_friend_user_id_chat-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_friend" ADD CONSTRAINT "chat-app_friend_friend_id_chat-app_user_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_group_member" ADD CONSTRAINT "chat-app_group_member_group_id_chat-app_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."chat-app_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_group_member" ADD CONSTRAINT "chat-app_group_member_user_id_chat-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_group" ADD CONSTRAINT "chat-app_group_admin_id_chat-app_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_message" ADD CONSTRAINT "chat-app_message_conversation_room_id_chat-app_conversation_room_id_fk" FOREIGN KEY ("conversation_room_id") REFERENCES "public"."chat-app_conversation_room"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_message" ADD CONSTRAINT "chat-app_message_sender_id_chat-app_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_room_participant" ADD CONSTRAINT "chat-app_room_participant_room_id_chat-app_conversation_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat-app_conversation_room"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_room_participant" ADD CONSTRAINT "chat-app_room_participant_user_id_chat-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat-app_session" ADD CONSTRAINT "chat-app_session_user_id_chat-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chat-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "chat-app_account" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "chat-app_session" ("user_id");