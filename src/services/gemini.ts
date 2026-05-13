import type { PromptConfig } from '../types';

// NOTE: For security we no longer call the Google Generative API directly from
// the browser. This module calls a local backend proxy at /api/gemini which
// must be implemented server-side and authenticate using a Service Account.
// See server/gemini-proxy.js added to the repository for an example.

// gemini-1.5-flash tem cotas mais generosas no plano gratuito
const PRIMARY_MODEL = 'gemini-1.5-flash';

const categoryDescriptions: Record<string, string> = {
  frontend: 'desenvolvimento frontend (HTML, CSS, JavaScript, React, Vue, Angular)',
  backend: 'desenvolvimento backend (Node.js, Python, Java, APIs REST)',
  fullstack: 'desenvolvimento fullstack (frontend + backend integrados)',
  mobile: 'desenvolvimento mobile (React Native, Flutter, iOS, Android)',
  'ui-ux': 'design de UI/UX, prototipagem, acessibilidade e experiência do usuário',
  database: 'banco de dados, modelagem, queries SQL/NoSQL, otimização',
  devops: 'DevOps, CI/CD, containers, cloud infrastructure, automação',
  'ai-ml': 'Inteligência Artificial e Machine Learning, modelos, datasets',
  api: 'design e integração de APIs, REST, GraphQL, autenticação',
  general: 'desenvolvimento de software em geral',
};

const toneDescriptions: Record<string, string> = {
  technical: 'altamente técnico, usando terminologia precisa para desenvolvedores experientes',
  didactic: 'didático, explicativo, adequado para quem está aprendendo',
  concise: 'conciso e direto ao ponto, sem explicações desnecessárias',
  detailed: 'detalhado e abrangente, cobrindo todos os aspectos relevantes',
};

const formatDescriptions: Record<string, string> = {
  markdown: 'use formatação Markdown com cabeçalhos, listas e blocos de código',
  plain: 'texto simples sem formatação especial',
  code: 'foque em exemplos de código, com comentários explicativos',
  structured: 'estrutura clara com seções definidas: objetivo, contexto, tarefa, restrições, saída esperada',
};

/** Espera N milissegundos */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper com retry e tratamento de quota excedida.
 * Tenta até 2 vezes com espera exponencial antes de lançar erro amigável.
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);

      // Quota excedida (429) — não adianta tentar de novo imediatamente
      if (message.includes('429') || message.toLowerCase().includes('quota')) {
        throw new Error(
          'Cota da API Gemini esgotada. Por favor:\n' +
          '1. Aguarde alguns minutos e tente novamente, ou\n' +
          '2. Acesse https://aistudio.google.com/app/apikey para gerar uma nova chave de API, ou\n' +
          '3. Verifique seu plano em https://ai.google.dev/gemini-api/docs/rate-limits'
        );
      }

      // Para outros erros, faz backoff antes de tentar novamente
      if (attempt < maxRetries) {
        const waitMs = 1000 * Math.pow(2, attempt);
        console.warn(`[Gemini] Tentativa ${attempt + 1} falhou. Aguardando ${waitMs}ms...`, message);
        await sleep(waitMs);
      }
    }
  }
  throw lastError;
}

export async function generatePrompt(config: PromptConfig): Promise<string> {
  const modelName = PRIMARY_MODEL;

  const systemInstruction = `Você é um especialista em engenharia de prompts para desenvolvimento de software. 
Sua tarefa é criar prompts otimizados e precisos para uso com modelos de IA no contexto de ${categoryDescriptions[config.category]}.

Crie um prompt que seja:
- Tom: ${toneDescriptions[config.tone]}
- Formato de saída: ${formatDescriptions[config.outputFormat]}
${config.includeExamples ? '- Inclua exemplos práticos e concretos no prompt' : ''}
${config.includeConstraints ? '- Inclua restrições e limites claros no prompt' : ''}

O prompt gerado deve ser diretamente utilizável em um modelo de IA para obter a melhor resposta possível.
Responda APENAS com o prompt gerado, sem explicações ou prefácios.`;

  const userMessage = `Crie um prompt otimizado para: ${config.description}
${config.context ? `\nContexto adicional: ${config.context}` : ''}
${config.techStack ? `\nStack tecnológica: ${config.techStack}` : ''}`;

  return callWithRetry(async () => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, request: { systemInstruction, contents: [{ role: 'user', parts: [{ text: userMessage }] }] } }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`[Gemini proxy] ${res.status} ${t}`);
    }
    const data = await res.json();
    return data.generatedText;
  });
}

export async function generateTitle(description: string, prompt: string): Promise<string> {
  const modelName = PRIMARY_MODEL;

  return callWithRetry(async () => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, request: { contents: [{ role: 'user', parts: [{ text: `Com base na descrição "${description}" e no prompt gerado abaixo, crie um título curto (máximo 6 palavras) em português para salvar este prompt.\n        \nPrompt: ${prompt.substring(0, 300)}...\n\nResponda APENAS com o título, sem pontuação final.` }] }] } }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`[Gemini proxy] ${res.status} ${t}`);
    }
    const data = await res.json();
    return data.generatedText.trim();
  });
}

export async function suggestTags(description: string, category: string): Promise<string[]> {
  const modelName = PRIMARY_MODEL;

  return callWithRetry(async () => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, request: { contents: [{ role: 'user', parts: [{ text: `Para o seguinte prompt de ${category}: "${description}"\n        \nSugira de 3 a 5 tags relevantes em português (palavras-chave simples).\nResponda APENAS com as tags separadas por vírgula, sem espaços extras.\nExemplo: react,componentes,hooks,typescript` }] }] } }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`[Gemini proxy] ${res.status} ${t}`);
    }
    const data = await res.json();
    return data.generatedText.trim().split(',').map(t => t.trim()).filter(Boolean);
  });
}
