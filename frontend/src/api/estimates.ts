import { postJson } from './http';
import type { ApiResponse, BacklogResult } from '../domain/types';

export async function createEstimate(ideaDescription: string) {
  return postJson<ApiResponse<BacklogResult>>(
    '/estimate',
    { ideaDescription },
    { timeoutMs: 65000 },
  );
}
