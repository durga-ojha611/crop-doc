import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { usePlots } from '@/hooks/usePlots';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sprout, TrendingUp, TrendingDown, Camera, CheckCircle2, Clock, X, Pencil, Trash2 } from 'lucide-react';
import { useFarmLogs } from '@/hooks/useFarmLogs';
import { useAlerts } from '@/hooks/useAlerts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRef } from 'react';
import { AlertTriangle, CloudRain, Wind, ThermometerSnowflake, Bell } from 'lucide-react';

const PlotDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plots, getTimeline, fetchPlots } = usePlots();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { alerts, fetchAlerts, markAsRead } = useAlerts(id);

  const { createLog, updateLog, deleteLog } = useFarmLogs();
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logType, setLogType] = useState<'expense' | 'yield'>('expense');
  const [logCategory, setLogCategory] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [logNote, setLogNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeActionLogId, setActiveActionLogId] = useState<string | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (id: string, type: string) => {
    if (type !== 'expense' && type !== 'yield') return;
    pressTimer.current = setTimeout(() => {
      setActiveActionLogId(prevId => prevId === id ? null : id);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500); // 500ms long press
  };

  const handlePointerUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteLog(logId);
      toast.success('Log deleted successfully');
      setTimeline(prev => prev.filter(t => t._id !== logId));
      setActiveActionLogId(null);
      // Recalculate profitability by fetching if needed, or rely on existing state logic
      const data = await getTimeline(id!);
      setTimeline(data);
    } catch (err) {
      toast.error('Failed to delete log');
    }
  };

  const handleEditClick = (event: any) => {
    setLogType(event.type);
    setLogCategory(event.data.category || '');
    setLogAmount(event.data.amount?.toString() || '');
    setLogNote(event.data.note || '');
    setEditingLogId(event.data._id);
    setIsAddLogOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setIsAddLogOpen(false);
    setEditingLogId(null);
    setLogCategory('');
    setLogAmount('');
    setLogNote('');
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logCategory || !logAmount || !id) return;
    
    setIsSubmitting(true);
    try {
      if (editingLogId) {
        await updateLog(editingLogId, {
          type: logType,
          category: logCategory,
          amount: Number(logAmount),
          note: logNote
        });
        toast.success('Log updated successfully');
      } else {
        await createLog({
          plotId: id,
          type: logType,
          category: logCategory,
          amount: Number(logAmount),
          date: new Date().toISOString(),
          note: logNote
        });
        toast.success('Log added successfully');
      }
      
      const data = await getTimeline(id);
      setTimeline(data);
      
      handleCancelForm();
    } catch (error) {
      toast.error(editingLogId ? 'Failed to update log' : 'Failed to add log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const plot = plots.find(p => p._id === id);

  useEffect(() => {
    if (user && id) {
      if (plots.length === 0) {
        fetchPlots();
      }
      getTimeline(id).then(data => {
        setTimeline(data);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
      fetchAlerts();
    }
  }, [user, id, fetchPlots, plots.length, fetchAlerts]);

  if (!user || !plot) {
    return (
      <AppLayout>
        <div className="p-8 text-center">Loading plot...</div>
      </AppLayout>
    );
  }

  // Calculate profitability
  const totalExpense = timeline.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.data.amount || 0), 0);
  const totalYield = timeline.filter(t => t.type === 'yield').reduce((acc, t) => acc + (t.data.amount || 0), 0);

  return (
    <AppLayout>
      <div className="p-4 pb-24 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/fields')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{plot.name}</h1>
        </div>

        {/* Plot Info & Profitability Widget */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Sprout className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{plot.cropType}</p>
                <p className="text-sm text-muted-foreground">
                  Planted: {plot.plantingDate ? new Date(plot.plantingDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <h3 className="text-sm font-bold text-foreground">Financial Tracking (Farm Logs)</h3>
            <p className="text-xs text-muted-foreground">Track your expenses and yield value over time.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Expenses</p>
              <p className="font-bold text-destructive flex items-center justify-center gap-1">
                <TrendingDown className="w-4 h-4" /> ${totalExpense}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yield Value</p>
              <p className="font-bold text-success flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" /> ${totalYield}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Farm Timeline & History</h2>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => isAddLogOpen ? handleCancelForm() : setIsAddLogOpen(true)}>
            {isAddLogOpen ? 'Cancel' : 'Add Log'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Contextualizing Crop Scans and treatments in one place.</p>
        
        <AnimatePresence>
          {isAddLogOpen && (
            <motion.form 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-card p-4 rounded-xl border border-border shadow-sm overflow-hidden"
              onSubmit={handleAddLog}
            >
              <div className="flex gap-2 mb-4">
                <Button 
                  type="button" 
                  variant={logType === 'expense' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setLogType('expense')}
                >
                  <TrendingDown className="w-4 h-4 mr-2" /> Expense
                </Button>
                <Button 
                  type="button" 
                  variant={logType === 'yield' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setLogType('yield')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" /> Yield
                </Button>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder={logType === 'expense' ? "Category (e.g. Fertilizer)" : "Category (e.g. Wheat Harvest)"}
                  value={logCategory}
                  onChange={e => setLogCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-input bg-background"
                  required
                />
                <input 
                  type="number" 
                  placeholder={logType === 'expense' ? "Amount ($)" : "Estimated Value ($)"}
                  value={logAmount}
                  onChange={e => setLogAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-input bg-background"
                  required
                  min="0"
                  step="0.01"
                />
                <input 
                  type="text" 
                  placeholder="Note (optional)"
                  value={logNote}
                  onChange={e => setLogNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-input bg-background"
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Log'}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        {/* Timeline */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {isLoading ? (
            <p className="text-center py-4">Loading timeline...</p>
          ) : timeline.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground relative z-10 bg-background w-max mx-auto px-4 rounded-full border border-border">
              No history recorded yet
            </p>
          ) : (
            timeline.map((event, index) => (
              <div key={event._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-card text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {event.type === 'scan' ? <Camera className="w-4 h-4 text-blue-500" /> :
                    event.type === 'expense' ? <TrendingDown className="w-4 h-4 text-destructive" /> :
                      event.type === 'yield' ? <TrendingUp className="w-4 h-4 text-success" /> :
                        <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                {/* Card */}
                <div 
                  className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-card shadow-sm relative overflow-hidden select-none"
                  onPointerDown={() => handlePointerDown(event._id, event.type)}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onContextMenu={(e) => {
                    if (event.type === 'expense' || event.type === 'yield') {
                      e.preventDefault(); // Prevent default context menu to allow our long press
                    }
                  }}
                  style={{ touchAction: 'pan-y' }}
                >
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-foreground">{event.title}</div>
                    <time className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="text-sm text-muted-foreground pr-2">{event.description}</div>
                  </div>

                  {/* Long press overlay */}
                  <AnimatePresence>
                    {activeActionLogId === event._id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center gap-2 z-20"
                        onContextMenu={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); setActiveActionLogId(null); }}
                      >
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setActiveActionLogId(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(event); setActiveActionLogId(null); }}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteLog(event._id); }}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <div className="mt-8 mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Active Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert._id} 
                  className={`p-4 rounded-xl border flex gap-3 ${
                    alert.severity === 'critical' ? 'bg-destructive/10 border-destructive/20 text-destructive-foreground' : 
                    alert.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-700' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.type === 'heavy_rain' ? <CloudRain className="w-5 h-5" /> :
                     alert.type === 'frost' ? <ThermometerSnowflake className="w-5 h-5" /> :
                     alert.type === 'high_wind' ? <Wind className="w-5 h-5" /> :
                     <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm capitalize">{alert.type.replace('_', ' ')}</p>
                    <p className="text-sm mt-0.5">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(alert._id)}
                      className="shrink-0 h-8 self-center"
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlotDetailPage;
