import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase'; // Ajusta la ruta a tu firebase.js si es diferente
import { uploadImage, deleteImage } from '../../utils/imageUpload'; // Ajusta la ruta a tu servicio
import ImagePreviewModal from '../../shared/ImagePreviewModal';

export default function SiteImagesView({ showNotification }) {
  const [loading, setLoading] = useState(false);
  const [siteImages, setSiteImages] = useState({
    heroImage: '',
    carouselImages: [],
    announcementImage: '',
    announcementEnabled: false
  });
  const [previewImage, setPreviewImage] = useState(null);
  
  // Estados de carga independientes
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const [uploadingAnnouncement, setUploadingAnnouncement] = useState(false);
  
  // Estado para bloquear botones mientras se reordena
  const [reordering, setReordering] = useState(false);

  // Cargar imágenes al iniciar
  useEffect(() => {
    loadSiteImages();
  }, []);

  const loadSiteImages = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteImages({
          heroImage: data.heroImage || '',
          // Aseguramos que siempre sea un array
          carouselImages: Array.isArray(data.carouselImages) ? data.carouselImages : [],
          announcementImage: data.announcementImage || '',
          announcementEnabled: data.announcementEnabled || false
        });
      }
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      showNotification?.('Error al cargar imágenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN DE REORDENAMIENTO ---
  const handleMoveImage = async (index, direction) => {
    if (reordering) return;
    
    const newImages = [...siteImages.carouselImages];
    
    // Lógica de intercambio (Swap)
    if (direction === 'left' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    } else {
      return;
    }

    setReordering(true);
    try {
      // Actualización optimista (UI primero)
      setSiteImages(prev => ({ ...prev, carouselImages: newImages }));

      // Guardar solo el array en Firestore
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      await setDoc(docRef, { carouselImages: newImages }, { merge: true });
      
    } catch (error) {
      console.error("Error al mover:", error);
      showNotification("Error al reordenar imagen", "error");
      // Revertir cambios si falla (recargando datos)
      loadSiteImages();
    } finally {
      setReordering(false);
    }
  };

  // --- SUBIDA HERO ---
  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      if (siteImages.heroImage) {
        await deleteImage(siteImages.heroImage);
      }

      const imageUrl = await uploadImage(file, 'hero');
      if (!imageUrl) throw new Error("Error al subir la imagen");

      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, heroImage: imageUrl };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification('Imagen del Hero actualizada');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  // --- SUBIDA CARRUSEL (MÚLTIPLE) ---
  const handleCarouselUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingCarousel(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file, 'carousel'));
      const rawUrls = await Promise.all(uploadPromises);
      
      // Filtrar errores (nulls)
      const validUrls = rawUrls.filter(url => url !== null);

      if (validUrls.length === 0) throw new Error("No se pudo subir ninguna imagen.");
      
      const newCarouselImages = [...siteImages.carouselImages, ...validUrls];
      
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, carouselImages: newCarouselImages };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification(`${validUrls.length} imagen(es) agregada(s)`);

      if (validUrls.length < files.length) {
         showNotification(`${files.length - validUrls.length} imágenes fallaron`, 'warning');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploadingCarousel(false);
      e.target.value = '';
    }
  };

  // --- BORRAR IMAGEN CARRUSEL ---
  const handleDeleteCarouselImage = async (imageUrl, index) => {
    if (!confirm('¿Eliminar esta imagen del carrusel?')) return;

    try {
      await deleteImage(imageUrl);
      
      const newCarouselImages = siteImages.carouselImages.filter((_, i) => i !== index);
      
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, carouselImages: newCarouselImages };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification('Imagen eliminada');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar imagen', 'error');
    }
  };

  // --- BORRAR HERO ---
  const handleDeleteHero = async () => {
    if (!confirm('¿Eliminar la imagen del Hero?')) return;

    try {
      await deleteImage(siteImages.heroImage);
      
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, heroImage: '' };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification('Imagen del Hero eliminada');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar imagen', 'error');
    }
  };

  if (loading) {
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
          <ImageIcon className="mr-3 text-red-600" />
          Imágenes del Sitio
        </h2>
      </div>

      {/* --- SECCIÓN 1: HERO IMAGE --- */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Imagen Principal (Hero)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview Hero */}
          <div>
            {siteImages.heroImage ? (
              <div className="relative group">
                <img
                  src={siteImages.heroImage}
                  alt="Hero"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => { e.target.src = 'https://placehold.co/800x400/red/white?text=Error'; }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                  <button onClick={() => setPreviewImage(siteImages.heroImage)} className="p-2 bg-white rounded-full hover:bg-zinc-100 transition">
                    <Eye className="h-5 w-5 text-zinc-900" />
                  </button>
                  <button onClick={handleDeleteHero} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition">
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Sin imagen</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Hero */}
          <div className="flex flex-col justify-center">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} className="hidden" />
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 hover:border-red-600 transition text-center">
                {uploadingHero ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-3"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Subiendo...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                    <p className="font-bold text-zinc-900 dark:text-white mb-1">
                      {siteImages.heroImage ? 'Cambiar imagen' : 'Subir imagen'}
                    </p>
                    <p className="text-xs text-zinc-500">JPG, PNG, WEBP (máx. 10MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: CARRUSEL (CON REORDENAMIENTO) --- */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Carrusel "Sobre Nosotros"
          </h3>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple onChange={handleCarouselUpload} disabled={uploadingCarousel} className="hidden" />
            <span className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center cursor-pointer ${uploadingCarousel ? 'opacity-50' : ''}`}>
              {uploadingCarousel ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Agregar Imágenes
                </>
              )}
            </span>
          </label>
        </div>

        {/* GRID DE IMÁGENES */}
        {(!siteImages.carouselImages || siteImages.carouselImages.length === 0) ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay imágenes en el carrusel</p>
            <p className="text-sm">Haz clic en "Agregar Imágenes" para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {siteImages.carouselImages.map((imageUrl, index) => (
              <div key={index} className="flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-lg p-2 shadow-sm">
                
                {/* Imagen con Overlay */}
                <div className="relative group overflow-hidden rounded-md aspect-video mb-2">
                  <img
                    src={imageUrl}
                    alt={`Carrusel ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300/red/white?text=Error'; }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setPreviewImage(imageUrl)} className="p-2 bg-white rounded-full hover:bg-zinc-100 text-zinc-900">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDeleteCarouselImage(imageUrl, index)} className="p-2 bg-red-600 rounded-full hover:bg-red-700 text-white">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Barra de Ordenamiento */}
                <div className="flex justify-between items-center bg-zinc-200 dark:bg-zinc-800 rounded px-2 py-1">
                   <button 
                      onClick={() => handleMoveImage(index, 'left')}
                      disabled={index === 0 || reordering}
                      className={`p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title="Mover antes"
                   >
                      <ArrowLeft size={16} className="text-zinc-700 dark:text-zinc-300"/>
                   </button>

                   <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                      {index + 1}
                   </span>

                   <button 
                      onClick={() => handleMoveImage(index, 'right')}
                      disabled={index === siteImages.carouselImages.length - 1 || reordering}
                      className={`p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition ${index === siteImages.carouselImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title="Mover después"
                   >
                      <ArrowRight size={16} className="text-zinc-700 dark:text-zinc-300"/>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECCIÓN 3: ANUNCIO / BIENVENIDA --- */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg shadow-md p-6 border-2 border-yellow-300 dark:border-yellow-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
            <ImageIcon className="mr-2 text-yellow-600" />
            Modal de Anuncio/Bienvenida
          </h3>
          <button
            onClick={async () => {
              const newEnabled = !siteImages.announcementEnabled;
              const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
              const newData = { ...siteImages, announcementEnabled: newEnabled };
              await setDoc(docRef, newData, { merge: true });
              setSiteImages(newData);
              showNotification(newEnabled ? 'Modal habilitado' : 'Modal deshabilitado');
            }}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
              siteImages.announcementEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
            {siteImages.announcementEnabled ? 'Visible' : 'Oculto'}
          </button>
        </div>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Este modal aparecerá automáticamente cuando los usuarios entren a la página.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview Anuncio */}
          <div>
            {siteImages.announcementImage ? (
              <div className="relative group">
                <img
                  src={siteImages.announcementImage}
                  alt="Anuncio"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => { e.target.src = 'https://placehold.co/800x400/yellow/white?text=Anuncio'; }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                  <button onClick={() => setPreviewImage(siteImages.announcementImage)} className="p-2 bg-white rounded-full hover:bg-zinc-100 transition">
                    <Eye className="h-5 w-5 text-zinc-900" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('¿Eliminar imagen de anuncio?')) return;
                      await deleteImage(siteImages.announcementImage);
                      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
                      const newData = { ...siteImages, announcementImage: '', announcementEnabled: false };
                      await setDoc(docRef, newData, { merge: true });
                      setSiteImages(newData);
                      showNotification('Imagen de anuncio eliminada');
                    }}
                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Sin imagen de anuncio</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Anuncio */}
          <div className="flex flex-col justify-center">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setUploadingAnnouncement(true);
                  try {
                    if (siteImages.announcementImage) await deleteImage(siteImages.announcementImage);
                    const imageUrl = await uploadImage(file, 'announcements');
                    if(!imageUrl) throw new Error("Fallo al subir anuncio");

                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
                    const newData = { ...siteImages, announcementImage: imageUrl };
                    await setDoc(docRef, newData, { merge: true });
                    setSiteImages(newData);
                    showNotification('Anuncio actualizado');
                  } catch (error) { showNotification(error.message, 'error'); } finally { setUploadingAnnouncement(false); e.target.value = ''; }
                }}
                disabled={uploadingAnnouncement}
                className="hidden"
              />
              <div className="border-2 border-dashed border-yellow-300 dark:border-yellow-600 rounded-lg p-8 hover:border-yellow-500 transition text-center bg-yellow-50/50 dark:bg-yellow-900/10">
                {uploadingAnnouncement ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-3"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Subiendo...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                    <p className="font-bold text-zinc-900 dark:text-white mb-1">
                      {siteImages.announcementImage ? 'Cambiar imagen' : 'Subir anuncio'}
                    </p>
                    <p className="text-xs text-zinc-500">JPG, PNG, WEBP</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        isOpen={previewImage !== null}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}