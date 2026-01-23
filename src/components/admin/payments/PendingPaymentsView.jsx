import React, { useState, useMemo } from 'react';
import { AlertCircle, Search, Trash2, DollarSign } from 'lucide-react';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import { MONTHS } from '../../../utils/constants';
import { useCollection } from '../../../hooks/useCollection';

export default function PendingPaymentsView({ showNotification }) {
  // Cargar datos (Lazy Loading: Solo se leen si entra a esta vista)
  const { data: students } = useCollection('students');
  const { data: payments } = useCollection('payments');

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Lógica para detectar pagos pendientes y vencidos
  const pendingPayments = useMemo(() => {
    const studentsWithIssues = [];
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Filtrar solo alumnos activos
    const activeStudents = students.filter(s => s.status === 'Activo');

    activeStudents.forEach(student => {
      // Buscar todos los pagos del alumno
      const studentPayments = payments.filter(p => p.studentName === student.name);

      if (studentPayments.length === 0) {
        // CASO 1: Sin ningún pago registrado
        studentsWithIssues.push({
          id: student.id,
          studentName: student.name,
          category: student.category,
          parent: student.parent,
          phone: student.phone,
          status: 'Pendiente',
          registeredDate: student.createdAt,
          reason: 'Sin pagos'
        });
      } else {
        // CASO 2: Buscar el último pago (por fecha de pago, no por fecha de registro)
        const latestPayment = studentPayments.reduce((latest, current) => {
          const latestDate = latest.paymentDate?.seconds || latest.createdAt?.seconds || 0;
          const currentDate = current.paymentDate?.seconds || current.createdAt?.seconds || 0;
          return currentDate > latestDate ? current : latest;
        });

        // Verificar si pasaron más de 30 días desde el último pago
        // Usar paymentDate primero, si no existe usar createdAt
        const paymentDateSeconds = latestPayment.paymentDate?.seconds || latestPayment.createdAt?.seconds;

        if (paymentDateSeconds) {
          const paymentDate = new Date(paymentDateSeconds * 1000);

          if (paymentDate < thirtyDaysAgo) {
            // El último pago fue hace más de 30 días
            studentsWithIssues.push({
              id: `${student.id}-overdue`,
              studentName: student.name,
              category: student.category,
              parent: student.parent,
              phone: student.phone,
              status: 'Vencido',
              lastPaymentDate: paymentDate,
              lastPaymentMonth: latestPayment.month,
              lastPaymentYear: latestPayment.year,
              daysSincePayment: Math.floor((currentDate - paymentDate) / (1000 * 60 * 60 * 24)),
              reason: 'Último pago vencido'
            });
          }
        }
      }
    });

    return studentsWithIssues;
  }, [students, payments]);

  // Filtrar pagos pendientes
  const filteredPendingPayments = useMemo(() => {
    return pendingPayments.filter(payment => {
      const matchName = !filterName ||
        payment.studentName?.toLowerCase().includes(filterName.toLowerCase());

      const matchCategory = !filterCategory || payment.category === filterCategory;

      return matchName && matchCategory;
    });
  }, [pendingPayments, filterName, filterCategory]);

  const clearFilters = () => {
    setFilterName('');
    setFilterCategory('');
  };

  // Obtener categorías únicas
  const categories = useMemo(() => {
    return [...new Set(students.map(s => s.category))].filter(Boolean);
  }, [students]);

  // Estadísticas
  const totalPending = pendingPayments.filter(p => p.status === 'Pendiente').length;
  const totalOverdue = pendingPayments.filter(p => p.status === 'Vencido').length;
  const activeStudentsCount = students.filter(s => s.status === 'Activo').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
        <AlertCircle className="text-orange-600" />
        Pagos Pendientes y Vencidos
      </h2>

      {/* Estadísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
          <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Total Alumnos Activos</h3>
          <p className="text-4xl font-black text-blue-600 mt-2">{activeStudentsCount}</p>
        </div>
        <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
          <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Sin Pagos</h3>
          <p className="text-4xl font-black text-orange-600 mt-2">{totalPending}</p>
        </div>
        <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
          <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Vencidos (&gt;30 días)</h3>
          <p className="text-4xl font-black text-red-600 mt-2">{totalOverdue}</p>
        </div>
        <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
          <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Total Problemas</h3>
          <p className="text-4xl font-black text-zinc-900 dark:text-white mt-2">{pendingPayments.length}</p>
        </div>
      </div>

      {/* Filtros */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
          />
          <select
            className="p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white text-sm"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <GenericTable
        title="Lista de Alumnos con Pagos Pendientes o Vencidos"
        data={filteredPendingPayments}
        columns={[
          { header: 'Alumno', field: 'studentName', render: r => <div className="font-bold text-zinc-900 dark:text-white">{r.studentName}</div> },
          { header: 'Categoría', field: 'category', render: r => <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{r.category || 'Sin Cat'}</span> },
          { header: 'Apoderado', field: 'parent' },
          { header: 'Teléfono', field: 'phone' },
          {
            header: 'Motivo', field: 'reason', render: r => (
              <span className="text-xs text-zinc-600 dark:text-zinc-400">{r.reason}</span>
            )
          },
          {
            header: 'Último Pago', field: 'lastPaymentDate', render: r => {
              if (!r.lastPaymentDate) return <span className="text-xs text-zinc-400">Nunca</span>;
              return (
                <div>
                  <div className="text-xs font-bold">{r.lastPaymentMonth} {r.lastPaymentYear}</div>
                  <div className="text-xs text-zinc-600">{r.lastPaymentDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div className="text-xs text-red-600 font-bold">Hace {r.daysSincePayment} días</div>
                </div>
              );
            }
          },
          {
            header: 'Estado', field: 'status', render: r => (
              <span className={`text-xs px-2 py-1 rounded font-bold ${r.status === 'Vencido'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-orange-100 text-orange-800'
                }`}>
                {r.status}
              </span>
            )
          }
        ]}
      />

      {filteredPendingPayments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            ¡Excelente! Todos los alumnos están al día con sus pagos.
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
            No hay pagos pendientes ni vencidos
          </p>
        </div>
      )}
    </div>
  );
}
