import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from "@/contexts/GameContext";

export default function MoveHistory() {
  const { game } = useGame();
  const history = game.history();
  
  // Group moves by pairs (white and black)
  const movePairs: Array<{ white?: string; black?: string; number: number }> = [];
  
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6" data-testid="move-history">
      <h3 className="text-lg font-semibold mb-4">Move History</h3>
      
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {movePairs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No moves yet
            </div>
          ) : (
            movePairs.map((pair) => (
              <div 
                key={pair.number} 
                className="flex items-center justify-between text-sm"
                data-testid={`move-pair-${pair.number}`}
              >
                <span className="font-mono text-muted-foreground w-8">
                  {pair.number}.
                </span>
                <div className="flex space-x-4 flex-1 ml-2">
                  <span 
                    className="font-mono min-w-[3rem]" 
                    data-testid={`move-white-${pair.number}`}
                  >
                    {pair.white || ""}
                  </span>
                  <span 
                    className="font-mono min-w-[3rem]" 
                    data-testid={`move-black-${pair.number}`}
                  >
                    {pair.black || "..."}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
