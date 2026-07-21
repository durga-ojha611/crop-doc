import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, AlertTriangle, CloudRain, Wind, ThermometerSnowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alerts, fetchAlerts, markAsRead, isLoading } = useAlerts();

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user, fetchAlerts]);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Sign in to view alerts</h2>
          <p className="text-muted-foreground">Get notified about critical weather changes for your plots.</p>
          <Button onClick={() => navigate('/auth')} className="w-full max-w-sm mt-4">Sign In</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 pb-24 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Weather Alerts</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border-2 border-dashed rounded-2xl border-muted">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 opacity-50" />
            </div>
            <div>
              <p className="font-medium text-lg">No active alerts</p>
              <p className="text-sm text-muted-foreground mt-1">You'll be notified here if severe weather is detected.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div 
                    className={`p-4 rounded-xl border flex gap-3 ${
                      !alert.isRead ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                    } ${
                      alert.severity === 'critical' ? 'bg-destructive/10 border-destructive/20 text-destructive-foreground' : 
                      alert.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-700' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {alert.type === 'heavy_rain' ? <CloudRain className="w-6 h-6" /> :
                       alert.type === 'frost' ? <ThermometerSnowflake className="w-6 h-6" /> :
                       alert.type === 'high_wind' ? <Wind className="w-6 h-6" /> :
                       <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-base capitalize">{alert.type.replace('_', ' ')}</p>
                        <p className="text-xs opacity-70">
                          {new Date(alert.triggeredAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto font-semibold"
                          onClick={() => navigate(`/plots/${alert.plotId}`)}
                        >
                          View Plot Details
                        </Button>
                        {!alert.isRead && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => markAsRead(alert._id)}
                            className="h-7 text-xs"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AlertsPage;
