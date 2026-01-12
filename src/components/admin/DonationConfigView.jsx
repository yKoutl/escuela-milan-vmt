import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Heart } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { DONATION_METHODS } from '../../utils/constants';
import { uploadImage, deleteImage } from '../../utils/imageUpload';

export default function DonationConfigView({ showNotification }) {
  const [methods, setMethods] = useState(DONATION_METHODS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDonationConfig();
  }, []);

  const loadDonationConfig = async () => {
    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'donations');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.methods && Array.isArray(data.methods)) {
          setMethods(data.methods);
        }
      }
    } catch (error) {
      console.error('Error loading donation config:', error);
      showNotification?.('Error al cargar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'donations');
      await setDoc(docRef, {
        methods: methods,
        updatedAt: new Date()
      });
      showNotification?.('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error saving donation config:', error);
      showNotification?.('Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (methodId, file) => {
    try {
      const path = `donations/${methodId}_qr`;
      const url = await uploadImage(file, path);
      
      setMethods(methods.map(m => 
        m.id === methodId ? { ...m, qrImage: url } : m
      ));
      
      showNotification?.('Imagen QR actualizada', 'success');
    } catch (error) {
      console.error('Error uploading QR:', error);
      showNotification?.('Error al subir imagen', 'error');
    }
  };

  const handleDeleteQR = async (methodId, qrImage) => {
    if (!qrImage) return;
    
    try {
      await deleteImage(qrImage);
      setMethods(methods.map(m => 
        m.id === methodId ? { ...m, qrImage: null } : m
      ));
      showNotification?.('Imagen QR eliminada', 'success');
    } catch (error) {
      console.error('Error deleting QR:', error);
      showNotification?.('Error al eliminar imagen', 'error');
    }
  };

  const updateMethod = (methodId, field, value) => {
    setMethods(methods.map(m => 
      m.id === methodId ? { ...m, [field]: value } : m
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Configuración de Donaciones
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-bold transition"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          💡 <strong>Importante:</strong> Sube los códigos QR de Yape y Plin para que los usuarios puedan donar fácilmente.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div
            key={method.id}
            className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={method.logo} 
                  alt={method.name}
                  className="h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {method.name}
                </h3>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Número de Teléfono
              </label>
              <input
                type="text"
                value={method.phone}
                onChange={(e) => updateMethod(method.id, 'phone', e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="987654321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Código QR
              </label>
              
              {method.qrImage ? (
                <div className="relative">
                  <img
                    src={method.qrImage}
                    alt={`QR ${method.name}`}
                    className="w-48 h-48 object-contain mx-auto border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white p-2"
                  />
                  <button
                    onClick={() => handleDeleteQR(method.id, method.qrImage)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                    Sube el código QR de {method.name}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload(method.id, file);
                    }}
                    className="hidden"
                    id={`qr-upload-${method.id}`}
                  />
                  <label
                    htmlFor={`qr-upload-${method.id}`}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
                  >
                    <Upload className="h-4 w-4" />
                    Seleccionar Imagen
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Vista Previa
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={method.logo} 
                  alt={method.name}
                  className="h-8 object-contain"
                />
                <span className="font-bold text-zinc-900 dark:text-white">{method.name}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3 text-center">
                {method.qrImage ? (
                  <img 
                    src={method.qrImage} 
                    alt={`QR ${method.name}`}
                    className="w-32 h-32 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-700 rounded mx-auto flex items-center justify-center">
                    <span className="text-xs text-zinc-400">Sin QR</span>
                  </div>
                )}
                <p className="text-sm font-bold text-red-600 mt-2">{method.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
