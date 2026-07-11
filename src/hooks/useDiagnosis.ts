import { useState, useCallback } from 'react';
import { DiagnosisResult } from '@/types/diagnosis';
import {
  predictDisease,
  parseClassName,
  isModelReady,
  PlantDiseaseClass,
  loadModel
} from '@/lib/plantDiseaseModel';
import { getRemedyForClass, getDefaultRemedy } from '@/data/diseaseRemedies';
import { analyzeWithGemini } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseDiagnosisReturn {
  isAnalyzing: boolean;
  result: DiagnosisResult | null;
  error: string | null;
  analyzeImage: (imageDataUrl: string, languageOverride?: string, weatherContext?: string) => Promise<void>;
  clearResult: () => void;
  usingGemini: boolean;
}

export const useDiagnosis = (): UseDiagnosisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Use Environment Variable for API Key
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const usingGemini = !!GEMINI_KEY;

  const analyzeImage = useCallback(async (imageDataUrl: string, languageOverride?: string, weatherContext?: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Use override if provided, otherwise fall back to context language
    const currentLanguage = languageOverride || language;

    if (usingGemini) {
      // MODE 1: Gemini API (Cloud)
      try {
        console.log(`Using Gemini AI for analysis in ${currentLanguage}...`);
        const geminiResult = await analyzeWithGemini(imageDataUrl, GEMINI_KEY, currentLanguage, weatherContext);
        setResult(geminiResult);
      } catch (err: any) {
        console.error('Gemini Error:', err);
        setError(err.message || "AI Analysis failed.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // MODE 2: TensorFlow.js (Offline/Device)
      try {
        if (!isModelReady()) {
          console.log('Model not ready, attempting to load...');
          await loadModel();
        }

        // Use real TensorFlow.js model inference
        console.log('Running TensorFlow.js inference...');
        const predictions = await predictDisease(imageDataUrl, 3);
        const topPrediction = predictions[0];
        console.log('Predictions:', predictions);

        // Confidence Threshold Check
        const CONFIDENCE_THRESHOLD = 0.40;

        if (topPrediction.confidence < CONFIDENCE_THRESHOLD) {
          console.log(`Low confidence (${topPrediction.confidence.toFixed(2)}), treating as No Crop Found`);
          const noCropResult: DiagnosisResult = {
            id: crypto.randomUUID(),
            diseaseName: 'No Crop Found',
            crop: 'Unknown',
            confidence: topPrediction.confidence,
            imageUrl: imageDataUrl,
            timestamp: new Date(),
            remedy: {
              diseaseName: 'No Crop Found',
              crop: 'Unknown',
              chemicalSolution: 'No plant detected. Please ensure the crop is clearly visible and well-lit.',
              organicSolution: 'Try moving closer to the plant and ensuring good lighting.',
              prevention: 'Scan one leaf or plant at a time for best results.',
            }
          };
          setResult(noCropResult);
        } else {
          // Parse the class name to get crop and disease
          const parsed = parseClassName(topPrediction.className);

          // Get remedy from database
          let remedy = getRemedyForClass(topPrediction.className);
          if (!remedy) {
            remedy = getDefaultRemedy(parsed.disease, parsed.crop);
          }

          const diagnosisResult: DiagnosisResult = {
            id: crypto.randomUUID(),
            diseaseName: parsed.disease,
            crop: parsed.crop,
            confidence: topPrediction.confidence,
            imageUrl: imageDataUrl,
            timestamp: new Date(),
            remedy,
          };
          setResult(diagnosisResult);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        console.error('Diagnosis error:', err);
        setError(message);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [usingGemini, GEMINI_KEY, language]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    result,
    error,
    analyzeImage,
    clearResult,
    usingGemini
  };
};
