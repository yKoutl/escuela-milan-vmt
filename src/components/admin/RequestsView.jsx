import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Edit, UserPlus, MessageCircle, Search, X } from 'lucide-react';
import { db, appId } from '../../firebase';
import GenericTable from './GenericTable';
import Modal from '../../shared/Modal';

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
    const unsub = onSnapshot(q, snap => setRegs(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, []);

  const updateStatus = async (id, val) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registrations', id), { status: val });
    showNotification('Estado actualizado');
  };

  const handleEdit = (reg) => {
    setEditingReg({...reg});
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
       <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Solicitudes de Matrícula</h2>
       
       {/* Barra de Filtros */}
       <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-4">
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             <Search className="h-5 w-5 text-zinc-500" />
             <h3 className="font-bold text-zinc-800 dark:text-white">Filtros de Búsqueda</h3>
           </div>
           <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1">
             <X className="h-3 w-3" /> Limpiar
           </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
           <input
             type="text"
             placeholder="Buscar por nombre..."
             className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
             value={filterName}
             onChange={e => setFilterName(e.target.value)}
           />
           <select
             className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="">Todos los estados</option>
             <option value="Pendiente">Pendiente</option>
             <option value="Contactado">Contactado</option>
             <option value="Matriculado">Matriculado</option>
           </select>
           <select
             className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
             value={filterMonth}
             onChange={e => setFilterMonth(e.target.value)}
           >
             <option value="">Todos los meses</option>
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
           <div>
             <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Desde</label>
             <input
               type="date"
               className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm w-full"
               value={filterStartDate}
               onChange={e => setFilterStartDate(e.target.value)}
             />
           </div>
           <div>
             <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Hasta</label>
             <input
               type="date"
               className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm w-full"
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
           <>
             <button
               onClick={() => handleEdit(row)}
               className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded"
               title="Editar"
             >
               <Edit className="h-4 w-4" />
             </button>
             {row.status === 'Matriculado' && (
               <button
                 onClick={() => setEnrollModalOpen(row)}
                 className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950 p-2 rounded"
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
                 className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950 p-2 rounded inline-flex"
                 title="Contactar por WhatsApp"
               >
                 <MessageCircle className="h-4 w-4" />
               </a>
             )}
           </>
         )}
         columns={[
           { header: 'Fecha', field: 'createdAt', render: r => {
             if (!r.createdAt?.seconds) return '-';
             const date = new Date(r.createdAt.seconds * 1000);
             return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                    date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
           }},
           { header: 'Alumno', field: 'childName' },
           { header: 'Nombre del Apoderado', field: 'parentName', render: r => r.parentName || 'Sin especificar' },
           { header: 'Categoría', field: 'category' },
           { header: 'Contacto', field: 'phone' },
           { header: 'Estado', field: 'status', render: r => (
              <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs p-1 rounded border dark:bg-zinc-800">
                <option>Pendiente</option><option>Contactado</option><option>Matriculado</option>
              </select>
           )}
         ]}
       />

       {/* Modal de Edición */}
       <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Solicitud">
         {editingReg && (
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Alumno</label>
               <input
                 type="text"
                 className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                 value={editingReg.childName}
                 onChange={(e) => setEditingReg({...editingReg, childName: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombre del Apoderado</label>
               <input
                 type="text"
                 className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                 value={editingReg.parentName || ''}
                 onChange={(e) => setEditingReg({...editingReg, parentName: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Categoría</label>
               <input
                 type="text"
                 className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                 value={editingReg.category}
                 onChange={(e) => setEditingReg({...editingReg, category: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Teléfono</label>
               <input
                 type="text"
                 className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                 value={editingReg.phone}
                 onChange={(e) => setEditingReg({...editingReg, phone: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
               <input
                 type="email"
                 className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                 value={editingReg.email || ''}
                 onChange={(e) => setEditingReg({...editingReg, email: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
               <select
                 className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                 value={editingReg.status}
                 onChange={(e) => setEditingReg({...editingReg, status: e.target.value})}
               >
                 <option>Pendiente</option>
                 <option>Contactado</option>
                 <option>Matriculado</option>
               </select>
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

       {/* Modal de Confirmación de Matriculación */}
       <Modal 
         isOpen={enrollModalOpen !== null} 
         onClose={() => setEnrollModalOpen(null)}
         title="Confirmar Matriculación"
       >
         {enrollModalOpen && (
           <div>
             <p className="text-zinc-700 dark:text-zinc-300 mb-4">
               ¿Estás seguro de que deseas matricular a <strong>{enrollModalOpen.childName}</strong>?
             </p>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
               Esta acción agregará al alumno al directorio y eliminará esta solicitud de la lista.
             </p>
             <div className="flex justify-end gap-3">
               <button
                 onClick={() => setEnrollModalOpen(null)}
                 className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 font-bold"
               >
                 Cancelar
               </button>
               <button
                 onClick={() => handleEnroll(enrollModalOpen)}
                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
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
         <p className="text-zinc-700 dark:text-zinc-300 mb-6">
           ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.
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
