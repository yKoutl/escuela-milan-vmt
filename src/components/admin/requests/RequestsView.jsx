import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Edit, UserPlus, MessageCircle, Search, X, Trash2, ChevronDown } from 'lucide-react';
import { db, appId } from '../../../firebase';
import GenericTable from '../GenericTable';
import Modal from '../../../shared/Modal';
import Badge from '../../shared/Badge';
import { THEME_CLASSES } from '../../../utils/theme';

export default function RequestsView({ handleDelete, showNotification }) {
  const [regs, setRegs] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(null);
  const [editingReg, setEditingReg] = useState(null);

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'registrations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setRegs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const updateStatus = async (id, val) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registrations', id), { status: val });
    showNotification('Estado actualizado');
  };

  const handleEdit = (reg) => {
    setEditingReg({ ...reg });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingReg) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registrations', editingReg.id), {
        childName: editingReg.childName,
        parentName: editingReg.parentName,
        category: editingReg.category,
        phone: editingReg.phone,
        email: editingReg.email,
        status: editingReg.status
      });
      showNotification('Solicitud actualizada correctamente');
      setEditModalOpen(false);
      setEditingReg(null);
    } catch (error) {
      showNotification('Error al actualizar: ' + error.message, 'error');
    }
  };

  const handleEnroll = async (reg) => {
    try {
      // Agregar al directorio de estudiantes
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), {
        name: reg.childName,
        parent: reg.parentName || 'Sin especificar',
        phone: reg.phone,
        email: reg.email || '',
        category: reg.category,
        status: 'Activo',
        createdAt: serverTimestamp(),
        enrolledFrom: 'web-request'
      });

      // Eliminar de solicitudes
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registrations', reg.id));

      showNotification('Alumno matriculado exitosamente');
      setEnrollModalOpen(null);
    } catch (error) {
      showNotification('Error al matricular: ' + error.message, 'error');
    }
  };

  const handleDeleteWithConfirmation = (id) => {
    handleDelete('registrations', id);
    setDeleteConfirmId(null);
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterStatus('');
    setFilterMonth('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Filtrar solicitudes
  const filteredRegs = useMemo(() => {
    return regs.filter(reg => {
      const matchName = !filterName ||
        reg.childName?.toLowerCase().includes(filterName.toLowerCase()) ||
        reg.parentName?.toLowerCase().includes(filterName.toLowerCase());

      const matchStatus = !filterStatus || reg.status === filterStatus;

      // Filtrar por mes (si está seleccionado)
      let matchMonth = true;
      if (filterMonth && reg.createdAt?.seconds) {
        const regDate = new Date(reg.createdAt.seconds * 1000);
        matchMonth = (regDate.getMonth() + 1) === parseInt(filterMonth);
      }

      let matchDate = true;
      if ((filterStartDate || filterEndDate) && reg.createdAt?.seconds) {
        const regDate = new Date(reg.createdAt.seconds * 1000);
        if (filterStartDate) {
          matchDate = matchDate && regDate >= new Date(filterStartDate);
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999);
          matchDate = matchDate && regDate <= endDate;
        }
      }

      return matchName && matchStatus && matchMonth && matchDate;
    });
  }, [regs, filterName, filterStatus, filterMonth, filterStartDate, filterEndDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className={`text-2xl font-black ${THEME_CLASSES.text.primary}`}>
          Solicitudes de <span className="text-red-600">Matrícula</span>
        </h2>
        <Badge variant="info" className="w-fit">{filteredRegs.length} Solicitud(es)</Badge>
      </div>

      {/* Barra de Filtros */}
      <div className={`${THEME_CLASSES.bg.surface} rounded-2xl shadow-sm border ${THEME_CLASSES.border.primary} p-5`}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-red-500" />
            <h3 className={`font-bold text-sm uppercase tracking-wider ${THEME_CLASSES.text.secondary}`}>Filtros de Búsqueda</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-[10px] uppercase tracking-widest text-red-600 hover:text-red-700 font-black flex items-center gap-1.5 transition-all bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg"
          >
            <Trash2 className="h-3 w-3" /> Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Nombre</label>
            <input
              type="text"
              placeholder="Buscar..."
              className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${THEME_CLASSES.input}`}
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Estado</label>
            <select
              className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${THEME_CLASSES.input}`}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Contactado">Contactado</option>
              <option value="Matriculado">Matriculado</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Mes</label>
            <select
              className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${THEME_CLASSES.input}`}
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Desde</label>
            <input
              type="date"
              className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${THEME_CLASSES.input}`}
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Hasta</label>
            <input
              type="date"
              className={`w-full p-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all ${THEME_CLASSES.input}`}
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <GenericTable
        title="Inscripciones Web"
        data={filteredRegs}
        onDelete={setDeleteConfirmId}
        customActions={(row) => (
          <div className="flex gap-1">
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-2 rounded-xl transition-colors"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </button>
            {row.status === 'Matriculado' && (
              <button
                onClick={() => setEnrollModalOpen(row)}
                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 p-2 rounded-xl transition-colors"
                title="Matricular en sistema"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
            {row.phone && (
              <a
                href={`https://wa.me/${row.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 p-2 rounded-xl inline-flex transition-colors"
                title="Contactar por WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
        columns={[
          {
            header: 'Fecha', field: 'createdAt', render: r => {
              if (!r.createdAt?.seconds) return <Badge variant="neutral">Hoy</Badge>;
              const date = new Date(r.createdAt.seconds * 1000);
              return (
                <div className="flex flex-col">
                  <span className="font-bold">{date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  <span className="text-[10px] opacity-60 font-black">{date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            }
          },
          { header: 'Alumno', field: 'childName', render: r => <span className="font-black uppercase tracking-tight text-xs">{r.childName}</span> },
          { header: 'Apoderado', field: 'parentName', render: r => <span className="text-xs">{r.parentName || '-'}</span> },
          { header: 'Categoría', field: 'category', render: r => <Badge variant="neutral">{r.category}</Badge> },
          { header: 'Contacto', field: 'phone', render: r => <span className="font-mono text-blue-600 dark:text-blue-400">{r.phone}</span> },
          {
            header: 'Estado', field: 'status', render: r => {
              const statusColors = {
                'Pendiente': 'warning',
                'Contactado': 'info',
                'Matriculado': 'success'
              };
              return (
                <div className="relative group/sel translate-y-0.5">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className={`text-[10px] font-black uppercase tracking-wider pl-2 pr-8 py-1 rounded-xl border appearance-none cursor-pointer transition-all ${r.status === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                      r.status === 'Contactado' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      } outline-none focus:ring-2 focus:ring-zinc-400/20`}
                  >
                    <option>Pendiente</option>
                    <option>Contactado</option>
                    <option>Matriculado</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                </div>
              );
            }
          }
        ]}
      />

      {/* Modal de Edición */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Solicitud">
        {editingReg && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Nombre del Alumno</label>
                <input
                  type="text"
                  className={THEME_CLASSES.input}
                  value={editingReg.childName}
                  onChange={(e) => setEditingReg({ ...editingReg, childName: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Nombre del Apoderado</label>
                <input
                  type="text"
                  className={THEME_CLASSES.input}
                  value={editingReg.parentName || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, parentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Categoría</label>
                <input
                  type="text"
                  className={THEME_CLASSES.input}
                  value={editingReg.category}
                  onChange={(e) => setEditingReg({ ...editingReg, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Teléfono</label>
                <input
                  type="text"
                  className={THEME_CLASSES.input}
                  value={editingReg.phone}
                  onChange={(e) => setEditingReg({ ...editingReg, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Estado</label>
                <select
                  className={THEME_CLASSES.input}
                  value={editingReg.status}
                  onChange={(e) => setEditingReg({ ...editingReg, status: e.target.value })}
                >
                  <option>Pendiente</option>
                  <option>Contactado</option>
                  <option>Matriculado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-750 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación de Matriculación */}
      <Modal
        isOpen={enrollModalOpen !== null}
        onClose={() => setEnrollModalOpen(null)}
        title="Confirmar Matriculación"
      >
        {enrollModalOpen && (
          <div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
              ¿Estás seguro de que deseas matricular a <strong className="text-red-600">{enrollModalOpen.childName}</strong>?
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-8 leading-relaxed">
              Esta acción agregará al alumno al directorio oficial y eliminará esta solicitud de la lista.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEnrollModalOpen(null)}
                className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-750 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEnroll(enrollModalOpen)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                Confirmar Matriculación
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirmar Eliminación"
      >
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 font-medium">
          ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer y se perderán los datos de contacto.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-750 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleDeleteWithConfirmation(deleteConfirmId)}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Eliminar Solicitud
          </button>
        </div>
      </Modal>
    </div>
  );
}
