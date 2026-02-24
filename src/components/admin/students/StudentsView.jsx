import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2, Edit, ChevronDown, MessageCircle, User, Calendar, Tag, Phone, Activity } from 'lucide-react';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import Modal from '../../../shared/Modal';
import CustomDatePicker from '../../../shared/CustomDatePicker';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import Badge from '../../shared/Badge';

export default function StudentsView({ categories, handleAdd, handleDelete }) {
  const { data: students, loading, loadMore, hasMore } = usePaginatedQuery('students', 50);

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    dob: '',
    category: '',
    parent: '',
    phone: '',
    status: 'Activo',
    registrationDate: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    let autoCategory = '';
    if (dateValue) {
      const year = parseInt(dateValue.split('-')[0]);
      autoCategory = year <= 2008 ? '2008+' : year.toString();
    }
    setNewStudent({ ...newStudent, dob: dateValue, category: autoCategory });
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchName = !filterName || student.name.toLowerCase().includes(filterName.toLowerCase());
      const matchCategory = !filterCategory || student.category === filterCategory;
      const matchStatus = !filterStatus || student.status === filterStatus;
      const matchContact = !filterContact || (student.phone && student.phone.includes(filterContact));
      let matchDate = true;
      if (filterStartDate || filterEndDate) {
        let studentDateVal = null;
        if (student.registrationDate) studentDateVal = new Date(student.registrationDate);
        else if (student.createdAt?.seconds) studentDateVal = new Date(student.createdAt.seconds * 1000);
        if (studentDateVal) {
          if (filterStartDate) matchDate = matchDate && studentDateVal >= new Date(filterStartDate);
          if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            matchDate = matchDate && studentDateVal <= endDate;
          }
        }
      }
      return matchName && matchCategory && matchStatus && matchContact && matchDate;
    });
  }, [students, filterName, filterCategory, filterStatus, filterContact, filterStartDate, filterEndDate]);

  const submitStudent = (e) => {
    e.preventDefault();
    handleAdd('students', newStudent);
    setShowForm(false);
    setNewStudent({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo', registrationDate: '' });
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

  const handleWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const INPUT_STYLE = THEME_CLASSES.input;
  const LABEL_STYLE = "block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center gap-1.5 ml-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className={`text-2xl font-black uppercase tracking-tight ${THEME_CLASSES.text.primary}`}>Directorio de Alumnos</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl flex items-center justify-center font-black uppercase tracking-wider text-xs border transition-all active:scale-95
              ${showFilters
                ? 'bg-zinc-200 text-zinc-800 border-zinc-300 dark:bg-zinc-700 dark:text-white dark:border-zinc-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 shadow-sm'
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button onClick={() => setShowForm(!showForm)} className={`flex-1 md:flex-none ${THEME_CLASSES.button.primary} px-4 py-2 rounded-xl flex items-center justify-center font-black uppercase tracking-wider text-xs shadow-lg shadow-red-500/20 transition-all active:scale-95`} >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Alumno
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-2xl animate-in slide-in-from-top-4 border ${THEME_CLASSES.border.primary} shadow-sm mb-6`}>
          <form onSubmit={submitStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Nombre Completo" className={INPUT_STYLE} value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
            <div>
              <CustomDatePicker value={newStudent.dob} onChange={handleDateChange} placeholder="Fecha Nacimiento" />
              <p className="text-[10px] text-zinc-400 mt-1 ml-1 font-medium">Categoría automática por año.</p>
            </div>
            <select className={INPUT_STYLE} value={newStudent.category} onChange={e => setNewStudent({ ...newStudent, category: e.target.value })}>
              <option value="">Seleccionar Categoría</option>
              <option value="2008+">2008+</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input required placeholder="Apoderado" className={INPUT_STYLE} value={newStudent.parent} onChange={e => setNewStudent({ ...newStudent, parent: e.target.value })} />
            <input required placeholder="Teléfono" className={INPUT_STYLE} value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} />
            <CustomDatePicker value={newStudent.registrationDate} onChange={e => setNewStudent({ ...newStudent, registrationDate: e.target.value })} placeholder="Fecha de Inscripción" />
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-zinc-500 font-black uppercase tracking-wider text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">Cancelar</button>
              <button type="submit" className={`px-6 py-2 ${THEME_CLASSES.button.primary} rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-red-500/20`}>Guardar Alumno</button>
            </div>
          </form>
        </div>
      )}

      {showFilters && (
        <div className={`${THEME_CLASSES.bg.surface} rounded-2xl border ${THEME_CLASSES.border.primary} p-5 shadow-sm animate-in fade-in slide-in-from-top-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-widest text-xs text-zinc-500 flex items-center gap-2 px-1"><Search size={14} /> Filtros de Búsqueda</h3>
            <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors">Limpiar Filtros</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <input type="text" placeholder="Nombre..." className={INPUT_STYLE} value={filterName} onChange={e => setFilterName(e.target.value)} />
            <select className={INPUT_STYLE} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">Todas las categorías</option>
              <option value="2008+">2008+</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select className={INPUT_STYLE} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <input type="text" placeholder="Teléfono..." className={INPUT_STYLE} value={filterContact} onChange={e => setFilterContact(e.target.value)} />
            <input type="date" className={INPUT_STYLE} value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
            <input type="date" className={INPUT_STYLE} value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
          </div>
        </div>
      )}

      <GenericTable
        title="Lista de Alumnos"
        data={filteredStudents}
        onDelete={setDeleteConfirmId}
        customActions={(row) => (
          <div className="flex items-center gap-1">
            <button onClick={() => handleWhatsApp(row.phone)} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 p-2 rounded-xl transition-all" title="WhatsApp"><MessageCircle size={18} /></button>
            <button onClick={() => { setEditingStudent(row); setEditModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-2 rounded-xl transition-all" title="Editar"><Edit size={18} /></button>
          </div>
        )}
        columns={[
          { header: 'Nombre', field: 'name', render: (r) => <div className="font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{r.name}</div> },
          { header: 'Categoría', field: 'category', render: (r) => <Badge variant="info">{r.category || 'N/A'}</Badge> },
          { header: 'Apoderado', field: 'parent' },
          { header: 'Contacto', field: 'phone' },
          { header: 'Estado', field: 'status', render: (r) => <Badge variant={r.status === 'Activo' ? 'success' : 'error'}>{r.status}</Badge> },
          {
            header: 'Fecha Inscripción', field: 'createdAt', render: (r) => {
              if (r.registrationDate) {
                const part = r.registrationDate.split('-');
                if (part.length === 3) return `${part[2]}/${part[1]}/${part[0]}`;
                return r.registrationDate;
              }
              if (!r.createdAt?.seconds) return <span className="opacity-30">---</span>;
              const date = new Date(r.createdAt.seconds * 1000);
              return <span className="text-zinc-500 font-medium">{date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>;
            }
          }
        ]}
      />

      <div className="flex flex-col items-center justify-center py-8 gap-4">
        {loading && <p className="text-zinc-400 animate-pulse text-xs font-black uppercase tracking-[0.2em]">Cargando más...</p>}
        {!loading && hasMore && (
          <button onClick={loadMore} className="flex items-center gap-2 px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-black uppercase tracking-widest text-[10px] active:scale-95 shadow-sm">
            <ChevronDown size={14} /> Cargar más alumnos
          </button>
        )}
      </div>

      <Modal isOpen={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} title="Confirmar Eliminación">
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 font-medium">¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-zinc-500 font-black uppercase tracking-wider text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">Cancelar</button>
          <button onClick={() => handleDeleteWithConfirmation(deleteConfirmId)} className="px-6 py-2 bg-red-600 text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-red-500/20 active:scale-95">Eliminar</button>
        </div>
      </Modal>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Alumno">
        {editingStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={LABEL_STYLE}><User size={12} /> Nombre Completo</label>
              <input type="text" className={INPUT_STYLE} value={editingStudent.name} onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} />
            </div>
            <div>
              <label className={LABEL_STYLE}><Calendar size={12} /> Fecha de Nacimiento</label>
              <CustomDatePicker value={editingStudent.dob || ''} onChange={(e) => {
                const dateValue = e.target.value;
                let autoCategory = editingStudent.category;
                if (dateValue) {
                  const year = parseInt(dateValue.split('-')[0]);
                  autoCategory = year <= 2008 ? '2008+' : year.toString();
                }
                setEditingStudent({ ...editingStudent, dob: dateValue, category: autoCategory });
              }}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}><Tag size={12} /> Categoría</label>
              <select className={INPUT_STYLE} value={editingStudent.category} onChange={(e) => setEditingStudent({ ...editingStudent, category: e.target.value })}>
                <option value="">Seleccionar Categoría</option>
                <option value="2008+">2008+</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={LABEL_STYLE}><User size={12} /> Apoderado</label>
              <input type="text" className={INPUT_STYLE} value={editingStudent.parent} onChange={(e) => setEditingStudent({ ...editingStudent, parent: e.target.value })} />
            </div>
            <div>
              <label className={LABEL_STYLE}><Phone size={12} /> Teléfono</label>
              <input type="text" className={INPUT_STYLE} value={editingStudent.phone} onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })} />
            </div>
            <div>
              <label className={LABEL_STYLE}><Activity size={12} /> Estado</label>
              <select className={INPUT_STYLE} value={editingStudent.status} onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={LABEL_STYLE}><Calendar size={12} /> Fecha de Inscripción</label>
              <CustomDatePicker value={editingStudent.registrationDate || ''} onChange={(e) => setEditingStudent({ ...editingStudent, registrationDate: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-zinc-500 font-black uppercase tracking-wider text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">Cancelar</button>
              <button onClick={() => { handleAdd('students', editingStudent); setEditModalOpen(false); setEditingStudent(null); }} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 active:scale-95">Guardar Cambios</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}