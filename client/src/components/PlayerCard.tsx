import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PlayerCardProps {
  name: string;
  avatar?: string;
  isBot?: boolean;
  isCurrentPlayer?: boolean;
  color: "white" | "black";
  difficulty?: string;
}

export default function PlayerCard({ 
  name, 
  avatar, 
  isBot = false, 
  isCurrentPlayer = false, 
  color,
  difficulty 
}: PlayerCardProps) {
  const pieceIcon = color === "white" ? "♔" : "♛";
  
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
        isCurrentPlayer 
          ? "bg-primary/10 border-primary/20" 
          : "bg-muted border-border"
      }`}
      data-testid={`player-card-${color}`}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="w-8 h-8">
          {isBot ? (
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-semibold">🤖</span>
            </div>
          ) : (
            <>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </>
          )}
        </Avatar>
        <div>
          <div className="font-medium text-sm" data-testid={`text-player-name-${color}`}>
            {name}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {isBot && difficulty ? `${difficulty} Bot` : color}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-lg" data-testid={`text-piece-icon-${color}`}>
          {pieceIcon}
        </div>
        {isCurrentPlayer && (
          <Badge variant="secondary" className="text-xs" data-testid={`badge-current-turn-${color}`}>
            Turn
          </Badge>
        )}
      </div>
    </div>
  );
}
