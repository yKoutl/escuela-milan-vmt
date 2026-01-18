import React, { useState, useMemo } from 'react';
import { Save, FileText, Download, Edit, Search, X,Trash2 } from 'lucide-react';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { THEME_CLASSES } from '../../utils/theme';
import GenericTable from './GenericTable';
import Modal from '../../shared/Modal';
import PDFReceipt from './PDFReceipt';
import PDFBatchReport from './PDFBatchReport';
import { MONTHS } from '../../utils/constants';

export default function PaymentsView({ categories, students, payments, handleAdd, handleDelete, handleUpdate, showNotification }) {
  const [selCategory, setSelCategory] = useState('');
  const [selStudent, setSelStudent] = useState('');
  const [selMonth, setSelMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Filtros avanzados
  const [filterStudentName, setFilterStudentName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // Estado para edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Filtrar estudiantes por categoría seleccionada
  const filteredStudents = useMemo(() => {
    if (!selCategory) return [];
    return students.filter(s => s.category === selCategory);
  }, [selCategory, students]);

  const handleRegisterPayment = () => {
    if(!selStudent || !selMonth || !amount) { showNotification('Complete todos los campos', 'error'); return; }
   
    handleAdd('payments', {
      studentId: selStudent,
      studentName: selStudent,
      category: selCategory,
      month: selMonth,
      year: new Date().getFullYear(),
      createdAt: serverTimestamp(), // Fecha de registro
      paymentDate: serverTimestamp(), // Fecha de pago
      amount: amount,
      status: 'Pagado'
    });
    setAmount('');
  };

  const handleDeleteWithConfirmation = (id) => {
    handleDelete('payments', id);
    setDeleteConfirmId(null);
  };

  const handleEdit = (payment) => {
    setEditingPayment({
      ...payment,
      paymentDateFormatted: payment.paymentDate?.seconds 
        ? new Date(payment.paymentDate.seconds * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingPayment) return;
    
    const paymentDate = editingPayment.paymentDateFormatted 
      ? Timestamp.fromDate(new Date(editingPayment.paymentDateFormatted))
      : serverTimestamp();
    
    await handleUpdate('payments', editingPayment.id, {
      amount: editingPayment.amount,
      paymentDate: paymentDate,
      status: editingPayment.status,
      month: editingPayment.month,
      year: editingPayment.year
    });
    
    setEditModalOpen(false);
    setEditingPayment(null);
  };

  const clearFilters = () => {
    setFilterStudentName('');
    setFilterStatus('');
    setFilterMonth('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Filtrar pagos
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchName = !filterStudentName || 
        payment.studentName?.toLowerCase().includes(filterStudentName.toLowerCase());
      
      const matchStatus = !filterStatus || payment.status === filterStatus;
      
      const matchMonth = !filterMonth || payment.month === filterMonth;
      
      let matchDate = true;
      if ((filterStartDate || filterEndDate) && payment.paymentDate?.seconds) {
        const payDate = new Date(payment.paymentDate.seconds * 1000);
        if (filterStartDate) {
          matchDate = matchDate && payDate >= new Date(filterStartDate);
        }
        if (filterEndDate) {
          const endDate = new Date(filterEndDate);
          endDate.setHours(23, 59, 59, 999);
          matchDate = matchDate && payDate <= endDate;
        }
      }
      
      return matchName && matchStatus && matchMonth && matchDate;
    });
  }, [payments, filterStudentName, filterStatus, filterMonth, filterStartDate, filterEndDate]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Control de Pagos</h2>
     
      <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
         <h3 className="font-bold mb-4 text-zinc-700 dark:text-zinc-300">Registrar Nuevo Pago (Año Actual: {new Date().getFullYear()})</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">1. Categoría</label>
              <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={selCategory} onChange={e => setSelCategory(e.target.value)}>
                <option value="">Seleccione...</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
           
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">2. Alumno</label>
              <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={selStudent} onChange={e => setSelStudent(e.target.value)} disabled={!selCategory}>
                <option value="">{selCategory ? 'Seleccione Alumno...' : 'Seleccione Categoría primero'}</option>
                {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">3. Mes</label>
              <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={selMonth} onChange={e => setSelMonth(e.target.value)}>
                <option value="">Seleccione...</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex gap-2 items-end">
               <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Monto (S/.)</label>
                  <input type="number" className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
               </div>
               <button onClick={handleRegisterPayment} className="bg-green-600 text-white p-2 rounded h-[42px] px-4 hover:bg-green-700 flex items-center justify-center"><Save className="h-5 w-5"/></button>
            </div>
         </div>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-4">
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre de alumno..."
            className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
            value={filterStudentName}
            onChange={e => setFilterStudentName(e.target.value)}
          />
          <select
            className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Atrasado">Atrasado</option>
          </select>
          <select
            className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">Todos los meses</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
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
        
        {/* Exportación PDF por estudiante filtrado */}
        {filterStudentName && filteredPayments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <PDFDownloadLink
              document={<PDFBatchReport 
                studentName={filterStudentName} 
                payments={filteredPayments}
                category={filteredPayments[0]?.category}
              />}
              fileName={`reporte-${filterStudentName}-${new Date().toLocaleDateString('es-PE')}.pdf`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-blue-700 font-bold text-sm"
            >
              {({ loading }) => (loading ? 'Generando...' : <><Download className="h-4 w-4 mr-2"/> Exportar PDF del Alumno Filtrado</>)}
            </PDFDownloadLink>
          </div>
        )}
      </div>

      <GenericTable
        title="Historial de Pagos Recientes"
        data={filteredPayments}
        onDelete={setDeleteConfirmId}
        customActions={(row) => (
          <>
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded inline-flex"
              title="Editar pago"
            >
              <Edit className="h-4 w-4" />
            </button>
            <PDFDownloadLink
              document={<PDFReceipt payment={row} />}
              fileName={`boleta-${row.studentName}-${row.month}-${row.year}.pdf`}
              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded inline-flex"
            >
              {({ loading }) => (
                loading ? <FileText className="h-4 w-4 animate-pulse" /> : <FileText className="h-4 w-4" />
              )}
            </PDFDownloadLink>
          </>
        )}
        columns={[
          { header: 'Fecha Registro', field: 'createdAt', render: r => {
            if (!r.createdAt?.seconds) return 'Hoy';
            const date = new Date(r.createdAt.seconds * 1000);
            return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                   date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          }},
          { header: 'Fecha Pago', field: 'paymentDate', render: r => {
            if (!r.paymentDate?.seconds) return 'Hoy';
            const date = new Date(r.paymentDate.seconds * 1000);
            return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                   date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          }},
          { header: 'Alumno', field: 'studentName' },
          { header: 'Concepto', field: 'month', render: r => `${r.month} ${r.year}` },
          { header: 'Monto', field: 'amount', render: r => `S/. ${r.amount}` },
          { header: 'Estado', field: 'status', render: (r) => <span className={`text-xs px-2 py-1 rounded ${r.status === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status || 'Pagado'}</span> }
        ]}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal 
        isOpen={deleteConfirmId !== null} 
        onClose={() => setDeleteConfirmId(null)}
        title="Confirmar Eliminación"
      >
        <p className="text-zinc-700 dark:text-zinc-300 mb-6">
          ¿Estás seguro de que deseas eliminar este registro de pago? Esta acción no se puede deshacer.
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

      {/* Modal de Edición de Pago */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Pago">
        {editingPayment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Alumno</label>
              <input
                type="text"
                className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white bg-zinc-100 cursor-not-allowed"
                value={editingPayment.studentName}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Mes</label>
                <select
                  className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  value={editingPayment.month}
                  onChange={(e) => setEditingPayment({...editingPayment, month: e.target.value})}
                >
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Año</label>
                <input
                  type="number"
                  className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  value={editingPayment.year}
                  onChange={(e) => setEditingPayment({...editingPayment, year: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Monto (S/.)</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                value={editingPayment.amount}
                onChange={(e) => setEditingPayment({...editingPayment, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Pago</label>
              <input
                type="date"
                className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                value={editingPayment.paymentDateFormatted}
                onChange={(e) => setEditingPayment({...editingPayment, paymentDateFormatted: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
              <select
                className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                value={editingPayment.status || 'Pagado'}
                onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})}
              >
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Atrasado">Atrasado</option>
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
    </div>
  );
}
