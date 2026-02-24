import React, { useState, useMemo } from 'react';
import { Save, FileText, Download, Edit, Search, X, Trash2, ChevronDown, Share2 } from 'lucide-react';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import Modal from '../../../shared/Modal';
import PDFReceipt from '../PDFReceipt';
import PDFBatchReport from '../PDFBatchReport';
import { MONTHS } from '../../../utils/constants';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { useCollection } from '../../../hooks/useCollection';
import Badge from '../../shared/Badge';

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

  const handleShare = async (payment) => {
    // 1. Intentar compartir PDF
    try {
      const blob = await pdf(<PDFReceipt payment={payment} />).toBlob();
      const file = new File([blob], `Boleta-${payment.studentName}-${payment.month}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Boleta de Pago - Escuela Milan',
          text: `Adjunto boleta de pago de ${payment.studentName}`,
        });
      } else {
        // Si no soporta compartir archivos nativamente (ej: Desktop Chrome)
        showNotification('Tu navegador no soporta compartir archivos directamente. Descarga el PDF y envíalo manualmente.', 'info');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error compartiendo PDF:', error);
        showNotification('Error al intentar compartir el PDF', 'error');
      }
    }
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
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white uppercase tracking-tight">Último Pago por Alumno</h2>
        <Badge variant="neutral">Filtro de 30 días activos</Badge>
      </div>

      <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-2xl border ${THEME_CLASSES.border.primary} shadow-sm`}>
        <h3 className={`font-black uppercase tracking-widest text-[10px] ${THEME_CLASSES.text.tertiary} mb-4`}>Registrar Nuevo Pago (Año Actual: {new Date().getFullYear()})</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5">1. Categoría</label>
            <select className={THEME_CLASSES.input} value={selCategory} onChange={e => setSelCategory(e.target.value)}>
              <option value="">Seleccione...</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5">2. Alumno</label>
            <select className={THEME_CLASSES.input} value={selStudent} onChange={e => setSelStudent(e.target.value)} disabled={!selCategory}>
              <option value="">{selCategory ? 'Alumno...' : '---'}</option>
              {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5">3. Mes</label>
            <select className={THEME_CLASSES.input} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
              <option value="">Mes...</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5">4. Fecha Pago</label>
            <input
              type="date"
              className={THEME_CLASSES.input}
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5">5. Monto (S/.)</label>
            <input type="number" className={THEME_CLASSES.input} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5">6. Estado</label>
            <div className="flex gap-2">
              <select className={THEME_CLASSES.input} value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                <option value="Pagado">Pagado</option>
                <option value="Pago Parcial">Pago Parcial</option>
                <option value="Vencido">Vencido</option>
              </select>
              <button
                onClick={handleRegisterPayment}
                className="bg-red-600 text-white p-2.5 rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 active:scale-90 transition-all"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className={`${THEME_CLASSES.bg.surface} rounded-2xl shadow-sm border ${THEME_CLASSES.border.primary} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600 drop-shadow-sm">
            <Search className="h-4 w-4" />
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Filtros de Búsqueda</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors uppercase tracking-widest"
          >
            <Trash2 className="h-3 w-3" /> Limpiar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Alumno..."
            className={THEME_CLASSES.input}
            value={filterStudentName}
            onChange={e => setFilterStudentName(e.target.value)}
          />
          <select
            className={THEME_CLASSES.input}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Estados...</option>
            <option value="Pagado">Pagado</option>
            <option value="Pago Parcial">Pago Parcial</option>
            <option value="Vencido">Vencido</option>
            <option value="Pendiente">Pendiente</option>
          </select>
          <select
            className={THEME_CLASSES.input}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">Meses...</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="date"
            className={THEME_CLASSES.input}
            value={filterStartDate}
            onChange={e => setFilterStartDate(e.target.value)}
          />
          <input
            type="date"
            className={THEME_CLASSES.input}
            value={filterEndDate}
            onChange={e => setFilterEndDate(e.target.value)}
          />
        </div>
      </div>

      <GenericTable
        title="Últimos Pagos Registrados"
        data={filteredPayments}
        onDelete={setDeleteConfirmId}
        customActions={(row) => (
          <>
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-2 rounded-xl inline-flex transition-all"
              title="Editar pago"
            >
              <Edit className="h-4 w-4" />
            </button>

            <PDFDownloadLink
              document={<PDFReceipt payment={row} />}
              fileName={`boleta-${row.studentName}-${row.month}-${row.year}.pdf`}
              className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 p-2 rounded-xl inline-flex ml-1 transition-all"
              title="Descargar/Ver Boleta"
            >
              {({ loading }) => (loading ? <FileText className="h-4 w-4 animate-pulse" /> : <FileText className="h-4 w-4" />)}
            </PDFDownloadLink>

            <button
              onClick={() => handleShare(row)}
              className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 p-2 rounded-xl inline-flex ml-1 transition-all"
              title="Compartir Boleta"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </>
        )}
        columns={[
          {
            header: 'Fecha Reg', field: 'createdAt', render: r => {
              if (!r.createdAt?.seconds) return <Badge variant="neutral">Hoy</Badge>;
              const date = new Date(r.createdAt.seconds * 1000);
              return (
                <div className="flex flex-col">
                  <span className="font-bold text-xs">{date.toLocaleDateString('es-PE')}</span>
                  <span className="text-[10px] opacity-50 font-black">{date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            }
          },
          {
            header: 'Fecha Pago', field: 'paymentDate', render: r => {
              if (!r.paymentDate?.seconds) return <Badge variant="neutral">Hoy</Badge>;
              const date = new Date(r.paymentDate.seconds * 1000);
              return <span className="text-xs font-bold text-zinc-600">{date.toLocaleDateString('es-PE')}</span>;
            }
          },
          { header: 'Categoría', field: 'category', render: r => <Badge variant="info">{r.category || '-'}</Badge> },
          { header: 'Alumno', field: 'studentName', render: r => <div className="font-black uppercase tracking-tight text-xs">{r.studentName}</div> },
          { header: 'Concepto', field: 'month', render: r => <span className="text-xs font-bold">{r.month} {r.year}</span> },
          { header: 'Monto', field: 'amount', render: r => <span className="font-black text-rose-600">S/. {r.amount}</span> },
          {
            header: 'Estado', field: 'status', render: (r) => {
              let variant = 'neutral';
              if (r.status === 'Pagado') variant = 'success';
              if (r.status === 'Pago Parcial') variant = 'info';
              if (r.status === 'Vencido') variant = 'error';
              if (r.status === 'Pendiente') variant = 'warning';
              return <Badge variant={variant}>{r.status || 'Pagado'}</Badge>;
            }
          }
        ]}
      />

      {/* --- PAGINACIÓN --- */}
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />}
        {!loading && hasMore && (
          <button
            onClick={loadMore}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-all font-black text-xs uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            <ChevronDown className="h-4 w-4" /> Cargar más registros
          </button>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Eliminar Registro"
      >
        <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
          ¿Estás seguro de que deseas eliminar este registro de pago? Esta acción es irreversible y afectará los reportes financieros.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleDeleteWithConfirmation(deleteConfirmId)}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Eliminar permanentemente
          </button>
        </div>
      </Modal>

      {/* Modal de Edición de Pago */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Pago">
        {editingPayment && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Alumno</label>
              <div className="w-full p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-bold text-sm">
                {editingPayment.studentName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Mes</label>
                <select
                  className={THEME_CLASSES.input}
                  value={editingPayment.month}
                  onChange={(e) => setEditingPayment({ ...editingPayment, month: e.target.value })}
                >
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Año</label>
                <input
                  type="number"
                  className={THEME_CLASSES.input}
                  value={editingPayment.year}
                  onChange={(e) => setEditingPayment({ ...editingPayment, year: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Monto (S/.)</label>
                <input
                  type="number"
                  step="0.01"
                  className={THEME_CLASSES.input}
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment({ ...editingPayment, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Estado</label>
                <select
                  className={THEME_CLASSES.input}
                  value={editingPayment.status || 'Pagado'}
                  onChange={(e) => setEditingPayment({ ...editingPayment, status: e.target.value })}
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pago Parcial">Pago Parcial</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1.5">Fecha de Pago</label>
              <input
                type="date"
                className={THEME_CLASSES.input}
                value={editingPayment.paymentDateFormatted}
                onChange={(e) => setEditingPayment({ ...editingPayment, paymentDateFormatted: e.target.value })}
              />
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
    </div>
  );
}
