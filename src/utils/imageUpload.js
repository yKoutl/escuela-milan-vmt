import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Sube una imagen a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} path - Ruta en Storage (ej: 'hero', 'news', 'achievements')
 * @returns {Promise<string>} URL de descarga de la imagen
 */
export const uploadImage = async (file, path = 'images') => {
  if (!file) throw new Error('No se proporcionó archivo');
  
  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no válido. Use JPG, PNG, WEBP o GIF');
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 5MB');
  }
  
  try {
    // Crear nombre único para evitar colisiones
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const filename = `${timestamp}_${randomStr}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
};

/**
 * Elimina una imagen de Firebase Storage
 * @param {string} imageUrl - URL completa de la imagen en Storage
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('firebase')) return;
  
  try {
    // Extraer path del Storage desde la URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!imageUrl.startsWith(baseUrl)) return;
    
    const pathStart = imageUrl.indexOf('/o/') + 3;
    const pathEnd = imageUrl.indexOf('?');
    const fullPath = decodeURIComponent(imageUrl.slice(pathStart, pathEnd));
    
    const imageRef = ref(storage, fullPath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    // No lanzar error para no bloquear otras operaciones
  }
};

/**
 * Sube múltiples imágenes
 * @param {FileList|File[]} files - Archivos a subir
 * @param {string} path - Ruta en Storage
 * @returns {Promise<string[]>} Array de URLs de descarga
 */
export const uploadMultipleImages = async (files, path = 'images') => {
  const uploadPromises = Array.from(files).map(file => uploadImage(file, path));
  return await Promise.all(uploadPromises);
};

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export const isValidImage = (file) => {
  if (!file) return false;
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return validTypes.includes(file.type) && file.size <= maxSize;
};

/**
 * Obtiene el tamaño legible de un archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
