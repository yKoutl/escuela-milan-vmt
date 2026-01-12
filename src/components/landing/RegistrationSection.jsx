import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { LOGO_URL } from '../../utils/constants';

export default function RegistrationSection({ user, showNotification }) {
  const [formData, setFormData] = useState({
    childName: '', birthDate: '', parentName: '', phone: '', email: '', category: '2017-2019', notes: ''
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
      setFormData({ childName: '', birthDate: '', parentName: '', phone: '', email: '', category: '2017-2019', notes: '' });
    } catch (_error) {
      showNotification('Error al enviar.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section id="matricula" className="pt-20 bg-gradient-to-br from-red-700 to-red-900 text-white">

  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* CARD */}
    <div className="relative z-20 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md 
    text-zinc-900 dark:text-white rounded-2xl shadow-2xl 
    overflow-hidden flex flex-col md:flex-row transition-colors duration-300">
      <div className="md:w-1/3 bg-black/60 text-white p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4">Matrícula 2026</h3>
                <p className="text-zinc-400 text-sm mb-6">Asegura tu vacante en la mejor escuela de SJM. Cupos limitados.</p>
              </div>
<img
  src={LOGO_URL}
  alt="Milan Logo"
  className="h-40 w-40 mx-auto object-contain"
/>
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
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition">Enviar</button>
             </form>
           </div>
         </div>
      </div>
      {/* SVG SIN MODIFICAR */}
  <svg xmlns="http://www.w3.org/2000/svg" className="w-full -mt-60 relative z-0" viewBox="0 0 1440 320">
    <path fill="#27272A">
      <animate 
        attributeName="d"
        dur="6s"
        repeatCount="indefinite"
        values="
        M0,32L18.5,53.3C36.9,75,74,117,111,128C147.7,139,185,117,222,117.3C258.5,117,295,139,332,160C369.2,181,406,203,443,197.3C480,192,517,160,554,170.7C590.8,181,628,235,665,234.7C701.5,235,738,181,775,176C812.3,171,849,213,886,234.7C923.1,256,960,256,997,256C1033.8,256,1071,256,1108,256C1144.6,256,1182,256,1218,213.3C1255.4,171,1292,85,1329,64C1366.2,43,1403,85,1422,106.7L1440,128L1440,320L0,320Z;

        M0,64L18.5,74.7C36.9,85,74,107,111,128C147.7,149,185,171,222,176C258.5,181,295,171,332,160C369.2,149,406,139,443,144C480,149,517,171,554,176C590.8,181,628,171,665,160C701.5,149,738,139,775,149.3C812.3,160,849,192,886,202.7C923.1,213,960,203,997,192C1033.8,181,1071,171,1108,165.3C1144.6,160,1182,160,1218,165.3C1255.4,171,1292,181,1329,181.3C1366.2,181,1403,171,1422,165.3L1440,160L1440,320L0,320Z;

        M0,32L18.5,53.3C36.9,75,74,117,111,128C147.7,139,185,117,222,117.3C258.5,117,295,139,332,160C369.2,181,406,203,443,197.3C480,192,517,160,554,170.7C590.8,181,628,235,665,234.7C701.5,235,738,181,775,176C812.3,171,849,213,886,234.7C923.1,256,960,256,997,256C1033.8,256,1071,256,1108,256C1144.6,256,1182,256,1218,213.3C1255.4,171,1292,85,1329,64C1366.2,43,1403,85,1422,106.7L1440,128L1440,320L0,320Z;
        "
      />
    </path>
  </svg>

    </section>
  );
}
