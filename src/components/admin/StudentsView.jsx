import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react'; 
import { THEME_CLASSES } from '../../utils/theme';
import GenericTable from './GenericTable';
import Modal from '../../shared/Modal';

export default function StudentsView({ students, categories, handleAdd, handleDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // --- LÓGICA DE CÁLCULO DE CATEGORÍA AUTOMÁTICA ---
  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    let autoCategory = '';

    if (dateValue) {
      const year = parseInt(dateValue.split('-')[0]); // Extraemos el año (ej: "2005-01-20" -> 2005)

      // LÓGICA: Si es 2008 o ANTES (son mayores de edad o seniors), ponemos "2008+"
      // Si nacieron después (ej: 2010), ponemos el año tal cual.
      if (year <= 2008) {
        autoCategory = '2008+';
      } else {
        autoCategory = year.toString();
      }
    }

    setNewStudent({ 
      ...newStudent, 
      dob: dateValue, 
      category: autoCategory // Actualizamos la categoría automáticamente
    });
  };

  // Lógica de filtrado
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchName = !filterName || student.name.toLowerCase().includes(filterName.toLowerCase());
      const matchCategory = !filterCategory || student.category === filterCategory;
      const matchStatus = !filterStatus || student.status === filterStatus;
      const matchContact = !filterContact || (student.phone && student.phone.includes(filterContact));
      
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

  // Clases de estilo
  const CARD_STYLE = "bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-4";
  const INPUT_STYLE = "p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm w-full";

  return (
    <div className="space-y-6">
      {/* --- CABECERA --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Directorio de Alumnos</h2>
        
        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center font-bold text-sm border transition
              ${showFilters 
                ? 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-700 dark:text-white dark:border-zinc-600' 
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800'
              }`}
          >
            <Filter className="h-4 w-4 mr-2"/> 
            Filtros
          </button>

          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`flex-1 md:flex-none ${THEME_CLASSES.button.primary} px-4 py-2 rounded-lg flex items-center justify-center font-bold text-sm shadow-md`}
          >
            <Plus className="h-4 w-4 mr-2"/> 
            Nuevo Alumno
          </button>
        </div>
      </div>

      {/* --- FORMULARIO DE CREACIÓN (Toggle) --- */}
      {showForm && (
        <div className={`${THEME_CLASSES.bg.card} p-6 rounded-lg animate-fade-in-up ${THEME_CLASSES.border.primary} border mb-6`}>
          <form onSubmit={submitStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre Completo" className={INPUT_STYLE} value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
            
            {/* INPUT FECHA CON LÓGICA AUTOMÁTICA */}
            <div>
              <input 
                required 
                type="date" 
                className={INPUT_STYLE} 
                value={newStudent.dob} 
                onChange={handleDateChange} // <--- Aquí usamos la nueva función
              />
              <p className="text-xs text-zinc-400 mt-1 ml-1">La categoría se seleccionará automáticamente.</p>
            </div>

            <select className={INPUT_STYLE} value={newStudent.category} onChange={e => setNewStudent({...newStudent, category: e.target.value})}>
              <option value="">Seleccionar Categoría</option>
              {/* Opción especial 2008+ por si no viene en las categorias */}
              <option value="2008+">2008+</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            
            <input required placeholder="Apoderado" className={INPUT_STYLE} value={newStudent.parent} onChange={e => setNewStudent({...newStudent, parent: e.target.value})} />
            <input required placeholder="Teléfono" className={INPUT_STYLE} value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
            
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2 ${THEME_CLASSES.button.secondary} rounded font-bold`}>Cancelar</button>
                <button type="submit" className={`px-4 py-2 ${THEME_CLASSES.button.primary} rounded font-bold`}>Guardar Alumno</button>
            </div>
          </form>
        </div>
      )}

      {/* --- TARJETA DE FILTROS --- */}
      {showFilters && (
        <div className={`${CARD_STYLE} animate-in fade-in slide-in-from-top-2`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-zinc-500" />
              <h3 className="font-bold text-zinc-800 dark:text-white">Filtros de Búsqueda</h3>
            </div>
            
            <button 
              onClick={clearFilters} 
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className={INPUT_STYLE}
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
            />
            <select
              className={INPUT_STYLE}
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="2008+">2008+</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select
              className={INPUT_STYLE}
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
              className={INPUT_STYLE}
              value={filterContact}
              onChange={e => setFilterContact(e.target.value)}
            />
            <div>
              <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Desde</label>
              <input
                type="date"
                className={INPUT_STYLE}
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Hasta</label>
              <input
                type="date"
                className={INPUT_STYLE}
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TABLA --- */}
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
        <p className="text-zinc-700 dark:text-zinc-300 mb-6">
          ¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setDeleteConfirmId(null)}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 font-bold"
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