import React, { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { THEME_CLASSES } from '../../utils/theme';
import GenericTable from './GenericTable';
import Modal from '../../shared/Modal';

export default function StudentsView({ students, categories, handleAdd, handleDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // Datos filtrados
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchName = !filterName || student.name.toLowerCase().includes(filterName.toLowerCase());
      const matchCategory = !filterCategory || student.category === filterCategory;
      const matchStatus = !filterStatus || student.status === filterStatus;
      const matchContact = !filterContact || (student.phone && student.phone.includes(filterContact));
      
      // Filtro por rango de fechas
      let matchDate = true;
      if ((filterStartDate || filterEndDate) && student.createdAt?.seconds) {
        const studentDate = new Date(student.createdAt.seconds * 1000);
        if (filterStartDate) {
          const startDate = new Date(filterStartDate);
          matchDate = matchDate && studentDate >= startDate;
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999);
          matchDate = matchDate && studentDate <= endDate;
        }
      }
      
      return matchName && matchCategory && matchStatus && matchContact && matchDate;
    });
  }, [students, filterName, filterCategory, filterStatus, filterContact, filterStartDate, filterEndDate]);
  
  const submitStudent = (e) => {
    e.preventDefault();
    handleAdd('students', newStudent);
    setShowForm(false);
    setNewStudent({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });
  };

  const handleDeleteWithConfirmation = (id) => {
    handleDelete('students', id);
    setDeleteConfirmId(null);
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterContact('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${THEME_CLASSES.text.primary}`}>Directorio de Alumnos</h2>
        <button onClick={() => setShowForm(!showForm)} className={`${THEME_CLASSES.button.primary} px-4 py-2 rounded-lg flex items-center font-bold text-sm`}><Plus className="h-4 w-4 mr-2"/> Nuevo Alumno</button>
      </div>

      {showForm && (
        <div className={`${THEME_CLASSES.bg.card} p-6 rounded-lg animate-fade-in-up ${THEME_CLASSES.border.primary} border`}>
          <form onSubmit={submitStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre Completo" className={`p-2 rounded ${THEME_CLASSES.input}`} value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
            <input required type="date" className={`p-2 rounded ${THEME_CLASSES.input}`} value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} />
            <select className={`p-2 rounded ${THEME_CLASSES.input}`} value={newStudent.category} onChange={e => setNewStudent({...newStudent, category: e.target.value})}>
              <option value="">Seleccionar Categoría</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input required placeholder="Apoderado" className={`p-2 rounded ${THEME_CLASSES.input}`} value={newStudent.parent} onChange={e => setNewStudent({...newStudent, parent: e.target.value})} />
            <input required placeholder="Teléfono" className={`p-2 rounded ${THEME_CLASSES.input}`} value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2 ${THEME_CLASSES.button.secondary} rounded font-bold`}>Cancelar</button>
                <button type="submit" className={`px-4 py-2 ${THEME_CLASSES.button.primary} rounded font-bold`}>Guardar Alumno</button>
            </div>
          </form>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className={`${THEME_CLASSES.bg.surface} rounded-lg shadow ${THEME_CLASSES.border.primary} border p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className={`h-5 w-5 ${THEME_CLASSES.text.tertiary}`} />
            <h3 className={`font-bold ${THEME_CLASSES.text.primary}`}>Filtros</h3>
          </div>
          <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1">{" "}
            <X className="h-3 w-3" /> Limpiar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className={`p-2 rounded ${THEME_CLASSES.input} text-sm`}
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
          />
          <select
            className={`p-2 rounded ${THEME_CLASSES.input} text-sm`}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select
            className={`p-2 rounded ${THEME_CLASSES.input} text-sm`}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <input
            type="text"
            placeholder="Buscar por teléfono..."
            className={`p-2 rounded ${THEME_CLASSES.input} text-sm`}
            value={filterContact}
            onChange={e => setFilterContact(e.target.value)}
          />
          <div>
            <label className={`block text-xs ${THEME_CLASSES.text.secondary} mb-1`}>Desde</label>
            <input
              type="date"
              className={`p-2 rounded ${THEME_CLASSES.input} text-sm w-full`}
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-xs ${THEME_CLASSES.text.secondary} mb-1`}>Hasta</label>
            <input
              type="date"
              className={`p-2 rounded ${THEME_CLASSES.input} text-sm w-full`}
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <GenericTable
        title="Lista de Alumnos"
        data={filteredStudents}
        onDelete={setDeleteConfirmId}
        columns={[
          { header: 'Nombre', field: 'name', render: (r) => <div className="font-bold text-zinc-900 dark:text-white">{r.name}</div> },
          { header: 'Categoría', field: 'category', render: (r) => <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{r.category || 'Sin Cat'}</span> },
          { header: 'Apoderado', field: 'parent' },
          { header: 'Contacto', field: 'phone' },
          { header: 'Estado', field: 'status', render: (r) => <span className={`text-xs px-2 py-1 rounded ${r.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span> },
          { header: 'Fecha de Registro', field: 'createdAt', render: (r) => {
            if (!r.createdAt?.seconds) return 'Sin fecha';
            const date = new Date(r.createdAt.seconds * 1000);
            return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                   date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          }}
        ]}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal 
        isOpen={deleteConfirmId !== null} 
        onClose={() => setDeleteConfirmId(null)}
        title="Confirmar Eliminación"
      >
        <p className={`${THEME_CLASSES.text.secondary} mb-6`}>
          ¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setDeleteConfirmId(null)}
            className={`px-4 py-2 ${THEME_CLASSES.button.secondary} rounded font-bold`}
          >
            Cancelar
          </button>
          <button 
            onClick={() => handleDeleteWithConfirmation(deleteConfirmId)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
