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

export interface IAIService {
  generateBacklog(ideaDescription: string): Promise<BacklogResult>;
}
