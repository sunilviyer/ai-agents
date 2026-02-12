// Shared helper to format JSON as readable text
export function formatDataAsText(data: Record<string, unknown>): React.ReactNode {
  const formatValue = (key: string, value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      // Long strings get their own paragraph
      if (value.length > 80) {
        return (
          <p key={key} className="mb-4 leading-relaxed">
            <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
              {formatLabel(key)}:
            </strong>
            <br />
            <span className="mt-1 block pl-4 border-l-2" style={{ borderColor: 'rgba(253, 240, 213, 0.3)' }}>
              {value}
            </span>
          </p>
        );
      }
      // Short strings inline
      return (
        <p key={key} className="mb-2">
          <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>{' '}
          {value}
        </p>
      );
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <p key={key} className="mb-2">
          <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>{' '}
          {String(value)}
        </p>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return null;

      // Check if array of simple values
      if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
        return (
          <div key={key} className="mb-4">
            <strong className="font-semibold block mb-2" style={{ color: '#FDF0D5' }}>
              {formatLabel(key)}:
            </strong>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {value.map((item, idx) => (
                <li key={idx}>{String(item)}</li>
              ))}
            </ul>
          </div>
        );
      }

      // Array of objects
      return (
        <div key={key} className="mb-6">
          <strong className="font-semibold block mb-3 text-lg" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>
          <div className="space-y-4 pl-4">
            {value.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg" style={{
                background: 'rgba(253, 240, 213, 0.05)',
                border: '1px solid rgba(253, 240, 213, 0.1)'
              }}>
                <div className="text-sm font-semibold mb-2 opacity-70" style={{ color: '#FDF0D5' }}>
                  Item {idx + 1}
                </div>
                {typeof item === 'object' && item !== null
                  ? Object.entries(item as Record<string, unknown>).map(([k, v]) => formatValue(k, v, depth + 1))
                  : <span>{String(item)}</span>
                }
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const entries = Object.entries(obj);

      if (entries.length === 0) return null;

      return (
        <div key={key} className="mb-4 pl-4 border-l-2" style={{ borderColor: 'rgba(253, 240, 213, 0.3)' }}>
          <strong className="font-semibold block mb-2" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>
          <div className="space-y-2">
            {entries.map(([k, v]) => formatValue(k, v, depth + 1))}
          </div>
        </div>
      );
    }

    return null;
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="italic opacity-70" style={{ color: '#FDF0D5' }}>No data available.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => formatValue(key, value))}
    </div>
  );
}
