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
    <aside className="sidebar" style={{ width: 260, padding: 20, background: 'rgba(255,255,255,0.7)', borderRadius: 12, boxShadow: '0 12px 40px rgba(2,6,23,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: 18, textAlign: 'left', letterSpacing: '0.5px' }}>{category}</div>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={disabled}
          style={{ fontSize: 15, padding: '10px 14px', width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #a5b4fc', background: 'linear-gradient(90deg,#f3f7fb,#e0e7ff)', color: '#3730a3', fontWeight: 600, boxShadow: '0 4px 16px #4f46e533', outline: 'none' }}
        >
          {availableCategories.map((k) => (
            <option key={k} value={k} style={{ fontWeight: 600, color: '#3730a3', background: '#fff' }}>{k}</option>
          ))}
        </select>
      </div>

      <div className="category" style={{ marginBottom: 18 }}>
        {CATEGORIES[category].map((b) => (
          <div
            key={b.label}
            draggable={!disabled}
            onDragStart={(e) => onDragStart(e, b)}
            className={`tool tool-${category.replace(/\s+/g, '-').toLowerCase()}`}
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg,#f3f7fb,#e0e7ff)',
              border: '1px solid #a5b4fc',
              marginBottom: '10px',
              cursor: 'grab',
              fontWeight: 600,
              color: '#3730a3',
              fontSize: '15px',
              boxShadow: '0 8px 20px rgba(79,70,229,0.08)',
              transition: 'transform .15s, box-shadow .15s',
            }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </aside>
  );
}
