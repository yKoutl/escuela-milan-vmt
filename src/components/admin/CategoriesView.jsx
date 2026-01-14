import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import GenericTable from './GenericTable';
import Modal from '../../shared/Modal';

export default function CategoriesView({ categories, handleAdd, handleDelete, handleUpdate }) {
  const [newCat, setNewCat] = useState({ name: '', range: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleEdit = (category) => {
    setEditingCategory({ ...category });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingCategory) return;
    await handleUpdate('categories', editingCategory.id, {
      name: editingCategory.name,
      range: editingCategory.range
    });
    setEditModalOpen(false);
    setEditingCategory(null);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Gestión de Categorías</h2>
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded flex flex-col md:flex-row gap-2 border border-zinc-200 dark:border-zinc-700">
        <input placeholder="Nombre (Ej: Sub-12)" className="flex-1 p-2 rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-white border" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
        <input placeholder="Rango Edad (Ej: 2014-2016)" className="flex-1 p-2 rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-white border" value={newCat.range} onChange={e => setNewCat({...newCat, range: e.target.value})} />
        <button onClick={() => { handleAdd('categories', newCat); setNewCat({name:'', range:''}) }} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Crear Categoría</button>
      </div>
      <GenericTable
        title="Categorías Activas"
        data={categories}
        onDelete={(id) => handleDelete('categories', id)}
        customActions={(row) => (
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        columns={[
          { header: 'Nombre', field: 'name', render: r => <span className="font-bold text-zinc-800 dark:text-white">{r.name}</span> },
          { header: 'Rango de Edad', field: 'range' }
        ]}
      />

      {/* Modal de Edición */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Categoría">
        {editingCategory && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombre de Categoría</label>
              <input
                type="text"
                className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Rango de Edad</label>
              <input
                type="text"
                className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                value={editingCategory.range}
                onChange={(e) => setEditingCategory({...editingCategory, range: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
