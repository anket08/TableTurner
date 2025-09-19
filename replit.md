# Overview

Chess Master is a real-time multiplayer chess application built with React, Express, and Firebase. The application allows users to play chess games against bots with configurable difficulty levels or against other players in real-time multiplayer matches. The system features comprehensive game tracking, move history, user statistics, and a modern, responsive UI built with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **UI Framework**: React with TypeScript for type safety and better development experience
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: React Context API for global state management (Auth, Theme, Game contexts)
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack React Query for server state management and caching
- **Chess Logic**: chess.js library for game rules, move validation, and board state management
- **Chess Board**: react-chessboard for the interactive chess board component

## Backend Architecture

The backend uses a hybrid Express.js and Firebase approach:

- **Server Framework**: Express.js with TypeScript for API endpoints and static file serving
- **Database**: Drizzle ORM configured for PostgreSQL with schema definitions in shared folder
- **Real-time Features**: Firebase Firestore for real-time game synchronization and multiplayer functionality
- **Authentication**: Firebase Authentication with Google and GitHub OAuth providers
- **Development Setup**: Vite for development server with HMR and build optimization

## Data Storage Solutions

The application uses a dual storage approach:

- **PostgreSQL**: Primary database using Drizzle ORM for structured data storage with schema definitions for users, games, and user statistics
- **Firebase Firestore**: Real-time database for live game states, move synchronization, and multiplayer game coordination
- **Local Storage**: Browser storage for theme preferences and temporary game states
- **In-Memory Storage**: Development fallback storage implementation for testing

## Authentication and Authorization

Firebase Authentication handles user management:

- **OAuth Providers**: Google and GitHub sign-in options
- **Session Management**: Firebase handles token management and session persistence
- **User Context**: React context provides authentication state throughout the application
- **Protected Routes**: Authentication guards ensure only signed-in users can access game features

## Game Logic and Bot System

The chess engine and bot system provide engaging gameplay:

- **Chess Engine**: chess.js library handles all game rules, move validation, check/checkmate detection
- **Bot AI**: Three difficulty levels (easy, medium, hard) with different move selection algorithms
- **Game States**: Comprehensive tracking of game status, player turns, move history, and game outcomes
- **Real-time Sync**: Firebase Firestore enables real-time move synchronization for multiplayer games

## Component Structure

The UI is organized into logical component hierarchies:

- **Layout Components**: Header with navigation, theme toggle, and user menu
- **Game Components**: Chess board, player cards, move history, game settings
- **Page Components**: Game page, history page, authentication page
- **Context Providers**: Global state management for authentication, theming, and game state
- **UI Components**: Reusable shadcn/ui components for consistent design

# External Dependencies

## Third-Party Services

- **Firebase**: Authentication (Google/GitHub OAuth), Firestore for real-time multiplayer functionality
- **Neon Database**: PostgreSQL hosting for primary data storage
- **Vercel/Netlify**: Potential deployment platforms for static hosting

## Key Libraries and Frameworks

- **Chess Logic**: chess.js for game rules and move validation, react-chessboard for board visualization
- **UI Framework**: React, TypeScript, Tailwind CSS, shadcn/ui component library
- **State Management**: TanStack React Query for server state, React Context for global state
- **Database**: Drizzle ORM for PostgreSQL operations, Firebase SDK for Firestore
- **Development Tools**: Vite for build tooling, ESBuild for server bundling
- **Authentication**: Firebase Authentication SDK
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Radix UI primitives, Tailwind CSS, class-variance-authority for component variants

## Development and Build Tools

- **Build System**: Vite for frontend, ESBuild for backend bundling
- **Type Safety**: TypeScript throughout the application with shared schema definitions
- **Code Quality**: ESLint configuration, TypeScript strict mode
- **Asset Management**: Vite handles static assets and font loading
- **Environment**: Node.js with ES modules, environment variable configuration for Firebase and database connections