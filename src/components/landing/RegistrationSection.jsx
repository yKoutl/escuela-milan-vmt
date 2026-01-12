import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { LOGO_URL } from '../../utils/constants';

export default function RegistrationSection({ user, showNotification }) {
  const [formData, setFormData] = useState({
    childName: '', birthDate: '', parentName: '', phone: '', email: '', category: '2014-2016', notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'registrations'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'Pendiente',
        year: new Date().getFullYear()
      });
      showNotification('¡Pre-inscripción enviada! Te contactaremos.');
      setFormData({ childName: '', birthDate: '', parentName: '', phone: '', email: '', category: '2014-2016', notes: '' });
    } catch (_error) {
      showNotification('Error al enviar.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section id="matricula" className="py-20 bg-gradient-to-br from-red-700 to-red-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors duration-300">
           <div className="md:w-1/3 bg-black text-white p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4">Matrícula 2026</h3>
                <p className="text-zinc-400 text-sm mb-6">Asegura tu vacante en la mejor escuela de SJM. Cupos limitados.</p>
              </div>
              <img src={LOGO_URL} alt="Milan Logo" className="h-24 w-24 mx-auto object-contain" />
           </div>
           <div className="md:w-2/3 p-8">
             <h3 className="text-2xl font-bold text-red-600 mb-6">Formulario de Inscripción</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Nombre Alumno" value={formData.childName} onChange={e=>setFormData({...formData, childName:e.target.value})} />
                  <input required type="date" className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={formData.birthDate} onChange={e=>setFormData({...formData, birthDate:e.target.value})} />
                </div>
                <input required className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Nombre Apoderado" value={formData.parentName} onChange={e=>setFormData({...formData, parentName:e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700" placeholder="Teléfono" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
                  <select className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                    <option value="2017-2019">Sub-6/8 (2017-2019)</option>
                    <option value="2014-2016">Sub-10/12 (2014-2016)</option>
                    <option value="2010-2013">Sub-14/16 (2010-2013)</option>
                    <option value="Arqueros">Arqueros</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition">Enviar</button>
             </form>
           </div>
         </div>
      </div>
    </section>
  );
}
