import React, { useState, useMemo } from 'react';
import { Upload, X, Eye, EyeOff, Pencil, Trash2, ChevronUp, ChevronDown, Share2, Search } from 'lucide-react';
import Modal from '../../../shared/Modal';
import { uploadImage } from '../../../utils/imageUpload';
import ImagePreviewModal from '../../../shared/ImagePreviewModal';
import Badge from '../../shared/Badge';
import { THEME_CLASSES } from '../../../utils/theme';

export default function WebConfigView({
  news,
  achievements,
  schedules,
  handleAdd,
  handleDelete,
  handleUpdate,
  toggleVisibility,
  handleReorder,
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

  // --- COMPARTIR EN WHATSAPP ---
  const handleShare = async (item) => {
    const SHARE_URL = 'https://escuela-milan-vmt.vercel.app/';
    const MORE_INFO_TEXT = `\n\n📢 Más información aquí: ${SHARE_URL}`;

    const shareData = {
      title: item.title,
      text: `📢 *${item.title.toUpperCase()}*\n\n${item.desc || ''}${item.tag ? `\n🏷️ ${item.tag}` : ''}`,
    };

    let fileShared = false;

    if (item.img) {
      try {
        const response = await fetch(item.img);
        const blob = await response.blob();
        const file = new File([blob], 'milan_share.jpg', { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
          fileShared = true;
        }
      } catch (error) {
        console.warn('No se pudo adjuntar la imagen para compartir:', error);
      }
    }

    if (fileShared) {
      shareData.text += MORE_INFO_TEXT;
    } else {
      shareData.text += MORE_INFO_TEXT;
      shareData.url = SHARE_URL;
    }

    const openWhatsAppFallback = () => {
      const whatsappMessage = encodeURIComponent(`${shareData.text}\n${shareData.url || ''}`);
      window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        openWhatsAppFallback();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Error en compartir nativo, usando fallback:', err);
        openWhatsAppFallback();
      }
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

    if (modalType === 'events') {
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

  // --- RENDERIZADO DE TABLA REUTILIZABLE ---
  const renderTable = (tableTitle, data, columns, collectionName, editType) => (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className={`hidden md:block overflow-hidden rounded-2xl border ${THEME_CLASSES.border.primary} ${THEME_CLASSES.bg.surface} shadow-sm mb-6`}>
        <div className="p-5 border-b dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40">
          <h3 className={`text-md font-black uppercase tracking-tight ${THEME_CLASSES.text.primary}`}>{tableTitle}</h3>
          <Badge variant="info">{data.length} Registros</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`bg-zinc-100/50 dark:bg-zinc-900/50 uppercase text-[10px] font-black tracking-widest ${THEME_CLASSES.text.secondary}`}>
              <tr>
                <th className="px-6 py-4 w-20 text-center">Orden</th>
                {columns.map((col, idx) => <th key={idx} className="px-6 py-4">{col.header}</th>)}
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {data.length === 0 ? (
                <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-zinc-400 italic font-medium">No hay datos registrados.</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${item.visible === false ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleReorder && handleReorder(collectionName, idx, 'up')}
                          disabled={idx === 0}
                          className={`p-1.5 rounded-lg transition-all ${idx === 0 ? 'opacity-10 cursor-not-allowed' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-red-500'}`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleReorder && handleReorder(collectionName, idx, 'down')}
                          disabled={idx === data.length - 1}
                          className={`p-1.5 rounded-lg transition-all ${idx === data.length - 1 ? 'opacity-10 cursor-not-allowed' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-red-500'}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                    {columns.map((col, i) => (
                      <td key={i} className={`px-6 py-4 font-bold ${THEME_CLASSES.text.primary}`}>
                        {col.field === 'tag' ? <Badge variant="neutral">{item[col.field]}</Badge> : item[col.field]}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {collectionName === 'news' && (
                          <button onClick={() => handleShare(item)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-xl transition-colors" title="Compartir">
                            <Share2 size={18} />
                          </button>
                        )}
                        <button onClick={() => handleEdit(item, editType || collectionName)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors" title="Editar">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => toggleVisibility(collectionName, item.id, item.visible)} className={`p-2 rounded-xl transition-all ${item.visible !== false ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                          {item.visible !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button onClick={() => handleDelete(collectionName, item.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors" title="Eliminar">
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

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-3 md:hidden pb-6">
        {data.length === 0 ? (
          <div className={`${THEME_CLASSES.bg.surface} rounded-2xl border ${THEME_CLASSES.border.primary} p-8 text-center text-zinc-400 italic`}>No hay datos.</div>
        ) : (
          data.map((item, idx) => (
            <div key={item.id} className={`${THEME_CLASSES.bg.surface} rounded-2xl border ${THEME_CLASSES.border.primary} p-4 shadow-sm space-y-3 ${item.visible === false ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start border-b dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleReorder && handleReorder(collectionName, idx, 'up')} disabled={idx === 0} className={`p-1 ${idx === 0 ? 'opacity-10' : 'text-red-500'}`}><ChevronUp size={20} /></button>
                    <button onClick={() => handleReorder && handleReorder(collectionName, idx, 'down')} disabled={idx === data.length - 1} className={`p-1 ${idx === data.length - 1 ? 'opacity-10' : 'text-red-500'}`}><ChevronDown size={20} /></button>
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400">Posición {idx + 1}</span>
                </div>
                <div className="flex gap-1">
                  {collectionName === 'news' && <button onClick={() => handleShare(item)} className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-xl"><Share2 size={18} /></button>}
                  <button onClick={() => handleEdit(item, editType || collectionName)} className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl"><Pencil size={18} /></button>
                  <button onClick={() => toggleVisibility(collectionName, item.id, item.visible)} className={`p-2 rounded-xl ${item.visible !== false ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}>{item.visible !== false ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                  <button onClick={() => handleDelete(collectionName, item.id)} className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-xl"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="space-y-2">
                {columns.map((col, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${THEME_CLASSES.text.tertiary}`}>{col.header}</span>
                    <span className={`text-sm font-bold ${THEME_CLASSES.text.primary}`}>
                      {col.field === 'tag' ? <Badge variant="neutral">{item[col.field]}</Badge> : item[col.field]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* TARJETAS DE ACCESO RÁPIDO */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-black text-blue-800 dark:text-blue-300 uppercase tracking-tight">Gestión de Eventos</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Convocatorias y actividades.</p>
            </div>
            <button onClick={() => openModal('events')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">
              + Nuevo Evento
            </button>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-black text-red-800 dark:text-red-300 uppercase tracking-tight">Noticias Generales</h3>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Artículos del blog y novedades.</p>
            </div>
            <button onClick={() => openModal('news')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all active:scale-95">
              + Nueva Noticia
            </button>
          </div>
        </div>
      </div>

      {/* TABLA 1: NOTICIAS Y EVENTOS */}
      {renderTable(
        "Todas las Noticias y Eventos",
        news,
        [{ header: 'Título', field: 'title' }, { header: 'Etiqueta', field: 'tag' }],
        'news',
        'news'
      )}

      {/* TABLA 2: LOGROS */}
      <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
        <h3 className={`text-xl font-black uppercase tracking-tight ${THEME_CLASSES.text.primary}`}>Logros Deportivos</h3>
        <button onClick={() => openModal('achievements')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95">+ Agregar Logro</button>
      </div>
      {renderTable(
        "Logros",
        achievements,
        [{ header: 'Título', field: 'title' }, { header: 'Año', field: 'year' }],
        'achievements',
        'achievements'
      )}

      {/* TABLA 3: HORARIOS */}
      <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
        <h3 className={`text-xl font-black uppercase tracking-tight ${THEME_CLASSES.text.primary}`}>Horarios</h3>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={async () => {
              if (schedules.length > 0 && !window.confirm("Ya tienes horarios. ¿Deseas agregar los predeterminados de todas formas?")) return;
              const { DEFAULT_SCHEDULE } = await import('../../../utils/constants');
              const daysList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
              for (const item of DEFAULT_SCHEDULE) {
                let daysValue = [item.days];
                if (item.days === 'Lunes a Viernes') daysValue = daysList;
                await handleAdd('schedules', {
                  category: item.cat,
                  day: item.days,
                  time: item.time,
                  visible: true,
                  order: parseInt(item.id) || 0,
                  days: daysValue
                });
              }
              showNotification("Horarios importados correctamente (8 Registros)");
            }}
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
          >
            <Upload size={14} /> Importar Default
          </button>

          {schedules.length > 0 && (
            <button
              onClick={async () => {
                if (!window.confirm("¿Estás seguro de ELIMINAR TODOS los horarios? Esta acción no se puede deshacer.")) return;
                for (const item of schedules) await handleDelete('schedules', item.id);
                showNotification("Todos los horarios han sido eliminados");
              }}
              className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
            >
              <Trash2 size={14} /> Eliminar Todos
            </button>
          )}
          <button onClick={() => openModal('schedules')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95">+ Nuevo Horario</button>
        </div>
      </div>
      {renderTable(
        "Horarios",
        schedules,
        [
          { header: 'Día', field: 'day' },
          { header: 'Categoría', field: 'category' },
          { header: 'Horario', field: 'time' }
        ],
        'schedules',
        'schedules'
      )}

      {/* MODAL DE FORMULARIO */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={getModalTitle()}>
        <div className="space-y-4">
          {(modalType === 'news' || modalType === 'events') && (
            <>
              <input className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" placeholder="Descripción" rows="3" value={formData.desc || ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
              {modalType === 'news' && <input className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" placeholder="Etiqueta (Ej: Social, Torneo)" value={formData.tag || ''} onChange={e => setFormData({ ...formData, tag: e.target.value })} />}
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-zinc-500 ml-1">Imagen (Opcional)</label>
                {formData.img ? (
                  <div className="relative">
                    <img src={formData.img} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button type="button" onClick={() => setPreviewImage(formData.img)} className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-md hover:bg-zinc-100"><Eye className="h-4 w-4 text-zinc-700" /></button>
                      <button type="button" onClick={handleRemoveImage} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700"><X className="h-4 w-4 text-white" /></button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                    <div className="flex flex-col items-center py-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition">
                      {uploadingImage ? <span className="text-sm font-bold text-zinc-400 animate-pulse">Subiendo...</span> : (
                        <>
                          <Upload className="h-8 w-8 text-zinc-300 mb-2" />
                          <span className="text-sm font-black uppercase tracking-wider text-zinc-400">Subir imagen</span>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </>
          )}

          {modalType === 'achievements' && (
            <>
              <input className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" placeholder="Título del Logro" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" type="number" placeholder="Año" value={formData.year || ''} onChange={e => setFormData({ ...formData, year: e.target.value })} />
              <input className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" placeholder="Descripción corta" value={formData.desc || ''} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-zinc-500 ml-1">Imagen (Opcional)</label>
                {formData.img ? (
                  <div className="relative">
                    <img src={formData.img} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button type="button" onClick={handleRemoveImage} className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700"><X className="h-4 w-4 text-white" /></button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                    <div className="flex flex-col items-center py-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition">
                      <span className="text-sm font-black uppercase tracking-wider text-zinc-400">{uploadingImage ? 'Subiendo...' : 'Subir imagen'}</span>
                    </div>
                  </label>
                )}
              </div>
            </>
          )}

          {modalType === 'schedules' && (
            <>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Categoría</label>
              <input className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" placeholder="Ej: Categoría 2016-2015" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value, cat: e.target.value })} />
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mt-2">Días de Entrenamiento</label>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                    <button key={day} type="button" onClick={() => {
                      const currentDays = formData.days || [];
                      const newDays = currentDays.includes(day) ? currentDays.filter(d => d !== day) : [...currentDays, day];
                      setFormData({ ...formData, days: newDays });
                    }}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${(formData.days || []).includes(day)
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-red-400'
                        }`}
                    >
                      {day.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({ ...formData, days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] })} className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline">Seleccionar Lun-Vie</button>
                  <button type="button" onClick={() => setFormData({ ...formData, days: [] })} className="text-[10px] font-black text-zinc-500 uppercase tracking-wider hover:underline">Limpiar</button>
                </div>
              </div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mt-2">Horario</label>
              <select className="w-full p-2.5 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-red-500/20 outline-none transition-all" value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })} >
                <option value="">Seleccione horario...</option>
                {["16:00 - 17:15", "16:00 - 17:30", "17:00 - 18:15", "17:30 - 19:00", "17:45 - 19:00", "18:45 - 20:00", "19:45 - 21:00"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}

          <button onClick={handleSave} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20 active:scale-[0.98] mt-4">
            {formData.id ? 'Guardar Cambios' : 'Crear Registro'}
          </button>
        </div>
      </Modal>

      <ImagePreviewModal isOpen={previewImage !== null} imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}