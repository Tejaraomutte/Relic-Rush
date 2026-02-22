import { useState } from 'react';

type Block = { label: string; type: string };
type Props = {
  onCategoryChange?: (cat: string) => void;
  categories?: string[];
  value?: string;
  disabled?: boolean;
};

const CATEGORIES: Record<string, Block[]> = {
  Programming: [
    { label: 'Input/Output', type: 'io' },
    { label: 'End', type: 'terminator' },
    { label: 'Decision', type: 'decision' },
    { label: 'Process', type: 'process' },
    { label: 'Start', type: 'terminator' },
  ],
  'Operating Systems': [
    { label: 'I/O Request', type: 'io' },
    { label: 'Scheduler', type: 'process' },
    { label: 'Waiting State', type: 'process' },
    { label: 'Terminated', type: 'terminator' },
    { label: 'Running State', type: 'process' },
    { label: 'Process', type: 'process' },
    { label: 'Ready State', type: 'process' },
  ],
  DBMS: [
    { label: 'Rollback', type: 'process' },
    { label: 'End', type: 'terminator' },
    { label: 'Validate Query', type: 'process' },
    { label: 'User Input', type: 'io' },
    { label: 'Database', type: 'database' },
    { label: 'Start', type: 'terminator' },
    { label: 'Commit', type: 'process' },
  ],
  Cybersecurity: [
    { label: 'Access Denied', type: 'process' },
    { label: 'User', type: 'process' },
    { label: 'Decrypt', type: 'process' },
    { label: 'Authorization', type: 'process' },
    { label: 'Encrypt', type: 'process' },
    { label: 'Access Granted', type: 'process' },
    { label: 'Firewall', type: 'process' },
    { label: 'Authentication', type: 'process' },
  ],
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

export default function Sidebar({
  onCategoryChange,
  categories,
  value,
  disabled = false
}: Props) {
  const availableCategories = (categories && categories.length > 0 ? categories : CATEGORY_KEYS).filter((cat) => CATEGORIES[cat]);
  const [internalCategory, setInternalCategory] = useState<string>(availableCategories[0]);

  const category = value && availableCategories.includes(value) ? value : internalCategory;

  const handleCategoryChange = (newCat: string) => {
    setInternalCategory(newCat);
    if (onCategoryChange) onCategoryChange(newCat);
  };

  const onDragStart = (event: any, block: Block) => {
    const payload = JSON.stringify({ type: block.type, label: block.label, category });
    event.dataTransfer.setData('application/reactflow', payload);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar" style={{ width: 200, padding: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: '#111827', textAlign: 'left' }}>{category}</div>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={disabled}
          style={{ fontSize: 13, padding: '6px 10px', width: '100%', boxSizing: 'border-box', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#111827' }}
        >
          {availableCategories.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="category">
        {CATEGORIES[category].map((b) => (
          <div
            key={b.label}
            draggable={!disabled}
            onDragStart={(e) => onDragStart(e, b)}
            className={`tool tool-${category.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {b.label}
          </div>
        ))}
      </div>
    </aside>
  );
}
