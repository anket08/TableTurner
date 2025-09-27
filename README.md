# Chess Master - Real-time Multiplayer Chess Application

A modern, real-time chess application built with React, TypeScript, and Firebase. Play against intelligent bots or challenge other players in multiplayer matches.

## Features

- **Real-time Multiplayer**: Play against other players with live move synchronization
- **Intelligent Bot Opponents**: Three difficulty levels (Easy, Medium, Hard) with sophisticated AI
- **Game History**: Track all your games with detailed statistics and filtering
- **User Authentication**: Secure login with Google and GitHub OAuth
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Move Validation**: Complete chess rule enforcement with check/checkmate detection
- **Theme Support**: Light and dark mode themes
- **Game Statistics**: Win rate, total games, and performance tracking

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling with shadcn/ui components
- **Wouter** for lightweight routing
- **TanStack React Query** for server state management
- **chess.js** for chess game logic and validation
- **react-chessboard** for the interactive chess board

### Backend & Database
- **Firebase Authentication** for user management
- **Firebase Firestore** for real-time game synchronization
- **Express.js** for API endpoints (optional)
- **Vite** for development and build tooling

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chess-master
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication with Google and GitHub providers
   - Enable Firestore database
   - Copy your Firebase configuration

4. Create environment file:
```bash
cp .env.example .env
```

5. Add your Firebase configuration to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

### Firebase Setup

1. **Authentication Setup**:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Google and GitHub providers
   - Add your domain to authorized domains

2. **Firestore Setup**:
   - Go to Firebase Console > Firestore Database
   - Create database in production mode
   - Set up security rules (basic rules are included in the app)

3. **Security Rules** (Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if request.auth != null && 
        (resource.data.players.white == request.auth.uid || 
         resource.data.players.black == request.auth.uid ||
         resource.data.players.white == 'bot' ||
         resource.data.players.black == 'bot');
    }
  }
}
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `dist/public` folder to Netlify
3. Add environment variables in Netlify dashboard

## Game Features

### Bot AI Levels
- **Easy**: Random legal moves
- **Medium**: Prioritizes captures and checks with some strategy
- **Hard**: Advanced evaluation with piece values, position, and tactical awareness

### Multiplayer
- Real-time move synchronization
- Automatic opponent matching
- Game state persistence

### Game History
- Complete game tracking
- Filter by opponent type, result, difficulty, and time period
- Detailed statistics and win rate calculation

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries and configurations
│   │   ├── pages/          # Page components
│   │   └── services/       # API and business logic services
├── server/                 # Backend Express server (optional)
├── shared/                 # Shared TypeScript schemas
└── public/                 # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.