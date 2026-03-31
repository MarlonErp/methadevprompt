import React, { useEffect, useState } from 'react';
import { Heart, Trash2, Copy, Check, Search, Filter, Star } from 'lucide-react';
import { usePrompts } from '../contexts/PromptsContext';
import type { GeneratedPrompt } from '../types';

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', fullstack: 'Fullstack',
  mobile: 'Mobile', 'ui-ux': 'UI/UX', database: 'BD', devops: 'DevOps',
  'ai-ml': 'IA & ML', api: 'API', general: 'Geral',
};

const categoryColors: Record<string, string> = {
  frontend: '#6366f1', backend: '#8b5cf6', fullstack: '#a855f7',
  mobile: '#06b6d4', 'ui-ux': '#f59e0b', database: '#10b981',
  devops: '#3b82f6', 'ai-ml': '#ec4899', api: '#14b8a6', general: '#6b7280',
};

function PromptCard({ item }: { item: GeneratedPrompt; key?: React.Key }) {
  const { toggleFav, remove } = usePrompts();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await remove(item.id);
  };

  const date = new Date(item.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className={`prompt-card ${deleting ? 'deleting' : ''}`}>
      <div className="prompt-card-header">
        <div className="prompt-card-meta">
          <span
            className="cat-tag"
            style={{ background: categoryColors[item.config.category] + '22', color: categoryColors[item.config.category] }}
          >
            {categoryLabels[item.config.category]}
          </span>
          <span className="prompt-date">{date}</span>
        </div>
        <div className="prompt-card-actions">
          <button
            className={`icon-btn ${item.isFavorite ? 'fav-active' : ''}`}
            onClick={() => toggleFav(item.id, item.isFavorite)}
            title={item.isFavorite ? 'Remover favorito' : 'Favoritar'}
          >
            <Heart size={15} fill={item.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className="icon-btn" onClick={handleCopy} title="Copiar">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button className="icon-btn icon-btn-danger" onClick={handleDelete} title="Excluir">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <h3 className="prompt-card-title">{item.title}</h3>

      <p className="prompt-card-preview">
        {expanded ? item.prompt : item.prompt.substring(0, 200) + (item.prompt.length > 200 ? '...' : '')}
      </p>

      {item.prompt.length > 200 && (
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Ver menos ▲' : 'Ver mais ▼'}
        </button>
      )}

      {item.tags.length > 0 && (
        <div className="prompt-tags">
          {item.tags.map(tag => (
            <span key={tag} className="prompt-tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function HistoryPage() {
  const { prompts, loadUserPrompts, isLoading } = usePrompts();
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);

  useEffect(() => {
    loadUserPrompts();
  }, [loadUserPrompts]);

  const filtered = prompts.filter(p => {
    const matchSearch = search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFav = !filterFav || p.isFavorite;
    return matchSearch && matchFav;
  });

  const favCount = prompts.filter(p => p.isFavorite).length;

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="section-header">
          <h2>Meus Prompts</h2>
          <span className="count-badge">{prompts.length}</span>
        </div>

        <div className="history-controls">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="history-search"
              type="text"
              className="search-input"
              placeholder="Buscar prompts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            id="fav-filter-btn"
            className={`filter-btn ${filterFav ? 'active' : ''}`}
            onClick={() => setFilterFav(!filterFav)}
          >
            <Star size={15} fill={filterFav ? 'currentColor' : 'none'} />
            Favoritos {favCount > 0 && `(${favCount})`}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="history-loading">
          <div className="loading-spinner" />
          <p>Carregando seus prompts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">
          {prompts.length === 0 ? (
            <>
              <div className="empty-icon large">📝</div>
              <h3>Nenhum prompt salvo ainda</h3>
              <p>Gere e salve prompts para vê-los aqui.</p>
            </>
          ) : (
            <>
              <div className="empty-icon large">🔍</div>
              <h3>Nenhum resultado encontrado</h3>
              <p>Tente uma busca diferente.</p>
            </>
          )}
        </div>
      ) : (
        <div className="prompts-grid">
          {filtered.map(item => (
            <PromptCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
