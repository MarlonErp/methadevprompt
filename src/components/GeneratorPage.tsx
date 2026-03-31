import React, { useState } from 'react';
import { Wand2, Settings2, Code2, BookOpen, Database, Cloud, Bot, Globe, Layers, Sparkles } from 'lucide-react';
import type { PromptConfig, Category, Tone, OutputFormat } from '../types';
import { usePrompts } from '../contexts/PromptsContext';
import { PromptResult } from './PromptResult';

const categories: { value: Category; label: string; icon: React.ReactNode }[] = [
  { value: 'frontend', label: 'Frontend', icon: <Code2 size={16} /> },
  { value: 'backend', label: 'Backend', icon: <Settings2 size={16} /> },
  { value: 'fullstack', label: 'Fullstack', icon: <Layers size={16} /> },
  { value: 'mobile', label: 'Mobile', icon: <Globe size={16} /> },
  { value: 'ui-ux', label: 'UI/UX', icon: <Sparkles size={16} /> },
  { value: 'database', label: 'Banco de Dados', icon: <Database size={16} /> },
  { value: 'devops', label: 'DevOps', icon: <Cloud size={16} /> },
  { value: 'ai-ml', label: 'IA & ML', icon: <Bot size={16} /> },
  { value: 'api', label: 'API', icon: <Globe size={16} /> },
  { value: 'general', label: 'Geral', icon: <BookOpen size={16} /> },
];

const tones: { value: Tone; label: string; desc: string }[] = [
  { value: 'technical', label: 'Técnico', desc: 'Terminologia precisa' },
  { value: 'didactic', label: 'Didático', desc: 'Explicativo e claro' },
  { value: 'concise', label: 'Conciso', desc: 'Direto ao ponto' },
  { value: 'detailed', label: 'Detalhado', desc: 'Abrangente e completo' },
];

const formats: { value: OutputFormat; label: string }[] = [
  { value: 'structured', label: 'Estruturado' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'code', label: 'Focado em Código' },
  { value: 'plain', label: 'Texto Simples' },
];

const defaultConfig: PromptConfig = {
  category: 'frontend',
  description: '',
  tone: 'technical',
  outputFormat: 'structured',
  includeExamples: true,
  includeConstraints: false,
  context: '',
  techStack: '',
};

export function GeneratorPage() {
  const { generate, isGenerating, currentPrompt, error } = usePrompts();
  const [config, setConfig] = useState<PromptConfig>(defaultConfig);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.description.trim()) return;
    await generate(config);
  };

  const update = <K extends keyof PromptConfig>(key: K, value: PromptConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="generator-layout">
      <div className="generator-form-col">
        <div className="section-header">
          <Wand2 size={20} />
          <h2>Configurar Prompt</h2>
        </div>

        <form id="generator-form" onSubmit={handleSubmit} className="gen-form">
          {/* Description */}
          <div className="field-group">
            <label className="field-label">
              O que você precisa? <span className="required">*</span>
            </label>
            <textarea
              id="description-input"
              className="field-textarea"
              placeholder="Ex: Criar um componente React de tabela com paginação, filtros e ordenação..."
              value={config.description}
              onChange={e => update('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Category */}
          <div className="field-group">
            <label className="field-label">Categoria</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  id={`cat-${cat.value}`}
                  className={`cat-chip ${config.category === cat.value ? 'active' : ''}`}
                  onClick={() => update('category', cat.value)}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="field-group">
            <label className="field-label">Tom</label>
            <div className="tone-grid">
              {tones.map(tone => (
                <button
                  key={tone.value}
                  type="button"
                  id={`tone-${tone.value}`}
                  className={`tone-card ${config.tone === tone.value ? 'active' : ''}`}
                  onClick={() => update('tone', tone.value)}
                >
                  <span className="tone-label">{tone.label}</span>
                  <span className="tone-desc">{tone.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="field-group">
            <label className="field-label">Formato de Saída</label>
            <div className="format-grid">
              {formats.map(fmt => (
                <button
                  key={fmt.value}
                  type="button"
                  id={`fmt-${fmt.value}`}
                  className={`fmt-chip ${config.outputFormat === fmt.value ? 'active' : ''}`}
                  onClick={() => update('outputFormat', fmt.value)}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="toggle-row">
            <label className="toggle-item" htmlFor="include-examples">
              <input
                id="include-examples"
                type="checkbox"
                checked={config.includeExamples}
                onChange={e => update('includeExamples', e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-text">Incluir exemplos</span>
            </label>
            <label className="toggle-item" htmlFor="include-constraints">
              <input
                id="include-constraints"
                type="checkbox"
                checked={config.includeConstraints}
                onChange={e => update('includeConstraints', e.target.checked)}
              />
              <span className="toggle-track" />
              <span className="toggle-text">Incluir restrições</span>
            </label>
          </div>

          {/* Advanced */}
          <button
            type="button"
            id="advanced-toggle"
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Configurações avançadas {showAdvanced ? '▲' : '▼'}
          </button>

          {showAdvanced && (
            <div className="advanced-section">
              <div className="field-group">
                <label className="field-label">Contexto adicional</label>
                <textarea
                  id="context-input"
                  className="field-textarea"
                  placeholder="Ex: Projeto legado com React 16, sem hooks..."
                  value={config.context}
                  onChange={e => update('context', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Stack tecnológica</label>
                <input
                  id="techstack-input"
                  type="text"
                  className="field-input"
                  placeholder="Ex: React, TypeScript, Tailwind, Prisma, PostgreSQL"
                  value={config.techStack}
                  onChange={e => update('techStack', e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            id="generate-btn"
            type="submit"
            className="generate-btn"
            disabled={isGenerating || !config.description.trim()}
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner" />
                Gerando prompt...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Gerar Prompt
              </>
            )}
          </button>
        </form>
      </div>

      <div className="generator-result-col">
        <PromptResult config={config} />
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>
    </div>
  );
}
