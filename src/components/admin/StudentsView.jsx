import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import GenericTable from './GenericTable';

export default function StudentsView({ students, categories, handleAdd, handleDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });
  
  const submitStudent = (e) => {
    e.preventDefault();
    handleAdd('students', newStudent);
    setShowForm(false);
    setNewStudent({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Directorio de Alumnos</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 font-bold text-sm"><Plus className="h-4 w-4 mr-2"/> Nuevo Alumno</button>
      </div>

      {showForm && (
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg animate-fade-in-up border border-zinc-200 dark:border-zinc-700">
          <form onSubmit={submitStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre Completo" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
            <input required type="date" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} />
            <select className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.category} onChange={e => setNewStudent({...newStudent, category: e.target.value})}>
              <option value="">Seleccionar Categoría</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input required placeholder="Apoderado" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.parent} onChange={e => setNewStudent({...newStudent, parent: e.target.value})} />
            <input required placeholder="Teléfono" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-300 dark:bg-zinc-700 rounded font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 dark:bg-white dark:text-black text-white rounded font-bold">Guardar Alumno</button>
            </div>
          </form>
        </div>
      )}

      <GenericTable
        title="Lista de Alumnos"
        data={students}
        onDelete={(id) => handleDelete('students', id)}
        columns={[
          { header: 'Nombre', field: 'name', render: (r) => <div className="font-bold text-zinc-900 dark:text-white">{r.name}</div> },
          { header: 'Categoría', field: 'category', render: (r) => <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{r.category || 'Sin Cat'}</span> },
          { header: 'Apoderado', field: 'parent' },
          { header: 'Contacto', field: 'phone' },
          { header: 'Estado', field: 'status', render: (r) => <span className={`text-xs px-2 py-1 rounded ${r.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span> }
        ]}
      />
    </div>
  );
}
