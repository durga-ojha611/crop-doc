import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Trash2, AlertCircle, ArrowLeft, Camera } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useScans, Scan } from '@/hooks/useScans';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getConfidenceColor, getConfidenceLevel } from '@/types/diagnosis';

const ScanCard = ({ scan, onDelete }: { scan: Scan; onDelete: (id: string) => void }) => {
  const confidenceLevel = getConfidenceLevel(scan.confidence_score);
  const confidenceColor = getConfidenceColor(scan.confidence_score);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      <div className="flex gap-3 p-3">
        {/* Image thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img 
            src={scan.image_url} 
            alt="Scan" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {scan.disease_detected.replace(/_/g, ' ')}
              </h3>
              {scan.crop_name && (
                <p className="text-sm text-muted-foreground">{scan.crop_name}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${confidenceColor}/10 text-${confidenceColor}`}>
              {confidenceLevel}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(scan.created_at), 'MMM d, yyyy')}
            </span>
            {scan.plotId && typeof scan.plotId === 'object' && scan.plotId.name && (
              <span className="flex items-center gap-1 text-primary/80 font-medium bg-primary/5 px-2 rounded-full">
                <MapPin className="w-3 h-3" />
                {scan.plotId.name}
              </span>
            )}
            {scan.geo_lat && scan.geo_long && (!scan.plotId) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Located
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(scan.id)}
          className="touch-target self-center text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scans, isLoading, deleteScan } = useScans();

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to view your scan history and sync across devices
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-border">
        <button 
          onClick={() => navigate(-1)}
          className="touch-target w-10 h-10 flex items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Scan History</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 bg-card rounded-xl border border-border">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          ) : scans.length === 0 ? (
            // Empty state
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No scans yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                Start scanning your crops to build your diagnosis history
              </p>
              <Button onClick={() => navigate('/scan')}>
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </motion.div>
          ) : (
            // Scans list
            <AnimatePresence>
              {scans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} onDelete={deleteScan} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Stats footer */}
      {scans.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{scans.length}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {scans.filter(s => s.disease_detected.toLowerCase().includes('healthy')).length}
              </p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {scans.filter(s => !s.disease_detected.toLowerCase().includes('healthy')).length}
              </p>
              <p className="text-xs text-muted-foreground">Diseased</p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HistoryPage;
