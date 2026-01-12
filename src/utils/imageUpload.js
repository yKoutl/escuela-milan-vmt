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