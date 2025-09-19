import { z } from "zod";

// User-related schemas
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Game-related schemas
export const gameSchema = z.object({
  id: z.string(),
  fen: z.string(), // Current board position in FEN notation
  moves: z.array(z.string()), // Array of moves in algebraic notation
  players: z.object({
    white: z.string(), // User ID or 'bot'
    black: z.string(), // User ID or 'bot'
  }),
  status: z.enum(["waiting", "active", "completed"]),
  winner: z.enum(["white", "black", "draw"]).nullable(),
  duration: z.number().nullable(), // Duration in seconds
  difficulty: z.enum(["easy", "medium", "hard"]).nullable(), // Bot difficulty
  createdAt: z.date(),
  updatedAt: z.date(),
  currentTurn: z.enum(["white", "black"]),
});

export const insertGameSchema = z.object({
  fen: z.string().default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
  moves: z.array(z.string()).default([]),
  players: z.object({
    white: z.string(),
    black: z.string(),
  }),
  status: z.enum(["waiting", "active", "completed"]).default("waiting"),
  winner: z.enum(["white", "black", "draw"]).nullable().default(null),
  duration: z.number().nullable().default(null),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable().default(null),
  currentTurn: z.enum(["white", "black"]).default("white"),
});

// User stats schema
export const userStatsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  totalGames: z.number().default(0),
  wins: z.number().default(0),
  losses: z.number().default(0),
  draws: z.number().default(0),
  winRate: z.number().default(0),
  updatedAt: z.date(),
});

export const insertUserStatsSchema = userStatsSchema.omit({ id: true, updatedAt: true });

// Move schema for real-time updates
export const moveSchema = z.object({
  from: z.string(),
  to: z.string(),
  promotion: z.string().optional(),
  san: z.string(), // Standard algebraic notation
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = z.infer<typeof gameSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type Move = z.infer<typeof moveSchema>;

// Game status types
export type GameStatus = "waiting" | "active" | "completed";
export type GameResult = "white" | "black" | "draw" | null;
export type PlayerColor = "white" | "black";
export type BotDifficulty = "easy" | "medium" | "hard";
