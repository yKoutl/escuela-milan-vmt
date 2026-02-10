import React, { useState, useMemo } from 'react';
import { Save, FileText, Download, Edit, Search, X, Trash2, ChevronDown } from 'lucide-react';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import Modal from '../../../shared/Modal';
import PDFReceipt from '../PDFReceipt';
import PDFBatchReport from '../PDFBatchReport';
import { MONTHS } from '../../../utils/constants';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { useCollection } from '../../../hooks/useCollection';

export default function PaymentsView({ categories, handleAdd, handleDelete, handleUpdate, showNotification }) {
  // Datos locales
  const { data: payments, loading, loadMore, hasMore } = usePaginatedQuery('payments', 35);
  const { data: students } = useCollection('students', 'name'); // Carga completa para dropdown (Lazy)

  const [selCategory, setSelCategory] = useState('');
  const [selStudent, setSelStudent] = useState('');
  const [selMonth, setSelMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('Pagado');
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
    if (!selStudent || !selMonth || !amount) { showNotification('Complete todos los campos', 'error'); return; }

    // Crear fecha sin problemas de zona horaria
    const [year, month, day] = paymentDate.split('-');
    const paymentDateObj = new Date(year, month - 1, day, 12, 0, 0);

    handleAdd('payments', {
      studentId: selStudent,
      studentName: selStudent,
      category: selCategory,
      month: selMonth,
      year: new Date().getFullYear(),
      createdAt: serverTimestamp(), // Fecha de registro
      paymentDate: Timestamp.fromDate(paymentDateObj), // Fecha de pago seleccionada
      amount: amount,
      status: paymentStatus
    });
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus('Pagado');
  };

  const handleDeleteWithConfirmation = (id) => {
    handleDelete('payments', id);
    setDeleteConfirmId(null);
  };

  const handleEdit = (payment) => {
    let dateFormatted = new Date().toISOString().split('T')[0];
    if (payment.paymentDate?.seconds) {
      const date = new Date(payment.paymentDate.seconds * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateFormatted = `${year}-${month}-${day}`;
    }

    setEditingPayment({
      ...payment,
      paymentDateFormatted: dateFormatted
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingPayment) return;

    let paymentDate;
    if (editingPayment.paymentDateFormatted) {
      const [year, month, day] = editingPayment.paymentDateFormatted.split('-');
      const dateObj = new Date(year, month - 1, day, 12, 0, 0);
      paymentDate = Timestamp.fromDate(dateObj);
    } else {
      paymentDate = serverTimestamp();
    }

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

  // Filtrar pagos - SOLO EL ÚLTIMO PAGO DE CADA ALUMNO (sin repetir alumnos)
  // EXCLUIR pagos con más de 30 días desde la FECHA DE PAGO (esos van a Pendientes/Vencidos)
  const filteredPayments = useMemo(() => {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Primero agrupar por alumno y obtener solo el más reciente (por paymentDate)
    const latestPaymentsMap = new Map();

    payments.forEach(payment => {
      const studentName = payment.studentName;
      const existing = latestPaymentsMap.get(studentName);

      // Comparar fechas de pago (paymentDate) y quedarnos con el más reciente
      if (!existing) {
        latestPaymentsMap.set(studentName, payment);
      } else {
        const existingDate = existing.paymentDate?.seconds || existing.createdAt?.seconds || 0;
        const currentPaymentDate = payment.paymentDate?.seconds || payment.createdAt?.seconds || 0;

        if (currentPaymentDate > existingDate) {
          latestPaymentsMap.set(studentName, payment);
        }
      }
    });

    // Convertir el Map a array y filtrar los que tienen menos de 30 días DESDE LA FECHA DE PAGO
    const latestPayments = Array.from(latestPaymentsMap.values()).filter(payment => {
      const paymentDateSeconds = payment.paymentDate?.seconds || payment.createdAt?.seconds;
      if (paymentDateSeconds) {
        const paymentDate = new Date(paymentDateSeconds * 1000);
        return paymentDate >= thirtyDaysAgo; // Solo incluir pagos de los últimos 30 días
      }
      return true; // Si no tiene fecha, incluirlo
    });

    // Aplicar filtros
    return latestPayments.filter(payment => {
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Último Pago por Alumno</h2>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Mostrando solo el pago más reciente de cada alumno
        </div>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <h3 className="font-bold mb-4 text-zinc-700 dark:text-zinc-300">Registrar Nuevo Pago (Año Actual: {new Date().getFullYear()})</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">1. Categoría</label>
            <select className={`w-full p-2 rounded border ${THEME_CLASSES.input}`} value={selCategory} onChange={e => setSelCategory(e.target.value)}>
              <option value="">Seleccione...</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">2. Alumno</label>
            <select className={`w-full p-2 rounded border ${THEME_CLASSES.input}`} value={selStudent} onChange={e => setSelStudent(e.target.value)} disabled={!selCategory}>
              <option value="">{selCategory ? 'Seleccione Alumno...' : 'Seleccione Categoría primero'}</option>
              {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">3. Mes</label>
            <select className={`w-full p-2 rounded border ${THEME_CLASSES.input}`} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
              <option value="">Seleccione...</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">4. Fecha de Pago</label>
            <input
              type="date"
              className={`w-full p-2 rounded border ${THEME_CLASSES.input}`}
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">5. Monto (S/.)</label>
            <input type="number" className={`w-full p-2 rounded border ${THEME_CLASSES.input}`} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 mb-1">6. Estado</label>
              <select className={`w-full p-2 rounded border ${THEME_CLASSES.input}`} value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                <option value="Pagado">Pagado</option>
                <option value="Pago Parcial">Pago Parcial</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
            <button onClick={handleRegisterPayment} className="bg-green-600 text-white p-2 rounded h-[42px] px-4 hover:bg-green-700 flex items-center justify-center"><Save className="h-5 w-5" /></button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          <strong>Nota:</strong> "Pago Parcial" permite registrar pagos en múltiples partes. Use "Vencido" para pagos atrasados.
        </p>
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
            className={`p-2 rounded border text-sm ${THEME_CLASSES.input}`}
            value={filterStudentName}
            onChange={e => setFilterStudentName(e.target.value)}
          />
          <select
            className={`p-2 rounded border text-sm ${THEME_CLASSES.input}`}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pagado">Pagado</option>
            <option value="Pago Parcial">Pago Parcial</option>
            <option value="Vencido">Vencido</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <select
            className={`p-2 rounded border text-sm ${THEME_CLASSES.input}`}
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
              className={`p-2 rounded border text-sm w-full ${THEME_CLASSES.input}`}
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Hasta</label>
            <input
              type="date"
              className={`p-2 rounded border text-sm w-full ${THEME_CLASSES.input}`}
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Exportación PDF por estudiante filtrado REMOVIDO: Se movió a Historial */}
      </div>

      <GenericTable
        title="Últimos Pagos Registrados"
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
          {
            header: 'Fecha Registro', field: 'createdAt', render: r => {
              if (!r.createdAt?.seconds) return 'Hoy';
              const date = new Date(r.createdAt.seconds * 1000);
              return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
                date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
            }
          },
          {
            header: 'Fecha Pago', field: 'paymentDate', render: r => {
              if (!r.paymentDate?.seconds) return 'Hoy';
              const date = new Date(r.paymentDate.seconds * 1000);
              return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
          },
          { header: 'Alumno', field: 'studentName' },
          { header: 'Concepto', field: 'month', render: r => `${r.month} ${r.year}` },
          { header: 'Monto', field: 'amount', render: r => `S/. ${r.amount}` },
          {
            header: 'Estado', field: 'status', render: (r) => {
              const statusColors = {
                'Pagado': 'bg-green-100 text-green-800',
                'Pago Parcial': 'bg-yellow-100 text-yellow-800',
                'Vencido': 'bg-red-100 text-red-800',
                'Pendiente': 'bg-orange-100 text-orange-800'
              };
              return (
                <span className={`text-xs px-2 py-1 rounded font-bold ${statusColors[r.status] || 'bg-zinc-100 text-zinc-800'}`}>
                  {r.status || 'Pagado'}
                </span>
              );
            }
          }
        ]}
      />

      {/* --- PAGINACIÓN (50 en 50) --- */}
      <div className="flex flex-col items-center justify-center py-4 gap-2">
        {loading && <p className="text-zinc-500 animate-pulse text-sm">Cargando pagos...</p>}
        {!loading && hasMore && (
          <button
            onClick={loadMore}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-bold text-sm"
          >
            <ChevronDown className="h-4 w-4" /> Ver anteriores (Lote de 50)
          </button>
        )}
        {!hasMore && payments.length > 0 && (
          <p className="text-xs text-zinc-400">No hay más registros.</p>
        )}
      </div>

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
                  className={`w-full p-2 rounded border ${THEME_CLASSES.input}`}
                  value={editingPayment.month}
                  onChange={(e) => setEditingPayment({ ...editingPayment, month: e.target.value })}
                >
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Año</label>
                <input
                  type="number"
                  className={`w-full p-2 rounded border ${THEME_CLASSES.input}`}
                  value={editingPayment.year}
                  onChange={(e) => setEditingPayment({ ...editingPayment, year: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Monto (S/.)</label>
              <input
                type="number"
                step="0.01"
                className={`w-full p-2 rounded border ${THEME_CLASSES.input}`}
                value={editingPayment.amount}
                onChange={(e) => setEditingPayment({ ...editingPayment, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Pago</label>
              <input
                type="date"
                className={`w-full p-2 rounded border ${THEME_CLASSES.input}`}
                value={editingPayment.paymentDateFormatted}
                onChange={(e) => setEditingPayment({ ...editingPayment, paymentDateFormatted: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
              <select
                className={`w-full p-2 rounded border ${THEME_CLASSES.input}`}
                value={editingPayment.status || 'Pagado'}
                onChange={(e) => setEditingPayment({ ...editingPayment, status: e.target.value })}
              >
                <option value="Pagado">Pagado</option>
                <option value="Pago Parcial">Pago Parcial</option>
                <option value="Vencido">Vencido</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                Usa "Pago Parcial" para pagos en múltiples partes
              </p>
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
