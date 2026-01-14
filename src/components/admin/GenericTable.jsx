import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, X, Edit, FileText, MessageCircle } from 'lucide-react';

export default function GenericTable({ title, data, columns, onDelete, collectionName, toggleVisibility, customActions }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-8">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800">
        <h3 className="font-bold text-zinc-800 dark:text-white">{title}</h3>
        <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-full">{data.length} Items</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-100 dark:bg-zinc-950 uppercase text-xs">
            <tr>
              {columns.map((c, i) => <th key={i} className="px-6 py-3">{c.header}</th>)}
              {collectionName && <th className="px-6 py-3">Visibilidad</th>}
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className={`border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${row.visible === false ? 'opacity-50' : ''}`}>
                {columns.map((c, i) => <td key={i} className="px-6 py-4">{c.render ? c.render(row) : row[c.field]}</td>)}
                {collectionName && toggleVisibility && (
                  <td className="px-6 py-4">
                    <button onClick={() => toggleVisibility(collectionName, row.id, row.visible !== false)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${row.visible !== false ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-600'}`}>
                      {row.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {row.visible !== false ? 'Visible' : 'Oculto'}
                    </button>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {customActions && customActions(row)}
                    {onDelete && (
                      confirmId === row.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => { onDelete(row.id); setConfirmId(null); }} className="text-red-600 font-bold text-xs">Confirmar</button>
                          <button onClick={() => setConfirmId(null)} className="text-zinc-400"><X className="h-4 w-4"/></button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmId(row.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 p-2 rounded"><Trash2 className="h-4 w-4"/></button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={columns.length + (collectionName ? 2 : 1)} className="p-6 text-center">No hay datos registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
