CREATE TABLE IF NOT EXISTS "todos" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
