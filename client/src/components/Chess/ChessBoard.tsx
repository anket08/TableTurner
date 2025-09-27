import { Chessboard } from "react-chessboard";
import { useGame } from "@/contexts/GameContext";
import { Square } from "react-chessboard/dist/chessboard/types";

export default function ChessBoard() {
  const { game, makeMove, playerColor, isPlayerTurn, gameStatus, gameData } = useGame();

  if (!gameData) {
    return (
      <div className="aspect-square max-w-lg mx-auto bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">No active game</p>
      </div>
    );
  }

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
    // Only allow moves if it's the player's turn and game is active
    if (!isPlayerTurn || gameStatus !== "active") {
      return false;
    }

    // Create a test chess instance to validate the move
    const testGame = new Chess(game.fen());
    const move = testGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q", // Default to queen promotion
    });

    if (move === null) {
      return false; // Illegal move
    }

    // Make the move through the game service
    makeMove(sourceSquare, targetSquare, piece[1].toLowerCase() ?? "q");
    
    return true;
  };

  const boardOrientation = playerColor === "white" ? "white" : "black";
  
  // Get the king square if in check
  const getKingSquare = () => {
    if (!game.isCheck()) return null;
    
    const turn = game.turn();
    const kingSquare = game.board().flat().find(square => 
      square && square.type === 'k' && square.color === turn
    );
    
    if (!kingSquare) return null;
    
    // Find the square position
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = game.board()[rank][file];
        if (square === kingSquare) {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
          return files[file] + ranks[rank];
        }
      }
    }
    return null;
  };

  const kingSquare = getKingSquare();

  return (
    <div className="relative bg-muted rounded-xl p-4" data-testid="chess-board-container">
      <div className="aspect-square max-w-lg mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation={boardOrientation}
          arePremovesAllowed={false}
          boardWidth={Math.min(400, window.innerWidth - 100)}
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          customDarkSquareStyle={{
            backgroundColor: "hsl(25, 40%, 65%)",
          }}
          customLightSquareStyle={{
            backgroundColor: "hsl(35, 25%, 85%)",
          }}
          customDropSquareStyle={{
            backgroundColor: "hsl(142.1, 76.2%, 36.3%)",
            opacity: 0.6,
          }}
          customSquareStyles={{
            ...(kingSquare && {
              [kingSquare]: {
                backgroundColor: "hsl(0, 84.2%, 60.2%)",
                opacity: 0.8,
              },
            }),
          }}
          areArrowsAllowed={false}
          showBoardNotation={true}
        />
      </div>
      
      {/* Game Status Overlay */}
      {gameStatus !== "active" && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <div className="bg-card p-4 rounded-lg text-center">
            <p className="text-lg font-semibold">
              {gameStatus === "waiting" ? "Waiting for game to start..." : "Game Completed"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
