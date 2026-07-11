import { Home, MessageCircle, User, Camera, Calendar, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
  { icon: Camera, label: 'Scan', path: '/scan' },
  { icon: MessageCircle, label: 'Community', path: '/community' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-safe transition-all">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isScan = item.path === '/scan';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "touch-target flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-2xl transition-all duration-300 active:scale-95",
                isScan && "relative -mt-10",
                isActive && !isScan && "text-primary",
                !isActive && !isScan && "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              {isScan ? (
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 transition-all duration-300 border-4 border-background",
                  isActive
                    ? "bg-gradient-to-br from-primary to-green-600 text-white scale-110"
                    : "bg-primary text-white hover:bg-primary/90"
                )}>
                  <Icon className="w-7 h-7" />
                </div>
              ) : (
                <Icon className={cn("w-6 h-6 transition-transform duration-300", isActive && "scale-110")} />
              )}
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-all duration-300",
                isScan && "mt-1",
                isActive ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0.5"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
