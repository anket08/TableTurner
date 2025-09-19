import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50" data-testid="header">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">♕</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Chess Master</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-muted rounded-lg p-1" data-testid="nav-tabs">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className={location === "/" ? 
                  "bg-background text-foreground shadow-sm border border-border" : 
                  "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
                data-testid="button-play"
              >
                Play
              </Button>
            </Link>
            <Link href="/history">
              <Button
                variant={location === "/history" ? "default" : "ghost"}
                size="sm"
                className={location === "/history" ? 
                  "bg-background text-foreground shadow-sm border border-border" : 
                  "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
                data-testid="button-history"
              >
                History
              </Button>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium" data-testid="text-username">
                      {user.displayName || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex items-center space-x-1 bg-muted rounded-lg p-1" data-testid="nav-tabs-mobile">
            <Link href="/" className="flex-1">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className={`w-full ${location === "/" ? 
                  "bg-background text-foreground shadow-sm border border-border" : 
                  "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                data-testid="button-play-mobile"
              >
                Play
              </Button>
            </Link>
            <Link href="/history" className="flex-1">
              <Button
                variant={location === "/history" ? "default" : "ghost"}
                size="sm"
                className={`w-full ${location === "/history" ? 
                  "bg-background text-foreground shadow-sm border border-border" : 
                  "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                data-testid="button-history-mobile"
              >
                History
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
