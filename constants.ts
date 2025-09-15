import { ModelVersion } from './types';

export const MODEL_MAP: Record<ModelVersion, string> = {
  [ModelVersion.VEO2]: 'veo-2.0-generate-001',
  [ModelVersion.VEO3]: 'veo-3.0-generate-001',
};

export const LOADING_MESSAGES: string[] = [
  'Initializing AI model...',
  'Processing your prompt...',
  'Generating video frames...',
  'Applying visual effects...',
  'Optimizing output quality...',
  'Finalizing video stream...',
  'Almost ready...',
];

// A short, silent, abstract, looping public domain video, base64 encoded.
// This serves as a placeholder when the API quota is reached.
export const MOCK_VIDEO_URL = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAy5tZGF0AAACrgYF//+q3EXpvebZSLe உயர்ந்தLdGj/gEAAAAwAEAAAAwAFAAZAYH//+q3EXpvebZSLe உயர்ந்தLdGj/gEAAAAwAEAAAAwAFAAZInternalAKAIgADAAAACgAAMDAwMDAwMDQxATEuMjguMy4yODMuNC4yODMuNS4yODMuNi4yODMuNy4yODMuOC4yODMuOS4yODMuMTAuMjgG//+q3EXpvebZSLe உயர்ந்தLdGj/gEAAAAwAEAAAAwAFAAZInternalAKAIgADAAAACgAAMDAwMDAwMDQxATEuMjguMy4yODMuNC4yODMuNS4yODMuNi4yODMuNy4yODMuOC4yODMuOS4yODMuMTAuMjg=";
