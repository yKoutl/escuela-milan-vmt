import React, { useState, useEffect } from 'react';
import { Users, Save, Upload, Trash2, Eye } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
import ImagePreviewModal from '../../shared/ImagePreviewModal';

export default function SponsorsView({ showNotification }) {
  const [loading, setLoading] = useState(false);
  const [sponsors, setSponsors] = useState([
    { id: '1', name: 'Sponsor Principal', logo: '', tier: 'gold', description: '', visible: true },
    { id: '2', name: 'Sponsor Oficial', logo: '', tier: 'silver', description: '', visible: true },
    { id: '3', name: 'Aliado Estratégico', logo: '', tier: 'bronze', description: '', visible: true }
  ]);
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
        setSponsors(docSnap.data().items || sponsors);
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
      
      // Eliminar imagen anterior si existe
      if (sponsors[sponsorIndex].logo) {
        await deleteImage(sponsors[sponsorIndex].logo);
      }

      // Subir nueva imagen
      const imageUrl = await uploadImage(file, 'sponsors');
      
      // Actualizar estado
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

  const getTierLabel = (tier) => {
    switch(tier) {
      case 'gold': return 'Sponsor Principal';
      case 'silver': return 'Sponsor Oficial';
      case 'bronze': return 'Aliado Estratégico';
      default: return tier;
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
          <Users className="mr-3 text-red-600" />
          Gestión de Auspiciadores
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </button>
      </div>

      <div className="grid gap-6">
        {sponsors.map((sponsor, idx) => (
          <div key={sponsor.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {getTierLabel(sponsor.tier)}
              </h3>
              <button
                onClick={() => updateSponsor(idx, 'visible', !sponsor.visible)}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                  sponsor.visible 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white'
                }`}
              >
                <Eye className="h-4 w-4" />
                {sponsor.visible ? 'Visible' : 'Oculto'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                {sponsor.logo ? (
                  <div className="relative group">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-full h-48 object-contain bg-zinc-100 dark:bg-zinc-700 rounded-lg"
                      onClick={() => setPreviewImage(sponsor.logo)}
                    />
                    <button
                      onClick={() => {
                        updateSponsor(idx, 'logo', '');
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(sponsor.id, e.target.files[0])}
                      disabled={uploading[sponsor.id]}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 hover:border-red-600 transition text-center h-48 flex flex-col items-center justify-center">
                      {uploading[sponsor.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-3"></div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Subiendo...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                          <p className="font-bold text-zinc-900 dark:text-white mb-1">Subir Logo</p>
                          <p className="text-xs text-zinc-500">JPG, PNG, WEBP</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Datos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={sponsor.name}
                    onChange={(e) => updateSponsor(idx, 'name', e.target.value)}
                    className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={sponsor.description}
                    onChange={(e) => updateSponsor(idx, 'description', e.target.value)}
                    rows="3"
                    className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white resize-none"
                    placeholder="Breve descripción del sponsor..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de vista previa */}
      <ImagePreviewModal
        isOpen={previewImage !== null}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
