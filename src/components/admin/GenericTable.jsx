import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, EyeOff, Trash2, X } from 'lucide-react';
import Badge from '../shared/Badge';
import { THEME_CLASSES } from '../../utils/theme';

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
    <div className="space-y-4">
      {/* Header con Buscador */}
      <div className={`${THEME_CLASSES.bg.surface} rounded-2xl shadow-sm border ${THEME_CLASSES.border.primary} p-4 md:p-6 transition-all`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className={`text-lg font-black uppercase tracking-tight ${THEME_CLASSES.text.primary}`}>
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info">{sortedData.length} Registros</Badge>
              {searchTerm && <Badge variant="neutral">Filtrado</Badge>}
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all border ${THEME_CLASSES.input}`}
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`hidden md:block overflow-hidden rounded-2xl border ${THEME_CLASSES.border.primary} ${THEME_CLASSES.bg.surface} shadow-sm group/table`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-6 py-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group/th ${sortConfig.key === c.field ? 'text-red-600' : THEME_CLASSES.text.secondary}`}
                  onClick={() => c.field && requestSort(c.field)}
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider">
                    {c.header}
                    {c.field && (
                      <div className={`transition-opacity ${sortConfig.key === c.field ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
                        {sortConfig.key === c.field && sortConfig.direction === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {collectionName && <th className={`px-6 py-4 font-bold uppercase text-[11px] tracking-wider ${THEME_CLASSES.text.secondary}`}>Visibilidad</th>}
              <th className={`px-6 py-4 text-right font-bold uppercase text-[11px] tracking-wider ${THEME_CLASSES.text.secondary}`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {sortedData.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${row.visible === false ? 'opacity-50' : ''}`}
              >
                {columns.map((c, i) => (
                  <td key={i} className={`px-6 py-4 font-medium ${THEME_CLASSES.text.primary}`}>
                    {c.render ? c.render(row) : (row[c.field] || '-')}
                  </td>
                ))}
                {collectionName && toggleVisibility && (
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleVisibility(collectionName, row.id, row.visible !== false)}
                      className="transition-transform active:scale-95 translate-y-0.5"
                    >
                      <Badge variant={row.visible !== false ? 'success' : 'neutral'} className="flex items-center gap-1">
                        {row.visible !== false ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                        {row.visible !== false ? 'Visible' : 'Oculto'}
                      </Badge>
                    </button>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    {customActions && customActions(row)}
                    {onDelete && (
                      confirmId === row.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                          <button
                            onClick={() => { onDelete(row.id); setConfirmId(null); }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm shadow-red-500/20"
                          >
                            Confirmar
                          </button>
                          <button onClick={() => setConfirmId(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(row.id)}
                          className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 p-2 rounded-xl transition-all"
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
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sortedData.map((row) => (
          <div
            key={row.id}
            className={`${THEME_CLASSES.bg.surface} rounded-2xl border ${THEME_CLASSES.border.primary} p-4 shadow-sm active:scale-[0.98] transition-all ${row.visible === false ? 'opacity-60' : ''}`}
          >
            <div className="space-y-3">
              {columns.map((c, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>
                    {c.header}
                  </span>
                  <div className={`text-sm font-bold text-right ${THEME_CLASSES.text.primary}`}>
                    {c.render ? c.render(row) : (row[c.field] || '-')}
                  </div>
                </div>
              ))}

              <div className="pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                {collectionName && toggleVisibility ? (
                  <button
                    onClick={() => toggleVisibility(collectionName, row.id, row.visible !== false)}
                    className="flex items-center gap-2"
                  >
                    <Badge variant={row.visible !== false ? 'success' : 'neutral'} className="flex items-center gap-1.5 py-1">
                      {row.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {row.visible !== false ? 'Visible' : 'Oculto'}
                    </Badge>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  {customActions && customActions(row)}
                  {onDelete && (
                    confirmId === row.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                        <button
                          onClick={() => { onDelete(row.id); setConfirmId(null); }}
                          className="bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg"
                        >
                          Confirmar
                        </button>
                        <button onClick={() => setConfirmId(null)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <X className="h-4 w-4 text-zinc-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(row.id)}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-600 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className={`${THEME_CLASSES.bg.surface} rounded-2xl border ${THEME_CLASSES.border.primary} p-16 text-center shadow-inner`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 mb-6 transition-transform hover:scale-110">
            <Search className="h-10 w-10 text-red-600" />
          </div>
          <h3 className={`text-lg font-black uppercase tracking-tight ${THEME_CLASSES.text.primary} mb-2`}>No hay resultados</h3>
          <p className={`${THEME_CLASSES.text.secondary} font-medium max-w-xs mx-auto`}>
            {searchTerm
              ? `No se encontraron coincidencias para "${searchTerm}". Prueba con otros términos.`
              : 'Esta sección aún no tiene registros para mostrar.'}
          </p>
        </div>
      )}
    </div>
  );
}

