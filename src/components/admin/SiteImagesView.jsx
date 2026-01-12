import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Eye, X } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
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
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const [uploadingAnnouncement, setUploadingAnnouncement] = useState(false);

  // Cargar imágenes del sitio desde Firestore
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
          carouselImages: data.carouselImages || [],
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

  // Subir imagen del Hero
  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      // Si ya existe una imagen, eliminarla
      if (siteImages.heroImage) {
        await deleteImage(siteImages.heroImage);
      }

      // Subir nueva imagen
      const imageUrl = await uploadImage(file, 'hero');
      
      // Guardar en Firestore
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, heroImage: imageUrl };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification('Imagen del Hero actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  // Subir imágenes del carrusel
  const handleCarouselUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingCarousel(true);
    try {
      // Subir todas las imágenes
      const uploadPromises = files.map(file => uploadImage(file, 'carousel'));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Agregar a las existentes
      const newCarouselImages = [...siteImages.carouselImages, ...uploadedUrls];
      
      // Guardar en Firestore
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, carouselImages: newCarouselImages };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification(`${files.length} imagen(es) agregada(s) al carrusel`);
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploadingCarousel(false);
      e.target.value = '';
    }
  };

  // Eliminar imagen del carrusel
  const handleDeleteCarouselImage = async (imageUrl, index) => {
    if (!confirm('¿Eliminar esta imagen del carrusel?')) return;

    try {
      // Eliminar de Storage
      await deleteImage(imageUrl);
      
      // Actualizar array
      const newCarouselImages = siteImages.carouselImages.filter((_, i) => i !== index);
      
      // Guardar en Firestore
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const newData = { ...siteImages, carouselImages: newCarouselImages };
      await setDoc(docRef, newData, { merge: true });
      
      setSiteImages(newData);
      showNotification('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar imagen', 'error');
    }
  };

  // Eliminar imagen del Hero
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

      {/* Imagen del Hero */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Imagen Principal (Hero)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            {siteImages.heroImage ? (
              <div className="relative group">
                <img
                  src={siteImages.heroImage}
                  alt="Hero"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x400/red/white?text=Error+al+cargar';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewImage(siteImages.heroImage)}
                    className="p-2 bg-white rounded-full hover:bg-zinc-100 transition"
                  >
                    <Eye className="h-5 w-5 text-zinc-900" />
                  </button>
                  <button
                    onClick={handleDeleteHero}
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
                  <p className="text-sm">Sin imagen</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload */}
          <div className="flex flex-col justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                disabled={uploadingHero}
                className="hidden"
              />
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
                    <p className="text-xs text-zinc-500">JPG, PNG, WEBP (máx. 5MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Carrusel "Sobre Nosotros" */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Carrusel "Sobre Nosotros"
          </h3>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCarouselUpload}
              disabled={uploadingCarousel}
              className="hidden"
            />
            <button
              disabled={uploadingCarousel}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center disabled:opacity-50"
            >
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
            </button>
          </label>
        </div>

        {/* Grid de imágenes */}
        {siteImages.carouselImages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay imágenes en el carrusel</p>
            <p className="text-sm">Haz clic en "Agregar Imágenes" para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {siteImages.carouselImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Carrusel ${index + 1}`}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/400x300/red/white?text=Error';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewImage(imageUrl)}
                    className="p-2 bg-white rounded-full hover:bg-zinc-100 transition"
                  >
                    <Eye className="h-4 w-4 text-zinc-900" />
                  </button>
                  <button
                    onClick={() => handleDeleteCarouselImage(imageUrl, index)}
                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Imagen de Anuncio/Bienvenida */}
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
              showNotification(newEnabled ? 'Modal de anuncio habilitado' : 'Modal de anuncio deshabilitado');
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
          Este modal aparecerá automáticamente cuando los usuarios entren a la página (una vez por sesión).
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            {siteImages.announcementImage ? (
              <div className="relative group">
                <img
                  src={siteImages.announcementImage}
                  alt="Anuncio"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x400/yellow/white?text=Anuncio';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewImage(siteImages.announcementImage)}
                    className="p-2 bg-white rounded-full hover:bg-zinc-100 transition"
                  >
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

          {/* Upload */}
          <div className="flex flex-col justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  setUploadingAnnouncement(true);
                  try {
                    if (siteImages.announcementImage) {
                      await deleteImage(siteImages.announcementImage);
                    }
                    const imageUrl = await uploadImage(file, 'announcements');
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
                    const newData = { ...siteImages, announcementImage: imageUrl };
                    await setDoc(docRef, newData, { merge: true });
                    setSiteImages(newData);
                    showNotification('Imagen de anuncio actualizada');
                  } catch (error) {
                    console.error('Error:', error);
                    showNotification(error.message, 'error');
                  } finally {
                    setUploadingAnnouncement(false);
                    e.target.value = '';
                  }
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
                      {siteImages.announcementImage ? 'Cambiar imagen' : 'Subir imagen de anuncio'}
                    </p>
                    <p className="text-xs text-zinc-500">JPG, PNG, WEBP (máx. 5MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
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
