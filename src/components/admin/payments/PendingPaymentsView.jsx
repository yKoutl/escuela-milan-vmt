import React, { useState, useMemo } from 'react';
import { AlertCircle, Search, Trash2, DollarSign, MessageCircle } from 'lucide-react';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import { MONTHS } from '../../../utils/constants';
import { usePendingPayments } from '../../../hooks/usePendingPayments';

export default function PendingPaymentsView({ showNotification }) {
  // Usar el hook personalizado para compartir la lógica con el Dashboard
  const { pendingPayments, students, loading } = usePendingPayments();

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Filtrar pagos pendientes (Lógica visual local)
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
    if (!students) return [];
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
        customActions={(row) => {
          const phone = row.phone?.replace(/\D/g, '');
          const finalPhone = phone?.length === 9 ? `51${phone}` : phone;

          let paymentDetail = '';
          if (row.lastPaymentDate) {
            // Caso Vencido: Mostrar fecha completa
            const dateStr = row.lastPaymentDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            paymentDetail = `Último pago registrado: ${dateStr}`;
          } else {
            // Caso Pendiente (Sin pagos previos): Mensaje de primera mensualidad
            paymentDetail = `Pendiente de realizar el pago de su primera mensualidad`;
          }

          const message = `Hola ${row.parent || ''}, le escribimos de la Escuela Milan para recordarle que el alumno(a) ${row.studentName} presenta: ${row.reason}. ${paymentDetail}. Por favor regularizar.`;

          return (
            <>
              {finalPhone && (
                <a
                  href={`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950 p-2 rounded inline-flex"
                  title="Enviar recordatorio por WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </>
          );
        }}
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
