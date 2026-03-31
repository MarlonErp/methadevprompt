import { GoogleGenerativeAI } from '@google/generative-ai';
import type { PromptConfig } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function generatePrompt(config: PromptConfig): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

  const result = await model.generateContent({
    systemInstruction,
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
  });

  return result.response.text();
}

export async function generateTitle(description: string, prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `Com base na descrição "${description}" e no prompt gerado abaixo, crie um título curto (máximo 6 palavras) em português para salvar este prompt.
        
Prompt: ${prompt.substring(0, 300)}...

Responda APENAS com o título, sem pontuação final.`
      }]
    }]
  });

  return result.response.text().trim();
}

export async function suggestTags(description: string, category: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `Para o seguinte prompt de ${category}: "${description}"
        
Sugira de 3 a 5 tags relevantes em português (palavras-chave simples).
Responda APENAS com as tags separadas por vírgula, sem espaços extras.
Exemplo: react,componentes,hooks,typescript`
      }]
    }]
  });

  return result.response.text().trim().split(',').map(t => t.trim()).filter(Boolean);
}
