import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosisResult, getConfidenceLevel, getConfidenceColor } from '@/types/diagnosis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Leaf,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RefreshCw,
  Share2,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Sparkles,
  ClipboardList,
  Crosshair
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import CropAssistant from './CropAssistant';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ResultCardProps {
  result: DiagnosisResult;
  onScanAgain: () => void;
  onLanguageChange?: (lang: string) => void;
}

const ResultCard = ({ result, onScanAgain, onLanguageChange }: ResultCardProps) => {
  const confidenceLevel = getConfidenceLevel(result.confidence);
  const confidenceColor = getConfidenceColor(result.confidence);
  const isHealthy = result.diseaseName.toLowerCase().includes('healthy');
  const confidencePercent = Math.round(result.confidence * 100);

  const { language, t, setLanguage, languages } = useLanguage();
  const { speak, speakSequence, stop, togglePause, isSpeaking, isPaused, isSupported } = useTextToSpeech({ language });
  const [isReadingAll, setIsReadingAll] = useState(false);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === language) return;
    setLanguage(newLang as any);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const speakText = (text: string) => {
    if (isSpeaking) {
      stop();
      return;
    }
    speak(text);
  };

  const readAllResults = () => {
    if (isReadingAll) {
      stop();
      setIsReadingAll(false);
      return;
    }

    setIsReadingAll(true);

    const texts = [
      // Intro
      `${t('result')}: ${result.crop}.`,
      // Status
      isHealthy
        ? t('healthyPlant')
        : `${t('diseaseDetected')}: ${result.diseaseName}.`,
      // Confidence
      `${t('confidenceScore')}: ${confidencePercent}%.`,
      // Chemical treatment
      `${t('chemical')}: ${result.remedy.chemicalSolution}`,
      // Organic treatment
      `${t('natural')}: ${result.remedy.organicSolution}`,
      // Prevention
      `${t('prevention')}: ${result.remedy.prevention}`,
    ];

    speakSequence(texts, () => {
      setIsReadingAll(false);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crop-Doc AI Diagnosis',
          text: `🌿 AI Scan Result\n\nCrop: ${result.crop}\nDiagnosis: ${result.diseaseName}\nConfidence: ${confidencePercent}%\n\nScanned with Crop-Doc AI`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4 safe-area-bottom pb-24"
    >
      {/* Hero Result Card */}
      <div className="relative rounded-[2rem] overflow-hidden mb-6 shadow-2xl ring-1 ring-white/10">
        <img
          src={result.imageUrl}
          alt="Scanned plant"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top Actions Row */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          {/* AI Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg"
          >
            <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide">{t('aiVerified')}</span>
          </motion.div>

          {/* Real-time Language Selector */}
          {onLanguageChange && (
            <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg p-0.5">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-8 border-none bg-transparent text-white text-xs font-medium w-[100px] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent align="end" className="w-[120px]">
                  {languages.filter(l => ['en', 'hi', 'hinglish'].includes(l.code)).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-xs font-medium">
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Result content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Status badge */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3"
          >
            <div className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-md border",
              isHealthy
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : result.diseaseName === "No Crop Found"
                  ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
            )}>
              <h3 className="text-base font-black uppercase tracking-wider">
                {isHealthy
                  ? t('healthyPlant')
                  : result.diseaseName === "No Crop Found"
                    ? t('noCropDetected')
                    : t('diseaseDetected')}
              </h3>
            </div>
          </motion.div>

          {/* Disease name & Crop */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-extrabold text-white mb-1 leading-none tracking-tight">
              {result.diseaseName}
            </h1>
            <p className="text-white/80 text-sm font-medium flex items-center gap-2">
              Detected on <span className="text-primary font-bold">{result.crop}</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* 🟢 Context-Aware AI Consultant - Placed Directly Below Image 🟢 */}
      <div className="mb-6 -mt-2">
        <CropAssistant
          diseaseName={result.diseaseName}
          cropName={result.crop}
        />
      </div>

      {/* TTS Button - Floating style */}
      {isSupported && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <Button
            onClick={readAllResults}
            variant={isReadingAll ? "default" : "outline"}
            className={cn(
              "w-full h-16 rounded-2xl gap-3 text-base font-bold transition-all shadow-sm border-2",
              isReadingAll
                ? "bg-primary text-white border-primary shadow-primary/20"
                : "bg-card hover:bg-muted border-border"
            )}
          >
            <AnimatePresence mode="wait">
              {isReadingAll ? (
                <motion.div
                  key="speaking"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-6 h-6" onClick={(e) => { e.stopPropagation(); togglePause(); }} />
                      <span>Paused - Tap to Resume</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 h-6">
                        <span className="w-1.5 h-4 bg-white rounded-full animate-[bounce_1s_infinite]" />
                        <span className="w-1.5 h-8 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]" />
                        <span className="w-1.5 h-5 bg-white rounded-full animate-[bounce_1s_infinite_0.4s]" />
                      </div>
                      <span>{t('stopReading')}</span>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Volume2 className="w-6 h-6 text-primary" />
                  <span>🔊 {t('readAloud')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      )}

      {/* Diagnosis Details Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Confidence Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-3xl p-6 border border-border shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-primary" />
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('confidenceScore')}</h3>
                <p className="text-xs text-muted-foreground">{confidenceLevel} Accuracy Match</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{confidencePercent}</span>
                <span className="text-xl font-bold text-muted-foreground">%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-muted/50 rounded-full overflow-hidden p-1 mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className={cn(
                  "h-full rounded-full relative overflow-hidden shadow-sm",
                  confidenceColor === 'success' && "bg-gradient-to-r from-green-500 to-green-400",
                  confidenceColor === 'warning' && "bg-gradient-to-r from-yellow-500 to-yellow-400",
                  confidenceColor === 'destructive' && "bg-gradient-to-r from-red-500 to-red-400"
                )}
              />
            </div>

            {/* Other Candidates (if unsure) */}
            {result.diagnosisCandidates && result.diagnosisCandidates.length > 0 && (
              <div className="mt-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Other Possibilities</p>
                <div className="space-y-2">
                  {result.diagnosisCandidates.map((candidate, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{candidate.diseaseName}</span>
                      <span className="text-xs text-muted-foreground font-bold">{Math.round(candidate.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Treatment Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Tabs defaultValue="plan" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-16 p-1.5 bg-muted/50 rounded-2xl backdrop-blur-sm">
              <TabsTrigger
                value="plan"
                className="rounded-xl h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:ring-1 ring-black/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  <span className="font-bold text-[10px]">Action Plan</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="chemical"
                className="rounded-xl h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:ring-1 ring-black/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <FlaskConical className="w-4 h-4" />
                  <span className="font-bold text-[10px]">{t('chemical')}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="organic"
                className="rounded-xl h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:ring-1 ring-black/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <Leaf className="w-4 h-4" />
                  <span className="font-bold text-[10px]">{t('natural')}</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="mt-4">
              <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm min-h-[140px] flex flex-col justify-center relative">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Step-by-Step Treatment
                </h4>
                {result.treatmentPlan && result.treatmentPlan.length > 0 ? (
                  <div className="space-y-4">
                    {result.treatmentPlan.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-1">{step.step}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific treatment plan provided.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chemical" className="mt-4">
              <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm min-h-[140px] flex flex-col justify-center relative">
                <div className="absolute top-4 right-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-primary/5 hover:bg-primary/10 text-primary"
                    onClick={() => speakText(result.remedy.chemicalSolution)}
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Recommended Action
                </h4>
                <div className="text-muted-foreground leading-relaxed">
                  <ReactMarkdown
                    components={{
                      ul: ({ node, ...props }) => <ul className="space-y-4 my-3" {...props} />,
                      li: ({ node, ...props }) => (
                        <li className="flex gap-3 items-start bg-card/50 p-4 rounded-2xl border border-border/60 shadow-sm hover:border-primary/20 transition-all group" {...props}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="flex-1 text-sm font-medium leading-relaxed text-foreground/90">{props.children}</span>
                        </li>
                      ),
                      p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({ node, ...props }) => <span className="font-bold text-primary" {...props} />
                    }}
                  >
                    {result.remedy.chemicalSolution}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organic" className="mt-4">
              <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm min-h-[140px] flex flex-col justify-center relative">
                <div className="absolute top-4 right-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-primary/5 hover:bg-primary/10 text-primary"
                    onClick={() => speakText(result.remedy.organicSolution)}
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Organic Solution
                </h4>
                <div className="text-muted-foreground leading-relaxed">
                  <ReactMarkdown
                    components={{
                      ul: ({ node, ...props }) => <ul className="space-y-4 my-3" {...props} />,
                      li: ({ node, ...props }) => (
                        <li className="flex gap-3 items-start bg-card/50 p-4 rounded-2xl border border-border/60 shadow-sm hover:border-green-500/30 transition-all group" {...props}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="flex-1 text-sm font-medium leading-relaxed text-foreground/90">{props.children}</span>
                        </li>
                      ),
                      p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({ node, ...props }) => <span className="font-bold text-green-600 dark:text-green-400" {...props} />
                    }}
                  >
                    {result.remedy.organicSolution}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Prevention Tip */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 rounded-[2rem] p-6 border border-indigo-100 dark:border-indigo-800/50"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1">{t('prevention')}</h3>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }) => <ul className="space-y-3 my-2" {...props} />,
                    li: ({ node, ...props }) => (
                      <li className="flex gap-3 items-start bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30" {...props}>
                        <ShieldCheck className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span className="flex-1 font-medium">{props.children}</span>
                      </li>
                    ),
                    strong: ({ node, ...props }) => <span className="font-bold text-indigo-700 dark:text-indigo-300" {...props} />
                  }}
                >
                  {result.remedy.prevention}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-4"
      >
        <Button
          variant="outline"
          size="lg"
          className="h-16 rounded-2xl border-2 text-base font-bold hover:bg-muted"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          {t('share')}
        </Button>
        <Button
          size="lg"
          className="h-16 rounded-2xl bg-foreground text-background hover:bg-foreground/90 text-base font-bold shadow-xl"
          onClick={onScanAgain}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {t('scanAgain')}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ResultCard;