import React, { useState, useEffect } from 'react';
import { Users, Save, Upload, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
import ImagePreviewModal from '../../shared/ImagePreviewModal';

// Definición de los datos por defecto con los textos solicitados
const DEFAULT_TIERS = [
  { 
    id: '1', 
    name: 'Sponsor Principal', // Antes Gold
    tier: 'gold', 
    logo: '', 
    visible: true,
    description: `Máxima visibilidad y exclusividad

• Logo destacado en uniformes oficiales
• Espacios publicitarios en instalaciones
• Menciones en redes sociales (posts semanales)
• Stand exclusivo en eventos deportivos
• Entradas VIP para todos los partidos
• Acceso a base de datos de familias socias`
  },
  { 
    id: '2', 
    name: 'Sponsor Oficial', // Antes Silver
    tier: 'silver', 
    logo: '', 
    visible: true,
    description: `Excelente presencia y alcance

• Logo en uniformes de entrenamiento
• Banners en instalaciones deportivas
• Menciones en redes sociales (mensuales)
• Stand en eventos principales
• Entradas preferenciales a partidos`
  },
  { 
    id: '3', 
    name: 'Aliado Estratégico', // Antes Bronze
    tier: 'bronze', 
    logo: '', 
    visible: true,
    description: `Visibilidad estratégica y valor

• Logo en página web oficial
• Mención en comunicados institucionales
• Banner en eventos especiales
• Descuentos en productos/servicios para socios`
  }
];

export default function SponsorsView({ showNotification }) {
  const [loading, setLoading] = useState(false);
  const [sponsors, setSponsors] = useState(DEFAULT_TIERS);
  const [uploading, setUploading] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'sponsors');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data().items;
        // Si ya existen datos, los usamos, si no, usamos los default con los textos nuevos
        if (data && data.length > 0) {
            setSponsors(data);
        }
      }
    } catch (error) {
      console.error('Error al cargar sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'sponsors');
      await setDoc(docRef, { items: sponsors });
      showNotification('Auspiciadores actualizados correctamente');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar auspiciadores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (sponsorId, file) => {
    if (!file) return;

    setUploading({ ...uploading, [sponsorId]: true });
    try {
      const sponsorIndex = sponsors.findIndex(s => s.id === sponsorId);
      
      if (sponsors[sponsorIndex].logo) {
        await deleteImage(sponsors[sponsorIndex].logo);
      }

      const imageUrl = await uploadImage(file, 'sponsors');
      
      const newSponsors = [...sponsors];
      newSponsors[sponsorIndex].logo = imageUrl;
      setSponsors(newSponsors);
      
      showNotification('Logo actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploading({ ...uploading, [sponsorId]: false });
    }
  };

  const updateSponsor = (index, field, value) => {
    const newSponsors = [...sponsors];
    newSponsors[index] = { ...newSponsors[index], [field]: value };
    setSponsors(newSponsors);
  };

  // Función para obtener estilos según el nivel (Tier)
  const getTierStyles = (tier) => {
    switch(tier) {
      case 'gold': 
        return {
          container: 'border-yellow-400 dark:border-yellow-600 ring-1 ring-yellow-400 dark:ring-yellow-600 shadow-xl',
          badge: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
          title: 'text-yellow-700 dark:text-yellow-500'
        };
      case 'silver': 
        return {
          container: 'border-zinc-300 dark:border-zinc-600 shadow-lg',
          badge: 'bg-gradient-to-r from-zinc-400 to-zinc-600 text-white',
          title: 'text-zinc-700 dark:text-zinc-300'
        };
      case 'bronze': 
        return {
          container: 'border-amber-700/30 dark:border-amber-700/50 shadow-md',
          badge: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white',
          title: 'text-amber-800 dark:text-amber-500'
        };
      default: return {};
    }
  };

  if (loading && sponsors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
            <Users className="mr-3 text-red-600" />
            Niveles de Auspicio
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Gestiona los niveles, beneficios y logos de tus aliados.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-red-600/20"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </button>
      </div>

      {/* Grid de Sponsors (3 columnas en desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {sponsors.map((sponsor, idx) => {
          const styles = getTierStyles(sponsor.tier);
          
          return (
            <div 
              key={sponsor.id} 
              className={`bg-white dark:bg-zinc-800 rounded-xl p-0 overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${styles.container}`}
            >
              {/* Encabezado de la tarjeta */}
              <div className={`p-4 text-center ${styles.badge}`}>
                <h3 className="text-xl font-black tracking-wide uppercase">
                  {sponsor.name}
                </h3>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Control de Visibilidad */}
                <div className="flex justify-center">
                    <button
                        onClick={() => updateSponsor(idx, 'visible', !sponsor.visible)}
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${
                        sponsor.visible 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                        }`}
                    >
                        <Eye className="h-3 w-3" />
                        {sponsor.visible ? 'Visible al público' : 'Oculto al público'}
                    </button>
                </div>

                {/* Área de Logo (MODIFICADO PARA SER CÍRCULO) */}
                <div className="relative">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 text-center">
                    Logo del Auspiciador
                  </label>
                  
                  {sponsor.logo ? (
                    <div className="relative group w-32 h-32 mx-auto">
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="w-full h-full object-cover rounded-full shadow-md border-4 border-white dark:border-zinc-700 cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => setPreviewImage(sponsor.logo)}
                      />
                      <button
                        onClick={() => updateSponsor(idx, 'logo', '')}
                        className="absolute 0 top-0 -right-2 p-1.5 bg-red-600 rounded-full hover:bg-red-700 shadow-md transition-opacity opacity-0 group-hover:opacity-100 z-10"
                        title="Eliminar logo"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block w-32 h-32 mx-auto">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(sponsor.id, e.target.files[0])}
                        disabled={uploading[sponsor.id]}
                        className="hidden"
                      />
                      <div className="w-full h-full rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-zinc-700/50 transition flex flex-col items-center justify-center group bg-zinc-50 dark:bg-zinc-900">
                        {uploading[sponsor.id] ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-zinc-400 group-hover:text-red-500 transition-colors mb-1" />
                            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-red-600 text-center uppercase leading-tight">Subir<br/>Logo</span>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>

                {/* Edición de Beneficios */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">
                      Beneficios y Descripción
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      Usa • para crear lista
                    </span>
                  </div>
                  <textarea
                    value={sponsor.description}
                    onChange={(e) => updateSponsor(idx, 'description', e.target.value)}
                    rows="12"
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none leading-relaxed"
                    placeholder="Lista de beneficios..."
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      <ImagePreviewModal
        isOpen={previewImage !== null}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}