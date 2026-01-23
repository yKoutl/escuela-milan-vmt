import React, { useState, useMemo, useEffect } from 'react';
import { Menu, LayoutDashboard, Users, Settings, LogOut, Image, Sun, Moon, BookOpen, Trophy, CalendarDays, FileText, Inbox, DollarSign, CreditCard, Heart, AlertCircle, History, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc, updateDoc, getCountFromServer, query, where, Timestamp, getAggregateFromServer, sum, getDocs, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { db, appId } from "../firebase";
import { LOGO_URL, DEFAULT_SCHEDULE } from "../utils/constants";
import { THEME_CLASSES } from '../utils/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useCollection } from '../hooks/useCollection';

import StudentsView from '../components/admin/StudentsView';
import CategoriesView from '../components/admin/CategoriesView';
import PaymentsView from '../components/admin/payments/PaymentsView';
import PendingPaymentsView from '../components/admin/payments/PendingPaymentsView';
import PaymentHistoryView from '../components/admin/payments/PaymentHistoryView';
import WebConfigView from '../components/admin/WebConfigView';
import RequestsView from '../components/admin/RequestsView';
import SiteImagesView from '../components/admin/SiteImagesView';
import PricingConfigView from '../components/admin/PricingConfigView';
import MembershipsView from '../components/admin/MembershipsView';
import SponsorsView from '../components/admin/SponsorsView';
import DonationConfigView from '../components/admin/DonationConfigView';

export default function AdminDashboard({
  setView,
  news,
  achievements,
  schedules,
  showNotification
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');
  const { isDarkMode, toggleTheme } = useTheme();

  // --- ESTADOS PARA ESTADÍSTICAS (Lectura Optimizada) ---
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalPayments: 0,
    monthlyEnrollment: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar Categorías
  const { data: categories } = useCollection('categories');

  // --- EFECTO: Cargar estadísticas reales (Usando Aggregation Queries para ahorrar lecturas) ---
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // 1. Contar Alumnos Activos
        const studentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'students');
        const activeStudentsQuery = query(studentsCol, where('status', '==', 'Activo'));
        const activeSnapshot = await getCountFromServer(activeStudentsQuery);

        // 2. Ingresos del Mes (Suma Real)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const paymentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
        const monthlyPaymentsQuery = query(
          paymentsCol,
          where('paymentDate', '>=', Timestamp.fromDate(startOfMonth)),
          where('paymentDate', '<=', Timestamp.fromDate(endOfMonth))
        );

        let revenue = 0;
        try {
          // Intento de suma (requiere índice o soporte)
          const revenueSnapshot = await getAggregateFromServer(monthlyPaymentsQuery, {
            total: sum('amount')
          });
          revenue = revenueSnapshot.data().total || 0;
        } catch (e) {
          console.warn("Aggregation fallback", e);
          const countSnap = await getCountFromServer(monthlyPaymentsQuery);
          revenue = countSnap.data().count * 0;
        }

        // 4. Gráfico Matrículas (Query Simplificado para debugging)
        const currentYear = now.getFullYear();
        // NOTA: Usamos getDocs para traer todo y filtrar en memoria si es necesario, 
        // para asegurar que no sea un problema de fechas estrictas en la query inicial si hay desface.
        const allStudentsSnap = await getDocs(studentsCol);

        const enrollmentByMonth = Array.from({ length: 12 }, (_, i) => 0);

        allStudentsSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt) { // Validar que tenga fecha
            const date = new Date(data.createdAt.seconds * 1000);
            if (date.getFullYear() === currentYear) {
              enrollmentByMonth[date.getMonth()]++;
            }
          }
        });

        const monthsData = enrollmentByMonth.map((count, index) => {
          const date = new Date(currentYear, index, 1);
          return {
            month: date.toLocaleDateString('es-PE', { month: 'short' }),
            fullMonth: date.toLocaleDateString('es-PE', { month: 'long' }),
            students: count
          };
        });

        setStats({
          activeStudents: activeSnapshot.data().count,
          totalPayments: revenue,
          monthlyEnrollment: monthsData,
          paymentStatus: [] // No se usa visualmente pero mantenemos la estructura
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (adminTab === 'overview') {
      fetchStats();
    }
  }, [adminTab]);


  // Generic handlers
  const handleAdd = async (collectionName, data) => {
    try {
      const webCollections = ['news', 'achievements', 'schedules'];
      const isWebCollection = webCollections.includes(collectionName);
      let items = [];
      if (isWebCollection) console.log("Web collection update");

      const newData = {
        ...data,
        visible: true,
        createdAt: serverTimestamp()
      };

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

  const handleReorder = async (collectionName, index, direction) => {
    // Placeholder para evitar errores si no se usa
    console.log("Reorder", collectionName, index, direction);
  };

  const menuItems = [
    { text: 'Dashboard', icon: LayoutDashboard, id: 'overview' },
    {
      text: 'Gestión Alumnos', icon: Users,
      subItems: [
        { text: 'Directorio', id: 'students-list', icon: Users },
        { text: 'Categorías', id: 'students-cats', icon: BookOpen },
      ]
    },
    {
      text: 'Pagos y Mensualidades', icon: CalendarDays,
      subItems: [
        { text: 'Control de Pagos', id: 'payments-control', icon: DollarSign },
        { text: 'Pagos Pendientes', id: 'payments-pending', icon: AlertCircle },
        { text: 'Historial de Pagos', id: 'payments-history', icon: History },
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

  // Agrupador de Horarios por Día
  const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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
                  <div className={`px-3 py-2 text-xs font-bold ${THEME_CLASSES.text.tertiary} uppercase tracking-wider flex items-center gap-2`}><item.icon className="h-4 w-4" /> {item.text}</div>
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
            loadingStats ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className={`w-12 h-12 animate-spin ${THEME_CLASSES.text.primary}`} />
                <p className={`${THEME_CLASSES.text.secondary} animate-pulse font-medium`}>Cargando datos...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                    <div className="absolute right-0 top-0 p-4 opacity-5"><Users className="w-24 h-24" /></div>
                    <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase tracking-wider`}>Alumnos Activos</h3>
                    <p className={`text-5xl font-black ${THEME_CLASSES.text.primary} mt-2`}>
                      {loadingStats ? <span className="animate-pulse">--</span> : stats.activeStudents}
                    </p>
                  </div>
                  <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                    <div className="absolute right-0 top-0 p-4 opacity-5"><DollarSign className="w-24 h-24" /></div>
                    <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase tracking-wider`}>Ingresos del Mes</h3>
                    <p className="text-5xl font-black text-green-600 mt-2">
                      {loadingStats ? <span className="animate-pulse">--</span> : `S/ ${stats.totalPayments.toFixed(2)}`}
                    </p>
                  </div>
                  <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                    <div className="absolute right-0 top-0 p-4 opacity-5"><FileText className="w-24 h-24" /></div>
                    <h3 className={`${THEME_CLASSES.text.secondary} text-sm font-bold uppercase tracking-wider`}>Noticias Visibles</h3>
                    <p className="text-5xl font-black text-blue-600 mt-2">{news.filter(n => n.visible !== false).length}</p>
                  </div>
                </div>

                {/* GRÁFICO DE MATRÍCULAS (ANCHO COMPLETO) */}
                <div className="w-full">
                  <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                    <h3 className={`text-lg font-bold ${THEME_CLASSES.text.primary} mb-6`}>Matrículas {new Date().getFullYear()}</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stats.monthlyEnrollment}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#3f3f46' : '#e4e4e7'} vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke={isDarkMode ? '#a1a1aa' : '#71717a'}
                          style={{ fontSize: '11px', fontWeight: 'bold' }}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke={isDarkMode ? '#a1a1aa' : '#71717a'}
                          style={{ fontSize: '11px' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            color: isDarkMode ? '#ffffff' : '#18181b',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          cursor={{ fill: isDarkMode ? '#27272a' : '#f4f4f5' }}
                        />
                        <Bar dataKey="students" fill="#dc2626" name="Nuevos Alumnos" radius={[4, 4, 4, 4]} barSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )
          )}
          {adminTab === 'students-list' && <StudentsView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} />}
          {adminTab === 'students-cats' && <CategoriesView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} />}
          {adminTab === 'payments-control' && <PaymentsView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} showNotification={showNotification} />}
          {adminTab === 'payments-pending' && <PendingPaymentsView showNotification={showNotification} />}
          {adminTab === 'payments-history' && <PaymentHistoryView showNotification={showNotification} />}
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
