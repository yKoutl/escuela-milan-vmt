import React, { useState } from 'react';
import GenericTable from './GenericTable';

export default function CategoriesView({ categories, handleAdd, handleDelete }) {
  const [newCat, setNewCat] = useState({ name: '', range: '' });
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Gestión de Categorías</h2>
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded flex flex-col md:flex-row gap-2 border border-zinc-200 dark:border-zinc-700">
        <input placeholder="Nombre (Ej: Sub-12)" className="flex-1 p-2 rounded dark:bg-zinc-900 dark:border-zinc-700 border" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
        <input placeholder="Rango Edad (Ej: 2014-2016)" className="flex-1 p-2 rounded dark:bg-zinc-900 dark:border-zinc-700 border" value={newCat.range} onChange={e => setNewCat({...newCat, range: e.target.value})} />
        <button onClick={() => { handleAdd('categories', newCat); setNewCat({name:'', range:''}) }} className="bg-red-600 text-white px-4 py-2 rounded font-bold">Crear Categoría</button>
      </div>
      <GenericTable
        title="Categorías Activas"
        data={categories}
        onDelete={(id) => handleDelete('categories', id)}
        columns={[
          { header: 'Nombre', field: 'name', render: r => <span className="font-bold text-zinc-800 dark:text-white">{r.name}</span> },
          { header: 'Rango de Edad', field: 'range' }
        ]}
      />
    </div>
  );
}
