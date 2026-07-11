import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CameraView from '@/components/scanner/CameraView';
import AnalyzingView from '@/components/scanner/AnalyzingView';
import ResultCard from '@/components/scanner/ResultCard';
import CropAssistant from '@/components/scanner/CropAssistant';
import { useDiagnosis } from '@/hooks/useDiagnosis';
import { usePlantModel } from '@/hooks/usePlantModel';
import { useScans } from '@/hooks/useScans';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { usePlots } from '@/hooks/usePlots';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, Cloud, WifiOff, Sparkles, Loader2, CloudSun, Thermometer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeather } from '@/hooks/useWeather';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type ScanState = 'camera' | 'analyzing' | 'result';

const ScanPage = () => {
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isAnalyzing, result, error: diagnosisError, analyzeImage, clearResult, usingGemini } = useDiagnosis();
  const { isLoading: isModelLoading, isReady: isModelReady, error: modelError, loadProgress, retry } = usePlantModel();
  const { uploadImage, saveScan } = useScans();
  const { isOnline, addPendingScan } = useOfflineSync();
  const { user } = useAuth();
  const { weather } = useWeather();
  const { plots, fetchPlots } = usePlots();
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');

  useEffect(() => {
    if (user && scanState === 'result') {
      fetchPlots();
    }
  }, [user, scanState]);

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setScanState('analyzing');

    // Format weather context if available
    let weatherContextString = undefined;
    if (weather) {
      weatherContextString = `Temperature: ${weather.temperature}°C, Humidity: ${weather.humidity}%, Condition: ${weather.isRaining ? 'Raining' : 'Clear/Cloudy'}`;
    }

    await analyzeImage(imageDataUrl, undefined, weatherContextString);
    setScanState('result');
  };

  // Save scan to cloud when result is available and user is logged in
  const handleSaveToCloud = async () => {
    if (!result || !capturedImage || !user) return;

    setIsSaving(true);

    try {
      // If offline, save to pending queue
      if (!isOnline) {
        addPendingScan({
          imageDataUrl: capturedImage,
          diseaseName: result.diseaseName,
          cropName: result.crop,
          confidence: result.confidence,
          plotId: selectedPlotId || undefined,
          diagnosisCandidates: result.diagnosisCandidates,
          treatmentPlan: result.treatmentPlan,
        });
        toast.success('Scan saved locally - will sync when online');
        return;
      }

      const imageUrl = await uploadImage(capturedImage);
      if (imageUrl) {
        await saveScan(
          imageUrl,
          result.diseaseName,
          result.crop,
          result.confidence,
          selectedPlotId || undefined,
          result.diagnosisCandidates,
          result.treatmentPlan
        );
        // Toast is handled in useScans now
      }
    } catch (error) {
      console.error("Failed to save scan:", error);
      // specific errors handled by useScans
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    clearResult();
    setScanState('camera');
  };

  return (
    <AppLayout hideHeader={scanState === 'camera'}>
      {/* Model loading overlay - Only show if NO Gemini key is present and model is loading */}
      <AnimatePresence>
        {isModelLoading && scanState === 'camera' && !import.meta.env.VITE_GEMINI_API_KEY && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="bg-card/50 border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center max-w-xs w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Initializing AI</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Loading the neural network for offline diagnosis...
                </p>
                <div className="w-full space-y-2">
                  <Progress value={loadProgress} className="h-3 rounded-full bg-muted" />
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Loading assets</span>
                    <span>{loadProgress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model error banner - Slide in */}
      {modelError && scanState === 'camera' && !import.meta.env.VITE_GEMINI_API_KEY && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-4 right-4 z-40"
        >
          <div className="bg-warning/10 backdrop-blur-md border border-warning/50 rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">AI unavailable</h4>
              <p className="text-xs text-muted-foreground truncate">Using demo mode for testing</p>
            </div>
            <Button variant="ghost" size="sm" onClick={retry} className="text-warning hover:text-warning hover:bg-warning/10">
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {scanState === 'camera' && (
        <div className={`h-[calc(100dvh-5rem)] ${modelError ? 'pt-12' : ''} relative`}> {/* 100dvh - header/nav space */}
          {weather && (
            <div className="absolute top-4 left-4 z-30 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-top-2">
              {weather.isRaining ? <CloudSun className="w-4 h-4 text-blue-300" /> : <Thermometer className="w-4 h-4 text-orange-300" />}
              <span className="text-xs font-medium text-white shadow-sm">
                {weather.temperature}°C • {weather.humidity}%
              </span>
            </div>
          )}
          <CameraView
            onCapture={handleCapture}
            onFileUpload={handleCapture}
          />

          {/* Model status indicator */}
          <div className="absolute top-4 right-4 z-30">
            {import.meta.env.VITE_GEMINI_API_KEY ? (
              <div className="flex items-center gap-1.5 bg-black/40 text-purple-200 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 shadow-lg">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Gemini AI
              </div>
            ) : isModelReady && !isModelLoading && (
              <div className="flex items-center gap-1.5 bg-black/40 text-green-400 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Offline Ready
              </div>
            )}
          </div>
        </div>
      )}

      {scanState === 'analyzing' && capturedImage && (
        <AnalyzingView imageUrl={capturedImage} />
      )}

      {scanState === 'result' && (
        <ScrollArea className="h-[calc(100dvh-5rem)] pb-20"> {/* dvh for mobile browser bar support */}
          {diagnosisError ? (
            <div className="flex flex-col items-center justify-center p-8 h-full space-y-4 text-center mt-10">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Analysis Failed</h3>
              <p className="text-muted-foreground max-w-md">
                {diagnosisError.includes('No crop found')
                  ? "It seems you scanned something else. Please make sure to scan a plant, crop, or natural product."
                  : diagnosisError}
              </p>
              <Button onClick={handleScanAgain} className="mt-4">
                Scan Again
              </Button>
            </div>
          ) : result ? (
            <>
              <ResultCard
                result={result}
                onScanAgain={handleScanAgain}
                onLanguageChange={async (newLang) => {
                  if (capturedImage) {
                    setScanState('analyzing');
                    // Wait a bit to show transition
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Pass the new language explicitly to avoid stale state
                    await analyzeImage(capturedImage, newLang);
                    setScanState('result');
                  }
                }}
              />

              {/* Cloud save button for logged in users */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="px-6 pb-24 safe-area-bottom space-y-4"
                >
                  {plots.length > 0 && (
                    <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <select 
                        className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 text-foreground"
                        value={selectedPlotId}
                        onChange={(e) => setSelectedPlotId(e.target.value)}
                      >
                        <option value="">(Optional) Select a field</option>
                        {plots.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    variant="default"
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                    onClick={handleSaveToCloud}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : isOnline ? (
                      <>
                        <Cloud className="w-5 h-5 mr-2" />
                        Save to History
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-5 h-5 mr-2" />
                        Save Offline
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <Button onClick={handleScanAgain}>Return to Camera</Button>
            </div>
          )}
        </ScrollArea>
      )}
    </AppLayout>
  );
};

export default ScanPage;
