import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3001;
export const FRONTEND_URL = process.env.FRONTEND_URL || "*";
export const DATABASE_URL = process.env.DATABASE_URL || "./chat.db";