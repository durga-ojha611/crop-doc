export interface DiagnosisResult {
  id: string;
  diseaseName: string;
  crop: string;
  confidence: number;
  imageUrl: string;
  timestamp: Date;
  remedy: Remedy;
  diagnosisCandidates?: { diseaseName: string; confidence: number }[];
  treatmentPlan?: { step: string; description: string }[];
}

export interface Remedy {
  diseaseName: string;
  crop: string;
  chemicalSolution: string;
  organicSolution: string;
  prevention: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const getConfidenceLevel = (confidence: number): ConfidenceLevel => {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.5) return 'warning';
  return 'destructive';
};
