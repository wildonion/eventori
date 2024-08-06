-- Adminer 4.8.1 PostgreSQL 16.2 (Ubuntu 16.2-1.pgdg22.04+1) dump

DROP TABLE IF EXISTS "comments";
DROP SEQUENCE IF EXISTS comments_id_seq;
CREATE SEQUENCE comments_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."comments" (
    "id" integer DEFAULT nextval('comments_id_seq') NOT NULL,
    "event_id" integer,
    "user_id" integer,
    "comment" text NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "event_registrations";
DROP SEQUENCE IF EXISTS event_registrations_id_seq;
CREATE SEQUENCE event_registrations_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."event_registrations" (
    "id" integer DEFAULT nextval('event_registrations_id_seq') NOT NULL,
    "event_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "registration_date" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "events";
DROP SEQUENCE IF EXISTS events_id_seq;
CREATE SEQUENCE events_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."events" (
    "id" integer DEFAULT nextval('events_id_seq') NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" text,
    "location" character varying(100),
    "start_time" timestamp,
    "end_time" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "manager_id" integer,
    "capacity" integer DEFAULT '0',
    "is_finished" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" character varying(50) NOT NULL,
    "password" text NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "em" boolean DEFAULT false,
    "token_time" bigint DEFAULT '0',
    "is_admin" boolean DEFAULT false,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username")
) WITH (oids = false);


DROP TABLE IF EXISTS "votes";
DROP SEQUENCE IF EXISTS votes_id_seq;
CREATE SEQUENCE votes_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."votes" (
    "id" integer DEFAULT nextval('votes_id_seq') NOT NULL,
    "event_id" integer,
    "user_id" integer,
    "vote" integer NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "votes_event_id_user_id_key" UNIQUE ("event_id", "user_id"),
    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


ALTER TABLE ONLY "public"."comments" ADD CONSTRAINT "comments_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."events" ADD CONSTRAINT "events_manager_id_fkey" FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."votes" ADD CONSTRAINT "votes_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;

-- 2024-08-06 16:23:09.539536+00
