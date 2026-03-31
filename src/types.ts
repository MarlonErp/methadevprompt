export type Category = 
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'ui-ux'
  | 'database'
  | 'devops'
  | 'ai-ml'
  | 'api'
  | 'general';

export type Tone = 'technical' | 'didactic' | 'concise' | 'detailed';

export type OutputFormat = 'markdown' | 'plain' | 'code' | 'structured';

export interface PromptConfig {
  category: Category;
  description: string;
  tone: Tone;
  outputFormat: OutputFormat;
  includeExamples: boolean;
  includeConstraints: boolean;
  context?: string;
  techStack?: string;
}

export interface GeneratedPrompt {
  id: string;
  title: string;
  prompt: string;
  config: PromptConfig;
  createdAt: string;
  userId: string;
  isFavorite: boolean;
  tags: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}
