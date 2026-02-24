import React, { useState, useMemo } from 'react';
import { AlertCircle, Search, Trash2, DollarSign, MessageCircle, CheckCircle } from 'lucide-react';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import { MONTHS } from '../../../utils/constants';
import { usePendingPayments } from '../../../hooks/usePendingPayments';
import Badge from '../../shared/Badge';

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Nombre del Alumno</label>
            <input
              type="text"
              placeholder="Buscar..."
              className={THEME_CLASSES.input}
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary} ml-1`}>Filtrar Categoría</label>
            <select
              className={THEME_CLASSES.input}
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
          { header: 'Alumno', field: 'studentName', render: r => <div className="font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{r.studentName}</div> },
          { header: 'Categoría', field: 'category', render: r => <Badge variant="info">{r.category || 'Sin Cat'}</Badge> },
          { header: 'Apoderado', field: 'parent' },
          { header: 'Teléfono', field: 'phone', render: r => <span className="font-mono text-zinc-500">{r.phone}</span> },
          {
            header: 'Motivo', field: 'reason', render: r => (
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{r.reason}</span>
            )
          },
          {
            header: 'Último Pago', field: 'lastPaymentDate', render: r => {
              if (!r.lastPaymentDate) return <span className="text-xs text-zinc-400 italic">Nunca registrado</span>;
              return (
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase text-zinc-700 dark:text-zinc-300">{r.lastPaymentMonth} {r.lastPaymentYear}</span>
                  <span className="text-[10px] text-zinc-500">{r.lastPaymentDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span className="text-[10px] text-rose-600 font-black uppercase mt-0.5">Hace {r.daysSincePayment} días</span>
                </div>
              );
            }
          },
          {
            header: 'Estado', field: 'status', render: r => (
              <Badge variant={r.status === 'Vencido' ? 'error' : 'warning'}>
                {r.status}
              </Badge>
            )
          }
        ]}
      />

      {filteredPendingPayments.length === 0 && (
        <div className={`${THEME_CLASSES.bg.surface} rounded-2xl border ${THEME_CLASSES.border.primary} p-16 text-center shadow-inner mt-4`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-6 font-bold">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className={`text-lg font-black uppercase tracking-tight text-emerald-600 mb-2`}>¡Todo al día!</h3>
          <p className={`${THEME_CLASSES.text.secondary} font-medium max-w-sm mx-auto leading-relaxed`}>
            {filterName || filterCategory
              ? 'No se encontraron registros con los filtros aplicados.'
              : 'Excelente trabajo. No hay alumnos con pagos pendientes o vencidos en este momento.'}
          </p>
        </div>
      )}
    </div>
  );
}
