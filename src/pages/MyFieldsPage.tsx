import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { usePlots } from '@/hooks/usePlots';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Sprout, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyFieldsPage = () => {
  const { user } = useAuth();
  const { plots, fetchPlots, isLoading, createPlot, deletePlot } = usePlots();
  const navigate = useNavigate();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [newPlotCrop, setNewPlotCrop] = useState('');
  const [plotLocation, setPlotLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [plotToDelete, setPlotToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPlots();
    }
  }, [user, fetchPlots]);

  const handleAddPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotName || !newPlotCrop) return;
    await createPlot({ 
      name: newPlotName, 
      cropType: newPlotCrop,
      location: plotLocation ? { ...plotLocation, label: 'GPS Location' } : undefined
    });
    setIsAddOpen(false);
    setNewPlotName('');
    setNewPlotCrop('');
    setPlotLocation(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPlotLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
        toast.success("Location captured successfully!");
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error("Failed to get location: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Sign in to track your fields</h2>
          <p className="text-muted-foreground">Keep a history of your crops, treatments, and expenses across all your plots.</p>
          <Button onClick={() => navigate('/auth')} className="w-full max-w-sm mt-4">Sign In</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 pb-24 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Fields</h1>
          <Button onClick={() => setIsAddOpen(true)} size="sm" className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" /> Add Field
          </Button>
        </div>

        {isAddOpen && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6 space-y-4"
            onSubmit={handleAddPlot}
          >
            <h3 className="font-semibold text-lg">New Field</h3>
            <input 
              type="text" 
              placeholder="Field Name (e.g. North Plot)"
              value={newPlotName}
              onChange={e => setNewPlotName(e.target.value)}
              className="w-full p-3 rounded-xl border border-input bg-background"
              required
            />
            <input 
              type="text" 
              placeholder="Crop Type (e.g. Wheat)"
              value={newPlotCrop}
              onChange={e => setNewPlotCrop(e.target.value)}
              className="w-full p-3 rounded-xl border border-input bg-background"
              required
            />
            <Button 
              type="button" 
              variant={plotLocation ? "default" : "outline"}
              className="w-full flex items-center gap-2"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
            >
              <MapPin className="w-4 h-4" />
              {isGettingLocation ? "Getting location..." : plotLocation ? "Location Captured ✓" : "Use my current location"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Adding location enables hyperlocal weather alerts like "rain expected in 2 hours".
            </p>
            <div className="flex gap-3 mt-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="w-full">Create</Button>
            </div>
          </motion.form>
        )}

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : plots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border-2 border-dashed rounded-2xl border-muted">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Sprout className="w-8 h-8 opacity-50" />
            </div>
            <div>
              <p className="font-medium text-lg">No fields yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first field to start tracking history</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-2">
              <Plus className="w-4 h-4 mr-2" /> Add your first field
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {plots.map(plot => (
                <motion.div
                  key={plot._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div 
                    onClick={() => navigate(`/plots/${plot._id}`)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setPlotToDelete(plot._id === plotToDelete ? null : plot._id);
                    }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Sprout className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{plot.name}</h3>
                          <p className="text-sm text-muted-foreground">{plot.cropType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {plotToDelete === plot._id && (
                            <motion.button 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePlot(plot._id);
                              }}
                              className="p-2 text-destructive hover:text-white hover:bg-destructive rounded-lg transition-colors"
                              aria-label="Delete field"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
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

export default MyFieldsPage;
