CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar" text,
	"instructions" text,
	"vmEnabled" boolean DEFAULT false,
	"userId" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chatHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"agentId" integer,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routineLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"routineId" integer,
	"status" varchar(50),
	"result" text,
	"executedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cron" varchar(100),
	"frequency" varchar(50),
	"startDate" timestamp,
	"agentId" integer,
	"requiredTools" json,
	"status" varchar(50) DEFAULT 'active',
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now(),
	"credits" integer DEFAULT 5,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatHistory" ADD CONSTRAINT "chatHistory_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routineLogs" ADD CONSTRAINT "routineLogs_routineId_routines_id_fk" FOREIGN KEY ("routineId") REFERENCES "public"."routines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;