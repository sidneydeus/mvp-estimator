import { postJson } from './http';
import type { ApiResponse, BacklogResult } from '../domain/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export async function createEstimate(ideaDescription: string) {
  return postJson<ApiResponse<BacklogResult>>(
    `${API_BASE_URL}/estimate`,
    { ideaDescription },
    { timeoutMs: 65000 },
  );
}
