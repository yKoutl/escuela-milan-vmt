import imageCompression from 'browser-image-compression';

// Configuración de Cloudinary usando Variables de Entorno
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

// Configuración de compresión equilibrada (calidad decente)
const COMPRESSION_OPTIONS = {
  maxSizeMB: 3,
  maxWidthOrHeight: 2560,
  initialQuality: 0.8,
  useWebWorker: true,
  fileType: 'image/jpeg'
};

/**
 * Sube una imagen a Cloudinary y retorna la URL segura.
 * @param {File} file - El archivo de imagen seleccionado por el usuario.
 * @param {string} [folderName='milan-school'] - (Opcional) Carpeta destino en Cloudinary.
 * @returns {Promise<string|null>} - La URL de la imagen o null si hay error.
 */
export const uploadImage = async (file, folderName = 'milan-school') => {
  if (!file) return null;

  // 1. Verificación de credenciales
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error("❌ Error: Faltan las variables de entorno VITE_CLOUDINARY_...");
    alert("Error de configuración: Faltan credenciales de Cloudinary.");
    return null;
  }

  // 2. Validación básica de imagen
  if (!isValidImage(file)) {
      alert("Archivo no válido. Asegúrate de que sea una imagen (JPG, PNG, GIF, WEBP) y menor a 10MB.");
      return null;
  }

  try {
    // 3. Comprimir la imagen antes de subir
    console.log(`📦 Comprimiendo imagen: ${file.name} (${formatFileSize(file.size)})`);
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    console.log(`✅ Compresión completa: ${formatFileSize(compressedFile.size)}`);

    // 4. Crear FormData con la imagen comprimida
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // 5. Forzar carpeta (aunque el preset ya lo tenga, esto asegura el orden)
    if (folderName) {
      formData.append('folder', folderName);
    }

    // 6. Subir a Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error Cloudinary:', data);
      throw new Error(data.error?.message || 'Error en la respuesta de Cloudinary');
    }

    // Retorna la URL segura (https)
    console.log('🎉 Imagen subida exitosamente:', data.secure_url);
    return data.secure_url;

  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    alert('Error al subir la imagen. Verifica tu conexión.');
    return null;
  }
};

/**
 * Sube múltiples imágenes en paralelo
 * @param {FileList|File[]} files 
 */
export const uploadMultipleImages = async (files) => {
    if (!files || files.length === 0) return [];
    const promises = Array.from(files).map(file => uploadImage(file));
    // Filtramos los nulos si alguna falla
    const results = await Promise.all(promises);
    return results.filter(url => url !== null);
};
  
/**
 * Valida tipo y tamaño (Máx 10MB)
 */
export const isValidImage = (file) => {
    if (!file) return false;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; 
    return validTypes.includes(file.type) && file.size <= maxSize;
};
  
/**
 * Formatea bytes a texto legible (ej: 2.5 MB)
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * NOTA: Cloudinary no permite borrar imágenes desde el frontend sin firma de seguridad (API Secret).
 * Solo simulamos el éxito.
 */
export const deleteImage = async (imageUrl) => {
    console.warn("⚠️ El borrado real requiere Backend. Se ha desvinculado la imagen de la vista.");
    return true;
};