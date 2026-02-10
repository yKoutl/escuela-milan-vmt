import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Trash2, X, Edit, FileText, MessageCircle, Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function GenericTable({ title, data, columns, onDelete, collectionName, toggleVisibility, customActions }) {
  const [confirmId, setConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 1. Filtrado Local
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => {
      return columns.some(col => {
        const val = col.render ? '' : String(row[col.field] || '').toLowerCase();
        return val.includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // 2. Ordenamiento Local
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-8">
      {/* Header con Buscador */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center bg-zinc-50 dark:bg-zinc-800 gap-4">
        <div>
          <h3 className="font-bold text-zinc-800 dark:text-white">{title}</h3>
          <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-full">{sortedData.length} Items</span>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar en la tabla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-100 dark:bg-zinc-950 uppercase text-xs">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-6 py-3 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${sortConfig.key === c.field ? 'text-red-600' : ''}`}
                  onClick={() => c.field && requestSort(c.field)}
                >
                  <div className="flex items-center gap-1">
                    {c.header}
                    {c.field && (
                      sortConfig.key === c.field ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <div className="w-3 h-3 opacity-20"><ChevronUp className="h-3 w-3" /></div>
                      )
                    )}
                  </div>
                </th>
              ))}
              {collectionName && <th className="px-6 py-3">Visibilidad</th>}
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sortedData.map((row) => (
              <tr key={row.id} className={`border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${row.visible === false ? 'opacity-50' : ''} transition-colors`}>
                {columns.map((c, i) => (
                  <td key={i} className="px-6 py-4">
                    {c.render ? c.render(row) : (row[c.field] || '-')}
                  </td>
                ))}
                {collectionName && toggleVisibility && (
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleVisibility(collectionName, row.id, row.visible !== false)}
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-all ${row.visible !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}
                    >
                      {row.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {row.visible !== false ? 'Visible' : 'Oculto'}
                    </button>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {customActions && customActions(row)}
                    {onDelete && (
                      confirmId === row.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                          <button onClick={() => { onDelete(row.id); setConfirmId(null); }} className="text-red-600 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Confirmar</button>
                          <button onClick={() => setConfirmId(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(row.id)}
                          className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (collectionName ? 2 : 1)} className="p-12 text-center text-zinc-500 italic">
                  No se encontraron resultados para "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
