export enum ModelVersion {
  VEO2 = 'Veo 2',
  VEO3 = 'Veo 3',
}

export enum GenerationType {
  TEXT_TO_VIDEO = 'Text-to-Video',
  IMAGE_TO_VIDEO = 'Image-to-Video',
}

export enum VideoOrientation {
  HORIZONTAL = 'Horizontal (16:9)',
  VERTICAL = 'Vertical (9:16)',
}

export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface GeneratedVideo {
  id: string;
  url?: string;
  prompt: string;
  model: ModelVersion;
  type: GenerationType;
  orientation: VideoOrientation;
  timestamp: string;
  status: GenerationStatus;
  error?: string;
  thumbnail?: string;
  isSample?: boolean;
}