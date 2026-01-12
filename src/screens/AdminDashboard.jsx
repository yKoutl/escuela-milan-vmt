import React, { useState } from 'react';
import { Menu, LayoutDashboard, Users, Settings, LogOut, Image, Sun, Moon, BookOpen, Trophy, CalendarDays, FileText, Inbox, DollarSign, CreditCard, Heart } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from "../firebase";
import { LOGO_URL } from "../utils/constants";
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

  // Generic handlers
  const handleAdd = async (collectionName, data) => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), {
        ...data,
        visible: true,
        createdAt: serverTimestamp()
      });
      showNotification('Agregado correctamente');
    } catch (_e) { showNotification('Error al agregar', 'error'); }
  };

  const handleDelete = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id));
      showNotification('Eliminado correctamente');
    } catch (_e) { showNotification('Error al eliminar', 'error'); }
  };

  const toggleVisibility = async (collectionName, id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), { visible: !currentStatus });
      showNotification(currentStatus ? 'Elemento ocultado' : 'Elemento publicado');
    } catch (_e) { showNotification('Error al actualizar', 'error'); }
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
    <div className="flex h-screen bg-zinc-100 dark:bg-black transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center border-b border-zinc-200 dark:border-zinc-800">
           <div className="bg-white rounded-full p-1 mr-2 border-2 border-red-600 overflow-hidden">
             <img src={LOGO_URL} alt="Milan Logo" className="h-8 w-8 object-contain" />
           </div>
           <span className="font-black text-lg text-zinc-800 dark:text-white tracking-widest">ADMIN</span>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
           {menuItems.map((item, idx) => (
             <div key={idx}>
               {item.subItems ? (
                 <div className="mb-2">
                   <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><item.icon className="h-4 w-4"/> {item.text}</div>
                   {item.subItems.map(sub => {
                     const SubIcon = sub.icon;
                     return (
                       <button key={sub.id} onClick={() => { setAdminTab(sub.id); setSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-2 ${adminTab === sub.id ? 'bg-red-50 text-red-600 font-bold dark:bg-red-900/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                         {SubIcon && <SubIcon className="h-4 w-4" />}
                         {sub.text}
                       </button>
                     );
                   })}
                 </div>
               ) : (
                 <button onClick={() => { setAdminTab(item.id); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                   <item.icon className="h-5 w-5" /> {item.text}
                 </button>
               )}
             </div>
           ))}
           
           {/* Separador */}
           <div className="border-t border-zinc-200 dark:border-zinc-700 my-4"></div>
           
           {/* Botón de tema */}
           <button 
             onClick={toggleTheme}
             className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 flex-shrink-0">
           <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-6 w-6 text-zinc-600 dark:text-zinc-300" /></button>
           <h1 className="text-xl font-bold text-zinc-800 dark:text-white capitalize ml-2 md:ml-0">
             {adminTab === 'overview' ? 'Resumen General' : adminTab}
           </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
           {adminTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border dark:border-zinc-800"><h3 className="text-zinc-500 text-sm font-bold uppercase">Alumnos Activos</h3><p className="text-4xl font-black text-zinc-900 dark:text-white mt-2">{students.length}</p></div>
               <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border dark:border-zinc-800"><h3 className="text-zinc-500 text-sm font-bold uppercase">Pagos Recibidos</h3><p className="text-4xl font-black text-green-600 mt-2">{payments.length}</p></div>
               <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border dark:border-zinc-800"><h3 className="text-zinc-500 text-sm font-bold uppercase">Noticias Visibles</h3><p className="text-4xl font-black text-blue-600 mt-2">{news.filter(n => n.visible !== false).length}</p></div>
             </div>
           )}
           {adminTab === 'students-list' && <StudentsView students={students} categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} />}
           {adminTab === 'students-cats' && <CategoriesView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} />}
           {adminTab === 'students-pay' && <PaymentsView categories={categories} students={students} payments={payments} handleAdd={handleAdd} handleDelete={handleDelete} showNotification={showNotification} />}
           {adminTab === 'config-web' && <WebConfigView news={news} achievements={achievements} schedules={schedules} handleAdd={handleAdd} handleDelete={handleDelete} toggleVisibility={toggleVisibility} showNotification={showNotification} />}
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
