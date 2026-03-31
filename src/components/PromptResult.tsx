import React, { useState } from 'react';
import { Copy, Check, Save, RotateCcw, Sparkles } from 'lucide-react';
import { usePrompts } from '../contexts/PromptsContext';
import type { PromptConfig } from '../types';

interface PromptResultProps {
  config: PromptConfig;
}

export function PromptResult({ config }: PromptResultProps) {
  const { currentPrompt, isSaving, save, clearCurrent, isGenerating } = usePrompts();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!currentPrompt) return;
    await navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await save(config);
  };

  if (isGenerating) {
    return (
      <div className="result-card">
        <div className="result-generating">
          <div className="generating-animation">
            <span /><span /><span />
          </div>
          <p>Gerando seu prompt otimizado...</p>
          <span className="generating-sub">A IA está analisando sua solicitação</span>
        </div>
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div className="result-card result-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <Sparkles size={40} />
          </div>
          <h3>Seu prompt aparecerá aqui</h3>
          <p>Configure os parâmetros à esquerda e clique em "Gerar Prompt" para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-card result-has-content">
      <div className="result-header">
        <h3 className="result-title">
          <Sparkles size={16} />
          Prompt Gerado
        </h3>
        <div className="result-actions">
          <button id="copy-btn" className="action-btn" onClick={handleCopy} title="Copiar">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            id="save-btn"
            className="action-btn action-btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <span className="btn-spinner small" /> : <Save size={16} />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button id="clear-btn" className="action-btn action-btn-ghost" onClick={clearCurrent} title="Limpar">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="result-body">
        <pre className="result-text">{currentPrompt}</pre>
      </div>

      <div className="result-footer">
        <span className="result-chars">{currentPrompt.length} caracteres</span>
        <span className="result-words">{currentPrompt.split(/\s+/).filter(Boolean).length} palavras</span>
      </div>
    </div>
  );
}
