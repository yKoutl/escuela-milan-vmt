import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

export default function PricingConfigView({ showNotification }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    inscription: '30',
    monthly: '150',
    packages: [
      { months: '1 MES', price: '149.90', discount: false },
      { months: '2 MESES', price: '249.90', discount: true },
      { months: '3 MESES', price: '349.90', discount: true, featured: true }
    ]
  });

  useEffect(() => {
    loadPricingConfig();
  }, []);

  const loadPricingConfig = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'pricing');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'pricing');
      await setDoc(docRef, config);
      showNotification('Configuración de precios actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = (index, field, value) => {
    const newPackages = [...config.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setConfig({ ...config, packages: newPackages });
  };

  const togglePackageField = (index, field) => {
    const newPackages = [...config.packages];
    newPackages[index] = { ...newPackages[index], [field]: !newPackages[index][field] };
    setConfig({ ...config, packages: newPackages });
  };

  if (loading && !config.inscription) {
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
          <DollarSign className="mr-3 text-red-600" />
          Configuración de Costos e Inscripciones
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

      {/* Costos Básicos */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Costos Básicos
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Precio de Inscripción (S/.)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={config.inscription}
              onChange={(e) => setConfig({ ...config, inscription: e.target.value })}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Mensualidad (S/.)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={config.monthly}
              onChange={(e) => setConfig({ ...config, monthly: e.target.value })}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Paquetes Promocionales */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Paquetes Promocionales
        </h3>

        <div className="space-y-4">
          {config.packages.map((pkg, idx) => (
            <div key={idx} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <div className="grid md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={pkg.months}
                    onChange={(e) => updatePackage(idx, 'months', e.target.value)}
                    className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 rounded text-sm text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Precio (S/.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pkg.price}
                    onChange={(e) => updatePackage(idx, 'price', e.target.value)}
                    className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 rounded text-sm text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkg.discount || false}
                      onChange={() => togglePackageField(idx, 'discount')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Descuento
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkg.featured || false}
                      onChange={() => togglePackageField(idx, 'featured')}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Destacado
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
