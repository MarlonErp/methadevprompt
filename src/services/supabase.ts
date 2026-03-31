import { supabase } from '../supabase';
import type { GeneratedPrompt, PromptConfig } from '../types';

const TABLE = 'prompts';

export async function savePrompt(
  userId: string,
  title: string,
  prompt: string,
  config: PromptConfig,
  tags: string[]
): Promise<string> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        user_id: userId,
        title,
        prompt,
        config,
        tags,
        is_favorite: false,
      },
    ])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getUserPrompts(userId: string): Promise<GeneratedPrompt[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map((doc: any) => ({
    id: doc.id,
    userId: doc.user_id,
    title: doc.title,
    prompt: doc.prompt,
    config: doc.config,
    tags: doc.tags,
    isFavorite: doc.is_favorite,
    createdAt: doc.created_at,
  } as GeneratedPrompt));
}

export async function toggleFavorite(promptId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_favorite: !isFavorite })
    .eq('id', promptId);

  if (error) throw error;
}

export async function deletePrompt(promptId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', promptId);

  if (error) throw error;
}

export async function updatePromptTitle(promptId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ title })
    .eq('id', promptId);

  if (error) throw error;
}

export async function ensureUserProfile(userId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email,
      last_login: new Date().toISOString()
    }, { onConflict: 'id' });
    
  if (error) {
    console.warn('Could not upsert user profile:', error);
  }
}
