export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  complexityTokens: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  stories: UserStory[];
}

export interface BacklogResult {
  vision: string;
  epics: Epic[];
  totalTokens: number;
  estimatedHours: {
    min: number;
    max: number;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiError {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

