import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import GenericTable from './GenericTable';

export default function RequestsView({ handleDelete, showNotification }) {
  const [regs, setRegs] = useState([]);
  
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'registrations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setRegs(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, []);

  const updateStatus = async (id, val) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registrations', id), { status: val });
    showNotification('Estado actualizado');
  };

  return (
    <div>
       <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">Solicitudes de Matrícula</h2>
       <GenericTable
         title="Inscripciones Web"
         data={regs}
         onDelete={id => handleDelete('registrations', id)}
         columns={[
           { header: 'Fecha', field: 'createdAt', render: r => r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() + ' ' + new Date(r.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-' },
           { header: 'Alumno', field: 'childName' },
           { header: 'Categoría', field: 'category' },
           { header: 'Contacto', field: 'phone' },
           { header: 'Estado', field: 'status', render: r => (
              <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs p-1 rounded border dark:bg-zinc-800">
                <option>Pendiente</option><option>Contactado</option><option>Matriculado</option>
              </select>
           )}
         ]}
       />
    </div>
  );
}
