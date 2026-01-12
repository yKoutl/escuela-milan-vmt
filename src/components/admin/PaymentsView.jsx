import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import GenericTable from './GenericTable';
import { MONTHS } from '../../utils/constants';

export default function PaymentsView({ categories, students, payments, handleAdd, handleDelete, showNotification }) {
  const [selCategory, setSelCategory] = useState('');
  const [selStudent, setSelStudent] = useState('');
  const [selMonth, setSelMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    if (selCategory) {
      setFilteredStudents(students.filter(s => s.category === selCategory));
    } else {
      setFilteredStudents([]);
    }
  }, [selCategory]);

  const handleRegisterPayment = () => {
    if(!selStudent || !selMonth || !amount) { showNotification('Complete todos los campos', 'error'); return; }
   
    handleAdd('payments', {
      studentId: selStudent,
      studentName: selStudent,
      category: selCategory,
      month: selMonth,
      year: new Date().getFullYear(),
      paymentDate: serverTimestamp(),
      amount: amount,
      status: 'Pagado'
    });
    setAmount('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Control de Pagos</h2>
     
      <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
         <h3 className="font-bold mb-4 text-zinc-700 dark:text-zinc-300">Registrar Nuevo Pago (Año Actual: {new Date().getFullYear()})</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">1. Categoría</label>
              <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={selCategory} onChange={e => setSelCategory(e.target.value)}>
                <option value="">Seleccione...</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
           
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">2. Alumno</label>
              <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={selStudent} onChange={e => setSelStudent(e.target.value)} disabled={!selCategory}>
                <option value="">{selCategory ? 'Seleccione Alumno...' : 'Seleccione Categoría primero'}</option>
                {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">3. Mes</label>
              <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={selMonth} onChange={e => setSelMonth(e.target.value)}>
                <option value="">Seleccione...</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex gap-2 items-end">
               <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Monto (S/.)</label>
                  <input type="number" className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
               </div>
               <button onClick={handleRegisterPayment} className="bg-green-600 text-white p-2 rounded h-[42px] px-4 hover:bg-green-700 flex items-center justify-center"><Save className="h-5 w-5"/></button>
            </div>
         </div>
      </div>

      <GenericTable
        title="Historial de Pagos Recientes"
        data={payments}
        onDelete={(id) => handleDelete('payments', id)}
        columns={[
          { header: 'Fecha Pago', field: 'paymentDate', render: r => r.paymentDate?.seconds ? new Date(r.paymentDate.seconds * 1000).toLocaleDateString() + ' ' + new Date(r.paymentDate.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Hoy' },
          { header: 'Alumno', field: 'studentName' },
          { header: 'Concepto', field: 'month', render: r => `${r.month} ${r.year}` },
          { header: 'Monto', field: 'amount', render: r => `S/. ${r.amount}` },
          { header: 'Estado', field: 'status', render: () => <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Pagado</span> }
        ]}
      />
    </div>
  );
}
