import React, { useState, useEffect } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { MEMBERSHIP_OPTIONS } from '../../utils/constants';

export default function MembershipsView({ showNotification }) {
  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState(MEMBERSHIP_OPTIONS);

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'memberships');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setMemberships(docSnap.data().items || MEMBERSHIP_OPTIONS);
      }
    } catch (error) {
      console.error('Error al cargar membresías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'memberships');
      await setDoc(docRef, { items: memberships });
      showNotification('Membresías actualizadas correctamente');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar membresías', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateMembership = (index, field, value) => {
    const newMemberships = [...memberships];
    newMemberships[index] = { ...newMemberships[index], [field]: value };
    setMemberships(newMemberships);
  };

  const updateBenefit = (membershipIndex, benefitIndex, value) => {
    const newMemberships = [...memberships];
    newMemberships[membershipIndex].benefits[benefitIndex] = value;
    setMemberships(newMemberships);
  };

  const addBenefit = (membershipIndex) => {
    const newMemberships = [...memberships];
    newMemberships[membershipIndex].benefits.push('Nuevo beneficio');
    setMemberships(newMemberships);
  };

  const removeBenefit = (membershipIndex, benefitIndex) => {
    const newMemberships = [...memberships];
    newMemberships[membershipIndex].benefits.splice(benefitIndex, 1);
    setMemberships(newMemberships);
  };

  if (loading && memberships.length === 0) {
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
          <CreditCard className="mr-3 text-red-600" />
          Configuración de Membresías
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
        {memberships.map((membership, idx) => (
          <div key={membership.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              {membership.title}
            </h3>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={membership.title}
                  onChange={(e) => updateMembership(idx, 'title', e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Precio (S/.)
                </label>
                <input
                  type="text"
                  value={membership.price}
                  onChange={(e) => updateMembership(idx, 'price', e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white"
                  placeholder="50 o 'Contactar'"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Período
                </label>
                <input
                  type="text"
                  value={membership.period}
                  onChange={(e) => updateMembership(idx, 'period', e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 rounded text-zinc-900 dark:text-white"
                  placeholder="Mensual, Anual, etc."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  Beneficios
                </label>
                <button
                  onClick={() => addBenefit(idx)}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2">
                {membership.benefits.map((benefit, benefitIdx) => (
                  <div key={benefitIdx} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(idx, benefitIdx, e.target.value)}
                      className="flex-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 rounded text-sm text-zinc-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeBenefit(idx, benefitIdx)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
