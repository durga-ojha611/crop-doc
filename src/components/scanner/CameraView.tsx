import { useEffect, useState, useCallback } from 'react';
import { Camera, XCircle, Image as ImageIcon, Zap, Focus, SwitchCamera, Mic, MicOff } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onFileUpload: (imageDataUrl: string) => void;
}

const CameraView = ({ onCapture, onFileUpload }: CameraViewProps) => {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, captureImage } = useCamera();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showVoiceFeedback, setShowVoiceFeedback] = useState(false);
  const { toast } = useToast();

  const handleCapture = useCallback(() => {
    if (!isStreaming || isCapturing) return;

    setIsCapturing(true);
    setShowFlash(true);

    // Flash effect
    setTimeout(() => setShowFlash(false), 150);

    // Capture after brief delay for feedback
    setTimeout(() => {
      const imageData = captureImage();
      if (imageData) {
        onCapture(imageData);
      }
      setIsCapturing(false);
    }, 200);
  }, [isStreaming, isCapturing, captureImage, onCapture]);

  const handleVoiceCommand = useCallback((command: string) => {
    setShowVoiceFeedback(true);
    setTimeout(() => setShowVoiceFeedback(false), 1000);

    toast({
      title: "Voice Command",
      description: `Detected: "${command.trim()}"`,
      duration: 1500,
    });

    handleCapture();
  }, [handleCapture, toast]);

  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onCommand: handleVoiceCommand,
    triggerWords: ['scan', 'capture', 'photo', 'click', 'take', 'shoot', 'snap'],
  });

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopListening();
    };
  }, [startCamera, stopCamera, stopListening]);

  useEffect(() => {
    if (voiceEnabled && isSpeechSupported) {
      startListening();
    } else {
      stopListening();
    }
  }, [voiceEnabled, isSpeechSupported, startListening, stopListening]);

  const toggleVoice = () => {
    if (!isSpeechSupported) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser",
        variant: "destructive",
      });
      return;
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // 1. Check File Size
      const MIN_FILE_SIZE = 10 * 1024; // 10KB
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

      if (file.size < MIN_FILE_SIZE) {
        toast({
          title: "Image too small",
          description: "Please upload an image larger than 10KB for better results.",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Image too large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // 2. Check Dimensions
      const MIN_DIMENSION = 200;
      const img = new Image();
      img.onload = () => {
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          toast({
            title: "Low Resolution",
            description: `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          resolve(true); // Valid
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        toast({
          title: "Invalid Image",
          description: "Could not read the image file.",
          variant: "destructive",
        });
        resolve(false);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate before processing
      const isValid = await validateImage(file);
      if (!isValid) {
        e.target.value = ''; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onFileUpload(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Flash effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Voice command feedback overlay */}
      <AnimatePresence>
        {showVoiceFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="bg-primary/90 backdrop-blur-md rounded-full p-6">
              <Mic className="w-12 h-12 text-primary-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced scanning overlay */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Vignette effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />

            {/* Scan frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-72 h-72">
                {/* Animated corners */}
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0"
                >
                  {/* Top-left */}
                  <div className="absolute -top-1 -left-1 w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  {/* Top-right */}
                  <div className="absolute -top-1 -right-1 w-16 h-16">
                    <div className="absolute top-0 right-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  {/* Bottom-left */}
                  <div className="absolute -bottom-1 -left-1 w-16 h-16">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute bottom-0 left-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  {/* Bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-16 h-16">
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute bottom-0 right-0 w-1 h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                </motion.div>

                {/* Cross-hair center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Focus className="w-8 h-8 text-primary/60" />
                  </motion.div>
                </div>

                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                  initial={{ top: 0 }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ boxShadow: '0 0 20px 4px hsl(var(--primary) / 0.5)' }}
                />
              </div>
            </div>

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-6 z-50">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <p className="text-center text-foreground font-semibold text-lg mb-2">Camera Access Denied</p>
          <p className="text-center text-muted-foreground text-sm mb-6 max-w-xs">{error}</p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={startCamera} className="gap-2">
              <SwitchCamera className="w-4 h-4" />
              Try Again
            </Button>
            
            {/* Fallback to file upload */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or</span>
              </div>
            </div>
            
            <label className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium">
              <ImageIcon className="w-4 h-4" />
              Upload from Device
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Top bar with hints and voice control */}
      {isStreaming && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 p-4"
        >
          <div className="flex items-center justify-between">
            {/* Voice control toggle */}
            <motion.button
              onClick={toggleVoice}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border transition-all ${voiceEnabled
                ? 'bg-primary/80 border-primary text-primary-foreground'
                : 'bg-black/60 border-white/10 text-white/90'
                }`}
            >
              {voiceEnabled ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Mic className="w-4 h-4" />
                  </motion.div>
                  <span className="text-xs font-medium">Voice ON</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Voice</span>
                </>
              )}
            </motion.button>

            {/* Hint */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-white/90 text-sm font-medium">
                Position leaf in frame
              </span>
            </div>

            {/* Spacer for balance */}
            <div className="w-20" />
          </div>

          {/* Voice listening indicator */}
          <AnimatePresence>
            {voiceEnabled && isListening && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-center mt-3"
              >
                <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30">
                  <div className="flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{ height: [8, 16, 8] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-primary text-xs font-medium">
                    Say "scan" or "capture"
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript display */}
          <AnimatePresence>
            {voiceEnabled && transcript && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mt-2"
              >
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <p className="text-white/70 text-xs italic">"{transcript}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-center gap-8 px-6">
          {/* Gallery upload */}
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="touch-target w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer border border-white/20 hover:bg-white/20 transition-colors"
          >
            <ImageIcon className="w-6 h-6 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.label>

          {/* Capture button */}
          <motion.button
            onClick={handleCapture}
            disabled={!isStreaming || isCapturing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="touch-target relative w-20 h-20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Take photo"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white" />

            {/* Inner circle */}
            <motion.div
              className="absolute inset-2 rounded-full bg-white"
              animate={isCapturing ? { scale: 0.8 } : { scale: 1 }}
            />

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.button>

          {/* Voice button for quick access */}
          <motion.button
            onClick={toggleVoice}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`touch-target w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${voiceEnabled
              ? 'bg-primary/80 border-primary'
              : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
          >
            {voiceEnabled ? (
              <Mic className="w-6 h-6 text-primary-foreground" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </div>

        {/* Quick tip */}
        <div className="flex flex-col items-center mt-4 space-y-[2px]">
          <p className="text-center text-white/50 text-xs">
            {voiceEnabled
              ? 'Say "scan" or "capture" • Tap to scan'
              : 'Tap to scan • Enable voice for hands-free'
            }
          </p>
          <p className="text-xs text-white/50 font-medium">
            Max 10MB • Min 10KB
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraView;