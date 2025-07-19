'use client';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue } | Record<string, unknown>;

interface JsonViewerProps {
  data: JsonValue;
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const renderValue = (value: JsonValue): React.ReactNode => {
    if (value === null) return <span className="text-gray-400">null</span>;
    if (typeof value === 'number') return <span className="text-blue-600">{value}</span>;
    if (typeof value === 'boolean') return <span className="text-orange-600">{value.toString()}</span>;
    if (typeof value === 'string') return <span className="text-green-600">{String(value)}</span>;
    
    if (Array.isArray(value)) {
      return (
        <>
          <span className="text-gray-600">[</span>
          {value.length > 0 && (
            <div className="ml-2">
              {value.map((item, i) => (
                <div key={i}>
                  {renderValue(item)}
                  {i < value.length - 1 && <span className="text-gray-600">,</span>}
                </div>
              ))}
            </div>
          )}
          <span className="text-gray-600">]</span>
        </>
      );
    }
    
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      return (
        <>
          <span className="text-gray-600">{'{'}</span>
          {keys.length > 0 && (
            <div className="ml-2">
              {keys.map((key, i) => (
                <div key={key} className="py-0.5 flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-700">{String(key)}</span>
                    <span className="text-gray-600">: </span>
                  </div>
                  <div className="flex-1">
                    {renderValue(value[key] as JsonValue)}
                    {i < keys.length - 1 && <span className="text-gray-600">,</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <span className="text-gray-600">{'}'}</span>
        </>
      );
    }
    
    return <span className="text-gray-800">{String(value)}</span>;
  };

  return (
    <div className="text-xs font-mono">
      {renderValue(data)}
    </div>
  );
}