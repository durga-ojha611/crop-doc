import { ThemeToggle } from '@/components/ThemeToggle';
import { Leaf, Menu, Bell, Settings as SettingsIcon, MapPin, History, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAlerts } from '@/hooks/useAlerts';
import { useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts, fetchAlerts } = useAlerts();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-tight tracking-tight">Crop-Doc</h1>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">AI Plant Doctor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button 
            onClick={() => navigate('/alerts')}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-secondary/10 hover:bg-secondary/20 text-foreground transition-all duration-200"
            aria-label="Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                {unreadCount}
              </span>
            )}
          </button>

          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="touch-target flex items-center justify-center w-9 h-9 rounded-full bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground transition-all duration-200"
                aria-label="App Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/fields')} className="gap-2 cursor-pointer">
                <MapPin className="w-4 h-4" /> My Fields
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/history')} className="gap-2 cursor-pointer">
                <History className="w-4 h-4" /> Scan History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 cursor-pointer">
                <SettingsIcon className="w-4 h-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/menu')} className="gap-2 cursor-pointer">
                <LayoutGrid className="w-4 h-4" /> More Options
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
};

export default Header;
