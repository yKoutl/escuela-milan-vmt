import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, FileText, Download, History } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, appId } from '../../../firebase';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import { MONTHS } from '../../../utils/constants';
import PDFReceipt from '../PDFReceipt';
import PDFBatchReport from '../PDFBatchReport';
import { useCollection } from '../../../hooks/useCollection';

export default function PaymentHistoryView({ showNotification }) {
  // Cargar lista de alumnos para el buscador (Lazy)
  const { data: students } = useCollection('students', 'name');

  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Estado local para los pagos del alumno seleccionado (Busqueda eficiente)
  const [studentPayments, setStudentPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filtrar estudiantes para el autocompletado del buscador
  const filteredStudentsForSearch = useMemo(() => {
    if (!searchStudent) return [];
    return students
      .filter(s => s.name.toLowerCase().includes(searchStudent.toLowerCase()))
      .slice(0, 10);
  }, [students, searchStudent]);

  // Cargar pagos SOLO cuando se selecciona un alumno
  useEffect(() => {
    const fetchStudentPayments = async () => {
      if (!selectedStudent) {
        setStudentPayments([]);
        return;
      }

      setLoadingPayments(true);
      try {
        // Query específica: payments donde studentName == seleccionado
        // NOTA: Esto requiere un índice compuesto si ordenamos. 
        // Para simplificar, traemos los del alumno y ordenamos en cliente (son pocos por alumno)
        const q = query(
          collection(db, 'artifacts', appId, 'public', 'data', 'payments'),
          where('studentName', '==', selectedStudent.name)
        );

        const snapshot = await getDocs(q);
        const paymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordenar por fecha
        paymentsData.sort((a, b) => {
          const dateA = a.paymentDate?.seconds || 0;
          const dateB = b.paymentDate?.seconds || 0;
          return dateB - dateA;
        });

        setStudentPayments(paymentsData);
      } catch (error) {
        console.error("Error loading history:", error);
        showNotification && showNotification("Error cargando historial", "error");
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchStudentPayments();
  }, [selectedStudent]);

  // Filtrado en cliente de los pagos YA cargados
  const filteredPayments = useMemo(() => {
    return studentPayments.filter(payment => {
      const matchMonth = !filterMonth || payment.month === filterMonth;
      const matchYear = !filterYear || payment.year === parseInt(filterYear);
      const matchStatus = !filterStatus || payment.status === filterStatus;
      return matchMonth && matchYear && matchStatus;
    });
  }, [studentPayments, filterMonth, filterYear, filterStatus]);

  // Calcular estadísticas del estudiante
  const stats = useMemo(() => {
    if (!selectedStudent) return null;

    const totalPaid = studentPayments
      .filter(p => p.status === 'Pagado')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const totalPending = studentPayments.filter(p => p.status === 'Vencido' || p.status === 'Pendiente').length;

    return {
      totalPayments: studentPayments.length,
      totalPaid: totalPaid.toFixed(2),
      totalPending
    };
  }, [selectedStudent, studentPayments]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchStudent(student.name);
  };

  const clearSearch = () => {
    setSelectedStudent(null);
    setSearchStudent('');
    setStudentPayments([]);
    setFilterMonth('');
    setFilterYear('');
    setFilterStatus('');
  };

  const clearFilters = () => {
    setFilterMonth('');
    setFilterYear('');
    setFilterStatus('');
  };

  // Obtener años únicos de los pagos cargados
  const availableYears = useMemo(() => {
    const years = [...new Set(studentPayments.map(p => p.year))].filter(Boolean);
    return years.sort((a, b) => b - a);
  }, [studentPayments]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
        <History className="text-blue-600" />
        Historial de Pagos
      </h2>

      {/* Buscador de Alumno */}
      <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-zinc-500" />
          <h3 className="font-bold text-zinc-800 dark:text-white">Buscar Alumno</h3>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Escribe el nombre del alumno..."
            className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
          />

          {searchStudent && !selectedStudent && filteredStudentsForSearch.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {filteredStudentsForSearch.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                >
                  <div className="font-bold text-zinc-900 dark:text-white">{student.name}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {student.category} - {student.parent}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 font-bold"
            >
              Limpiar
            </button>
          )}
        </div>

        {selectedStudent && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{selectedStudent.name}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Categoría: {selectedStudent.category}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Apoderado: {selectedStudent.parent}</p>
              </div>

              {stats && (
                <div className="text-right">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Pagado</div>
                  <div className="text-2xl font-black text-green-600">S/. {stats.totalPaid}</div>
                  <div className="text-xs text-zinc-500 mt-1">{stats.totalPayments} pagos registrados</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filtros adicionales cuando hay un alumno seleccionado */}
      {selectedStudent && (
        <>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-4">
            {/* Headers Filtros... igual que antes */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-zinc-500" />
                <h3 className="font-bold text-zinc-800 dark:text-white">Filtros</h3>
              </div>
              <button onClick={clearFilters} className="text-xs text-red-600 font-bold flex items-center gap-1"><Trash2 className="h-3 w-3" /> Limpiar</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="p-2 rounded border dark:bg-zinc-800 dark:text-white text-sm" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="">Todos los meses</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <select className="p-2 rounded border dark:bg-zinc-800 dark:text-white text-sm" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="">Todos los años</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select className="p-2 rounded border dark:bg-zinc-800 dark:text-white text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="Pagado">Pagado</option>
                <option value="Vencido">Vencido</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          {/* Tabla de Pagos */}
          {loadingPayments ? (
            <p className="text-center py-8">Cargando...</p>
          ) : filteredPayments.length > 0 ? (
            <GenericTable
              title={`Historial de Pagos - ${selectedStudent.name}`}
              data={filteredPayments}
              customActions={(row) => (
                <PDFDownloadLink
                  document={<PDFReceipt payment={row} />}
                  fileName={`boleta-${row.studentName}-${row.month}-${row.year}.pdf`}
                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded inline-flex"
                >
                  {({ loading }) => (loading ? <FileText className="h-4 w-4 animate-pulse" /> : <FileText className="h-4 w-4" />)}
                </PDFDownloadLink>
              )}
              columns={[
                { header: 'Fecha Registro', field: 'createdAt', render: r => r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : 'Hoy' },
                { header: 'Fecha Pago', field: 'paymentDate', render: r => r.paymentDate?.seconds ? new Date(r.paymentDate.seconds * 1000).toLocaleDateString() : 'Hoy' },
                { header: 'Concepto', field: 'month', render: r => `${r.month} ${r.year}` },
                { header: 'Monto', field: 'amount', render: r => `S/. ${r.amount}` },
                { header: 'Estado', field: 'status', render: r => <span className="font-bold">{r.status}</span> }
              ]}
            />
          ) : (
            <div className="bg-zinc-50 p-6 text-center rounded border">No se encontraron pagos.</div>
          )}
        </>
      )}
    </div>
  );
}
