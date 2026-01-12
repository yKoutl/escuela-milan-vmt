import React, { useState } from 'react';
import GenericTable from './GenericTable';
import Modal from '../../shared/Modal';

export default function WebConfigView({ 
  news, 
  achievements, 
  schedules, 
  handleAdd, 
  handleDelete, 
  toggleVisibility 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const openModal = (type) => { setModalType(type); setFormData({}); setModalOpen(true); };

  const handleSave = () => {
    const collectionMap = {
      'news': 'news',
      'events': 'news',
      'achievements': 'achievements',
      'schedules': 'schedules'
    };
    const col = collectionMap[modalType];
   
    const dataToSave = { ...formData };
    if(modalType === 'events') { dataToSave.tag = 'Evento'; dataToSave.isEvent = true; }
   
    handleAdd(col, dataToSave);
    setModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Configuración Web</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Gestión de Eventos</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Convocatorias y actividades especiales.</p>
              </div>
              <button onClick={() => openModal('events')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700">
                + Nuevo Evento
              </button>
            </div>
            <ul className="space-y-2">
               {news.filter(n => n.tag === 'Evento' || n.tag === 'Convocatoria').slice(0, 3).map(e => (
                 <li key={e.id} className="bg-white dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-sm flex justify-between">
                   <span>{e.title}</span>
                   <span className={`text-xs px-2 py-0.5 rounded ${e.visible !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>{e.visible !== false ? 'Activo' : 'Oculto'}</span>
                 </li>
               ))}
            </ul>
         </div>

         <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Noticias Generales</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Artículos del blog y novedades.</p>
              </div>
              <button onClick={() => openModal('news')} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow hover:bg-red-700">
                + Nueva Noticia
              </button>
            </div>
         </div>
      </div>

      <GenericTable
        title="Todas las Noticias y Eventos"
        data={news}
        collectionName="news"
        onDelete={id => handleDelete('news', id)}
        toggleVisibility={toggleVisibility}
        columns={[{header:'Título', field:'title'}, {header:'Etiqueta', field:'tag'}]}
      />

      <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
         <h3 className="text-xl font-bold">Logros Deportivos</h3>
         <button onClick={() => openModal('achievements')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-3 py-2 rounded-lg text-sm font-bold">+ Agregar Logro</button>
      </div>
      <GenericTable
        title="Logros"
        data={achievements}
        collectionName="achievements"
        onDelete={id => handleDelete('achievements', id)}
        toggleVisibility={toggleVisibility}
        columns={[{header:'Título', field:'title'}, {header:'Año', field:'year'}]}
      />
     
      <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
         <h3 className="text-xl font-bold">Horarios</h3>
         <button onClick={() => openModal('schedules')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-3 py-2 rounded-lg text-sm font-bold">+ Agregar Horario</button>
      </div>
      <GenericTable
        title="Horarios"
        data={schedules}
        collectionName="schedules"
        onDelete={id => handleDelete('schedules', id)}
        toggleVisibility={toggleVisibility}
        columns={[{header:'Categoría', field:'cat'}, {header:'Horario', field:'time'}]}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalType === 'events' ? 'Nuevo Evento' : modalType === 'news' ? 'Nueva Noticia' : modalType === 'achievements' ? 'Nuevo Logro' : 'Nuevo Horario'}>
         <div className="space-y-4">
           {(modalType === 'news' || modalType === 'events') && (
             <>
               <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
               <textarea className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Descripción" rows="3" value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} />
               {modalType === 'news' && <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Etiqueta (Ej: Social, Torneo)" value={formData.tag || ''} onChange={e => setFormData({...formData, tag: e.target.value})} />}
             </>
           )}
           {modalType === 'achievements' && (
             <>
               <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Título del Logro" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
               <input className="w-full p-2 border rounded dark:bg-zinc-800" type="number" placeholder="Año" value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} />
               <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Descripción corta" value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} />
             </>
           )}
           {modalType === 'schedules' && (
             <>
               <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Categoría (Ej: Sub-12)" value={formData.cat || ''} onChange={e => setFormData({...formData, cat: e.target.value})} />
               <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Horario (Ej: Lun-Vie 4pm)" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} />
             </>
           )}
           <button onClick={handleSave} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">Guardar</button>
         </div>
      </Modal>
    </div>
  );
}
