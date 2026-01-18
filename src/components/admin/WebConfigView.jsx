import React, { useState } from 'react';
import { Upload, X, Eye, EyeOff, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Modal from '../../shared/Modal';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
import ImagePreviewModal from '../../shared/ImagePreviewModal';

export default function WebConfigView({ 
  news, 
  achievements, 
  schedules, 
  handleAdd, 
  handleDelete, 
  handleUpdate, 
  toggleVisibility,
  handleReorder, // Función para reordenar desde el padre
  showNotification
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // --- MÉTODOS DE APERTURA DE MODAL ---
  const openModal = (type) => { 
    setModalType(type); 
    setFormData({}); 
    setModalOpen(true); 
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setFormData({ ...item }); 
    setModalOpen(true);
  };

  // --- GESTIÓN DE IMÁGENES ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const folder = modalType === 'achievements' ? 'achievements' : 'news';
      const imageUrl = await uploadImage(file, folder);
      setFormData({ ...formData, img: imageUrl });
      showNotification?.('Imagen subida correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showNotification?.('Error al subir imagen: ' + error.message, 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (formData.img) {
      setFormData({ ...formData, img: '' });
    }
  };

  // --- GUARDAR (CREAR O EDITAR) ---
  const handleSave = () => {
    const collectionMap = {
      'news': 'news',
      'events': 'news',
      'achievements': 'achievements',
      'schedules': 'schedules'
    };
    const col = collectionMap[modalType];
    
    const dataToSave = { ...formData };
    
    if(modalType === 'events') { 
        dataToSave.tag = 'Evento'; 
        dataToSave.isEvent = true; 
    }
    
    if (formData.id) {
        if (handleUpdate) {
            handleUpdate(col, formData.id, dataToSave);
        } else {
            console.error("Falta la función handleUpdate");
        }
    } else {
        handleAdd(col, dataToSave);
    }
    
    setModalOpen(false);
    setFormData({});
  };

  const getModalTitle = () => {
    const action = formData.id ? 'Editar' : 'Nuevo';
    const labels = { events: 'Evento', news: 'Noticia', achievements: 'Logro', schedules: 'Horario' };
    return `${action} ${labels[modalType] || 'Item'}`;
  };

  // --- 3. RENDERIZADO DE TABLA (MODIFICADO CON ORDENAMIENTO) ---
  const renderTable = (title, data, columns, collectionName, editType) => (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-white">{title}</h3>
        <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{data.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 uppercase text-xs font-bold">
            <tr>
              {/* Columna extra para Orden */}
              <th className="px-6 py-4 w-16 text-center">Orden</th>
              {columns.map((col, idx) => <th key={idx} className="px-6 py-4">{col.header}</th>)}
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="px-6 py-8 text-center text-zinc-500">No hay datos registrados.</td></tr>
            ) : (
              data.map((item, idx) => ( // Usamos idx para saber la posición
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group">
                  
                  {/* --- NUEVA COLUMNA DE ORDENAMIENTO --- */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {/* Botón SUBIR */}
                        <button 
                            onClick={() => handleReorder && handleReorder(collectionName, idx, 'up')}
                            disabled={idx === 0}
                            className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-zinc-500'}`}
                            title="Subir"
                        >
                            <ArrowUp size={14} />
                        </button>
                        
                        {/* Botón BAJAR */}
                        <button 
                            onClick={() => handleReorder && handleReorder(collectionName, idx, 'down')}
                            disabled={idx === data.length - 1}
                            className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${idx === data.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-zinc-500'}`}
                            title="Bajar"
                        >
                            <ArrowDown size={14} />
                        </button>
                    </div>
                  </td>
                  {/* ------------------------------------- */}

                  {columns.map((col, i) => <td key={i} className="px-6 py-4">{item[col.field]}</td>)}
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(item, editType || collectionName)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>

                      <button 
                        onClick={() => toggleVisibility(collectionName, item.id, item.visible)}
                        className={`p-2 rounded-lg transition ${item.visible !== false ? 'text-green-600 hover:bg-green-50' : 'text-zinc-400 hover:bg-zinc-100'}`}
                        title={item.visible !== false ? "Ocultar" : "Mostrar"}
                      >
                        {item.visible !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>

                      <button 
                        onClick={() => handleDelete(collectionName, item.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
     

      {/* TARJETAS DE ACCESO RÁPIDO */}
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Gestión de Eventos</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Convocatorias y actividades.</p>
              </div>
              <button onClick={() => openModal('events')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700">
                + Nuevo Evento
              </button>
            </div>
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

      {/* TABLA 1: NOTICIAS Y EVENTOS */}
      {renderTable(
        "Todas las Noticias y Eventos",
        news,
        [{header:'Título', field:'title'}, {header:'Etiqueta', field:'tag'}],
        'news',
        'news' 
      )}
      
      {/* TABLA 2: LOGROS */}
      <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
         <h3 className="text-xl font-bold">Logros Deportivos</h3>
         <button onClick={() => openModal('achievements')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-3 py-2 rounded-lg text-sm font-bold">+ Agregar Logro</button>
      </div>
      {renderTable(
        "Logros",
        achievements,
        [{header:'Título', field:'title'}, {header:'Año', field:'year'}],
        'achievements',
        'achievements'
      )}

      {/* TABLA 3: HORARIOS */}
      <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
         <h3 className="text-xl font-bold">Horarios</h3>
         <button onClick={() => openModal('schedules')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-3 py-2 rounded-lg text-sm font-bold">+ Agregar Horario</button>
      </div>
      {renderTable(
        "Horarios",
        schedules,
        [
          {header:'Categoría', field:'cat'}, 
          {header:'Días', field:'days'}, 
          {header:'Horario', field:'time'}
        ],
        'schedules',
        'schedules'
      )}

      {/* MODAL DE FORMULARIO */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={getModalTitle()}
      >
         <div className="space-y-4">
           {/* FORMULARIO: NOTICIAS O EVENTOS */}
           {(modalType === 'news' || modalType === 'events') && (
             <>
               <input className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
               <textarea className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" placeholder="Descripción" rows="3" value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} />
               {modalType === 'news' && <input className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" placeholder="Etiqueta (Ej: Social, Torneo)" value={formData.tag || ''} onChange={e => setFormData({...formData, tag: e.target.value})} />}
               
               <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-4">
                 <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Imagen (Opcional)</label>
                 {formData.img ? (
                   <div className="relative">
                     <img src={formData.img} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                     <div className="absolute top-2 right-2 flex gap-2">
                       <button type="button" onClick={() => setPreviewImage(formData.img)} className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-md hover:bg-zinc-100"><Eye className="h-4 w-4 text-zinc-700" /></button>
                       <button type="button" onClick={handleRemoveImage} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700"><X className="h-4 w-4 text-white" /></button>
                     </div>
                   </div>
                 ) : (
                   <label className="cursor-pointer block">
                     <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                     <div className="flex flex-col items-center py-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition">
                       {uploadingImage ? <span className="text-sm text-zinc-500">Subiendo...</span> : (
                         <>
                           <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                           <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Subir imagen</span>
                         </>
                       )}
                     </div>
                   </label>
                 )}
               </div>
             </>
           )}

           {/* FORMULARIO: LOGROS */}
           {modalType === 'achievements' && (
             <>
               <input className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" placeholder="Título del Logro" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
               <input className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" type="number" placeholder="Año" value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} />
               <input className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" placeholder="Descripción corta" value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} />
               
               <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-4">
                 <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Imagen (Opcional)</label>
                 {formData.img ? (
                   <div className="relative">
                     <img src={formData.img} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                     <div className="absolute top-2 right-2 flex gap-2">
                       <button type="button" onClick={handleRemoveImage} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700"><X className="h-4 w-4 text-white" /></button>
                     </div>
                   </div>
                 ) : (
                   <label className="cursor-pointer block">
                     <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                     <div className="flex flex-col items-center py-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{uploadingImage ? 'Subiendo...' : 'Subir imagen'}</span>
                     </div>
                   </label>
                 )}
               </div>
             </>
           )}

           {/* FORMULARIO: HORARIOS */}
           {modalType === 'schedules' && (
             <>
               <label className="block text-sm font-bold mb-1 text-zinc-700 dark:text-zinc-300">Categoría</label>
               <input 
                 className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 mb-2" 
                 placeholder="Ej: Categoría 2023-2022-2021" 
                 value={formData.cat || ''} 
                 onChange={e => setFormData({...formData, cat: e.target.value})} 
               />

               <label className="block text-sm font-bold mb-1 text-zinc-700 dark:text-zinc-300">Días</label>
               <input 
                 className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 mb-2" 
                 placeholder="Ej: Lun a Vie" 
                 value={formData.days || ''} 
                 onChange={e => setFormData({...formData, days: e.target.value})} 
               />

               <label className="block text-sm font-bold mb-1 text-zinc-700 dark:text-zinc-300">Horario</label>
               <input 
                 className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" 
                 placeholder="Ej: 17:00 - 18:15" 
                 value={formData.time || ''} 
                 onChange={e => setFormData({...formData, time: e.target.value})} 
               />
             </>
           )}

           <button onClick={handleSave} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">
             {formData.id ? 'Guardar Cambios' : 'Crear Registro'}
           </button>
         </div>
      </Modal>

      <ImagePreviewModal
        isOpen={previewImage !== null}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}