import React, { useState, useMemo } from 'react';
import { Menu, LayoutDashboard, Users, Settings, LogOut, Image, Sun, Moon, BookOpen, Trophy, CalendarDays, FileText, Inbox, DollarSign, CreditCard, Heart } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { db, appId } from "../firebase";
import { LOGO_URL } from "../utils/constants";
import { THEME_CLASSES, DEFAULT_SCHEDULE } from '../utils/theme';
import { useTheme } from '../contexts/ThemeContext';
import StudentsView from '../components/admin/StudentsView';
import CategoriesView from '../components/admin/CategoriesView';
import PaymentsView from '../components/admin/PaymentsView';
import WebConfigView from '../components/admin/WebConfigView';
import RequestsView from '../components/admin/RequestsView';
import SiteImagesView from '../components/admin/SiteImagesView';
import PricingConfigView from '../components/admin/PricingConfigView';
import MembershipsView from '../components/admin/MembershipsView';
import SponsorsView from '../components/admin/SponsorsView';
import DonationConfigView from '../components/admin/DonationConfigView';

export default function AdminDashboard({
  setView,
  students,
  categories,
  payments,
  news,
  achievements,
  schedules,
  showNotification
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');
  const { isDarkMode, toggleTheme } = useTheme();

  // Calcular datos para gráficos
  const enrollmentData = useMemo(() => {
    const monthlyData = {};
    students.forEach(student => {
      if (student.createdAt?.seconds) {
        const date = new Date(student.createdAt.seconds * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });
    
    // Si no hay datos, usar datos de ejemplo
    if (Object.keys(monthlyData).length === 0) {
      return [
        { month: 'Ene 2026', students: 12 },
        { month: 'Feb 2026', students: 8 },
        { month: 'Mar 2026', students: 15 },
        { month: 'Abr 2026', students: 10 },
        { month: 'May 2026', students: 18 },
        { month: 'Jun 2026', students: 14 }
      ];
    }
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // últimos 6 meses
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
          students: count
        };
      });
  }, [students]);

  const scheduleData = DEFAULT_SCHEDULE;

  // Generic handlers
  const handleAdd = async (collectionName, data) => {
    try {
      // Para colecciones web, asignar el campo 'order' automáticamente
      const webCollections = ['news', 'achievements', 'schedules'];
      const isWebCollection = webCollections.includes(collectionName);
      
      let items = [];
      if (isWebCollection) {
        if (collectionName === 'news') items = news;
        else if (collectionName === 'achievements') items = achievements;
        else if (collectionName === 'schedules') items = schedules;
      }
      
      const newData = {
        ...data,
        visible: true,
        createdAt: serverTimestamp()
      };
      
      // Agregar campo 'order' para colecciones web (al final de la lista)
      if (isWebCollection) {
        newData.order = items.length;
      }
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), newData);
      showNotification('Agregado correctamente');
    } catch (_e) { showNotification('Error al agregar', 'error'); }
  };

  const handleDelete = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id));
      showNotification('Eliminado correctamente');
    } catch (_e) { showNotification('Error al eliminar', 'error'); }
  };

  const handleUpdate = async (collectionName, id, data) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), data);
      showNotification('Actualizado correctamente');
    } catch (_e) { showNotification('Error al actualizar', 'error'); }
  };

  const toggleVisibility = async (collectionName, id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), { visible: !currentStatus });
      showNotification(currentStatus ? 'Elemento ocultado' : 'Elemento publicado');
    } catch (_e) { showNotification('Error al actualizar', 'error'); }
  };

  // --- FUNCIÓN DE REORDENAMIENTO (MEJORADA) ---
  const handleReorder = async (collectionName, index, direction) => {
    // 1. Identificar lista
    let items = [];
    if (collectionName === 'news') items = news;
    else if (collectionName === 'achievements') items = achievements;
    else if (collectionName === 'schedules') items = schedules;

    if (!items || items.length === 0) return;
    
    // Validación de límites
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // 2. Obtener los dos ítems
    const itemA = items[index];      // El que movemos
    const itemB = items[newIndex];   // El que será reemplazado

    try {
      // 3. Calcular valores de orden (LÓGICA CORREGIDA)
      // Si el campo 'order' no existe, usamos su posición en el array (fallback)
      let valOrderA = itemA.order !== undefined ? itemA.order : index;
      let valOrderB = itemB.order !== undefined ? itemB.order : newIndex;

      // --- EL ARREGLO CLAVE ---
      // Si por error ambos tienen el mismo 'order' (ej: ambos son 0), 
      // el intercambio no haría nada. En ese caso, forzamos que usen sus índices.
      if (valOrderA === valOrderB) {
        valOrderA = index;
        valOrderB = newIndex;
      }

      const docRefA = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemA.id);
      const docRefB = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemB.id);

      // 4. Intercambiamos: A recibe el valor de B, y B recibe el valor de A
      await updateDoc(docRefA, { order: valOrderB });
      await updateDoc(docRefB, { order: valOrderA });

      showNotification('Orden actualizado correctamente');
    } catch (error) {
      console.error("Error al reordenar:", error);
      showNotification('Error al mover el elemento', 'error');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: LayoutDashboard, id: 'overview' },
    {
      text: 'Gestión Alumnos', icon: Users,
      subItems: [
        { text: 'Directorio', id: 'students-list', icon: Users },
        { text: 'Categorías', id: 'students-cats', icon: BookOpen },
        { text: 'Pagos y Mensualidades', id: 'students-pay', icon: CalendarDays },
      ]
    },
    {
      text: 'Configuración Web', icon: Settings,
      subItems: [
        { text: 'Contenidos (Noticias/Logros)', id: 'config-web', icon: FileText },
        { text: 'Imágenes del Sitio', id: 'config-images', icon: Image },
        { text: 'Costos e Inscripciones', id: 'config-pricing', icon: DollarSign },
        { text: 'Membresías', id: 'config-memberships', icon: CreditCard },
        { text: 'Auspiciadores', id: 'config-sponsors', icon: Trophy },
        { text: 'Donaciones (QR)', id: 'config-donations', icon: Heart },
        { text: 'Solicitudes Web', id: 'requests', icon: Inbox }
      ]
    }
    
  ];

  return (
    <div className={`flex h-screen ${THEME_CLASSES.bg.secondary} transition-colors duration-300 overflow-hidden`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 ${THEME_CLASSES.bg.surface} ${THEME_CLASSES.border.primary} border-r transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`p-6 flex items-center ${THEME_CLASSES.border.primary} border-b`}>
           <div className="bg-white rounded-full p-1 mr-2 border-2 border-red-600 overflow-hidden">
             <img src={LOGO_URL} alt="Milan Logo" className="h-8 w-8 object-contain" />
           </div>
           <span className={`font-black text-lg ${THEME_CLASSES.text.primary} tracking-widest`}>ADMIN</span>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
           {menuItems.map((item, idx) => (
             <div key={idx}>
               {item.subItems ? (
                 <div className="mb-2">
                   <div className={`px-3 py-2 text-xs font-bold ${THEME_CLASSES.text.tertiary} uppercase tracking-wider flex items-center gap-2`}><item.icon className="h-4 w-4"/> {item.text}</div>
                   {item.subItems.map(sub => {
                     const SubIcon = sub.icon;
                     return (
                       <button key={sub.id} onClick={() => { setAdminTab(sub.id); setSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-2 ${adminTab === sub.id ? 'bg-red-50 text-red-600 font-bold dark:bg-red-900/20' : `${THEME_CLASSES.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800`}`}>
                         {SubIcon && <SubIcon className="h-4 w-4" />}
                         {sub.text}
                       </button>
                     );
                   })}
                 </div>
               ) : (
                 <button onClick={() => { setAdminTab(item.id); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : `${THEME_CLASSES.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800`}`}>
                   <item.icon className="h-5 w-5" /> {item.text}
                 </button>
               )}
             </div>
           ))}
           
           {/* Separador */}
           <div className={`${THEME_CLASSES.border.primary} border-t my-4`}></div>
           
           {/* Botón de tema */}
           <button 
             onClick={toggleTheme}
             className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium ${THEME_CLASSES.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}
           >
             {isDarkMode ? (
               <>
                 <Sun className="h-5 w-5 text-yellow-500" />
                 <span>Modo Claro</span>
               </>
             ) : (
               <>
                 <Moon className="h-5 w-5 text-indigo-500" />
                 <span>Modo Oscuro</span>
               </>
             )}
           </button>
           
           <button onClick={() => setView('landing')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
             <LogOut className="h-5 w-5" /> Salir
           </button>
        </div>
      </div>
     
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className={`h-16 ${THEME_CLASSES.bg.surface} ${THEME_CLASSES.border.primary} border-b flex items-center justify-between px-6 flex-shrink-0`}>
           <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className={`h-6 w-6 ${THEME_CLASSES.text.secondary}`} /></button>
           <h1 className={`text-xl font-bold ${THEME_CLASSES.text.primary} capitalize ml-2 md:ml-0`}>
             {adminTab === 'overview' ? 'Resumen General' : adminTab}
           </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
           {adminTab === 'overview' && (
             <div className="space-y-6">
               {/* Stats Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                   <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Alumnos Activos</h3>
                   <p className={`text-4xl font-black ${THEME_CLASSES.text.primary} mt-2`}>{students.length}</p>
                 </div>
                 <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                   <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Pagos Recibidos</h3>
                   <p className="text-4xl font-black text-green-600 mt-2">{payments.length}</p>
                 </div>
                 <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                   <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase`}>Noticias Visibles</h3>
                   <p className="text-4xl font-black text-blue-600 mt-2">{news.filter(n => n.visible !== false).length}</p>
                 </div>
               </div>

               {/* 2-Column Layout: Chart Left, Schedule Right */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Enrollment Chart */}
                 <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                   <h3 className={`text-lg font-bold ${THEME_CLASSES.text.primary} mb-4`}>Matrículas por Mes</h3>
                   <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={enrollmentData}>
                       <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#27272a' : '#e4e4e7'} />
                       <XAxis 
                         dataKey="month" 
                         stroke={isDarkMode ? '#a1a1aa' : '#71717a'}
                         style={{ fontSize: '12px' }}
                       />
                       <YAxis 
                         stroke={isDarkMode ? '#a1a1aa' : '#71717a'}
                         style={{ fontSize: '12px' }}
                       />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                           border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
                           borderRadius: '8px',
                           color: isDarkMode ? '#ffffff' : '#18181b'
                         }}
                       />
                       <Legend />
                       <Bar dataKey="students" fill="#dc2626" name="Alumnos" radius={[8, 8, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>

                 {/* Schedule Visualization */}
                 <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                   <h3 className={`text-lg font-bold ${THEME_CLASSES.text.primary} mb-4`}>Horarios de Entrenamiento</h3>
                   <div className="grid grid-cols-1 gap-4">
                     {['Lunes', 'Miércoles', 'Viernes'].map(day => (
                       <div key={day} className="space-y-2">
                         <h4 className={`font-bold text-sm ${THEME_CLASSES.text.secondary} uppercase tracking-wide ${THEME_CLASSES.border.primary} border-b pb-2`}>{day}</h4>
                         {scheduleData
                           .filter(item => item.day === day)
                           .map((item, idx) => (
                             <div key={idx} className={`${item.color} text-white p-3 rounded-lg`}>
                               <p className="font-bold text-xs">{item.category}</p>
                               <p className="text-xs opacity-90">{item.time}</p>
                             </div>
                           ))
                         }
                       </div>
                     ))}
                   </div>
                   <p className={`text-xs ${THEME_CLASSES.text.tertiary} mt-4 italic`}>* Horarios pueden variar según la categoría y disponibilidad</p>
                 </div>
               </div>
             </div>
           )}
           {adminTab === 'students-list' && <StudentsView students={students} categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} />}
           {adminTab === 'students-cats' && <CategoriesView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} />}
           {adminTab === 'students-pay' && <PaymentsView categories={categories} students={students} payments={payments} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} showNotification={showNotification} />}
           {adminTab === 'config-web' && <WebConfigView news={news} achievements={achievements} schedules={schedules} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} toggleVisibility={toggleVisibility} showNotification={showNotification} handleReorder={handleReorder} />}
           {adminTab === 'config-images' && <SiteImagesView showNotification={showNotification} />}
           {adminTab === 'config-pricing' && <PricingConfigView showNotification={showNotification} />}
           {adminTab === 'config-memberships' && <MembershipsView showNotification={showNotification} />}
           {adminTab === 'config-sponsors' && <SponsorsView showNotification={showNotification} />}
           {adminTab === 'config-donations' && <DonationConfigView showNotification={showNotification} />}
           {adminTab === 'requests' && <RequestsView handleDelete={handleDelete} showNotification={showNotification} />}
        </main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
