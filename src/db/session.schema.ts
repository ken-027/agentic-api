import { pgTable, text, timestamp, uuid, serial } from "drizzle-orm/pg-core";

export const chatMessages = pgTable("chat_messages", {
    id: serial("id").primaryKey(),
    sessionId: uuid("session_id").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
