// Configuración de Cloudinary usando Variables de Entorno
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Sube una imagen a Cloudinary y retorna la URL segura.
 * @param {File} file - El archivo de imagen seleccionado por el usuario.
 * @returns {Promise<string|null>} - La URL de la imagen o null si hay error.
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error("Faltan las variables de entorno de Cloudinary.");
    alert("Error de configuración: Faltan credenciales de Cloudinary.");
    return null;
  }

  // Validación básica de imagen
  if (!isValidImage(file)) {
      alert("Archivo no válido. Asegúrate de que sea una imagen (JPG, PNG, GIF, WEBP) y menor a 10MB.");
      return null;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la respuesta de Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    alert('Error al subir la imagen. Verifica tu conexión o las credenciales.');
    return null;
  }
};

/**
 * Sube múltiples imágenes en paralelo
 * @param {FileList|File[]} files 
 */
export const uploadMultipleImages = async (files) => {
    const promises = Array.from(files).map(file => uploadImage(file));
    return await Promise.all(promises);
};
  
/**
 * Valida tipo y tamaño
 */
export const isValidImage = (file) => {
    if (!file) return false;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    // Límite de 10MB
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
 * Por seguridad, implementamos esta función vacía para mantener la compatibilidad con el resto de la app
 * sin romper el build. Las imágenes viejas se pueden borrar manualmente desde el panel de Cloudinary.
 */
export const deleteImage = async (imageUrl) => {
    console.warn("El borrado de imágenes desde cliente no está habilitado por seguridad en Cloudinary Unsigned.");
    return true; // Retornamos true para simular éxito y no romper el flujo
};