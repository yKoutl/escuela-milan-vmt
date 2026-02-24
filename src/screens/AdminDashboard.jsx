import React, { useState, useMemo, useEffect } from 'react';
import { Menu, LayoutDashboard, Users, Settings, LogOut, Image, Sun, Moon, BookOpen, Trophy, CalendarDays, FileText, Inbox, DollarSign, CreditCard, Heart, AlertCircle, History, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc, updateDoc, getCountFromServer, query, where, Timestamp, getAggregateFromServer, sum, getDocs, orderBy } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { db, appId } from "../firebase";
import { LOGO_URL, DEFAULT_SCHEDULE } from "../utils/constants";
import { THEME_CLASSES } from '../utils/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useCollection } from '../hooks/useCollection';
import { usePendingPayments } from '../hooks/usePendingPayments';
import { usePendingRequests } from '../hooks/usePendingRequests';
import { useNavigate, useLocation, Routes, Route, Link, Navigate } from 'react-router-dom';

import StudentsView from '../components/admin/students/StudentsView';
import CategoriesView from '../components/admin/students/CategoriesView';
import PaymentsView from '../components/admin/payments/PaymentsView';
import PendingPaymentsView from '../components/admin/payments/PendingPaymentsView';
import PaymentHistoryView from '../components/admin/payments/PaymentHistoryView';
import ExpensesView from '../components/admin/payments/ExpensesView';
import WebConfigView from '../components/admin/config/WebConfigView';
import RequestsView from '../components/admin/requests/RequestsView';
import SiteImagesView from '../components/admin/config/SiteImagesView';
import PricingConfigView from '../components/admin/config/PricingConfigView';
import MembershipsView from '../components/admin/config/MembershipsView';
import SponsorsView from '../components/admin/config/SponsorsView';
import DonationConfigView from '../components/admin/config/DonationConfigView';

export default function AdminDashboard({
  setView,
  news,
  achievements,
  schedules,
  showNotification,
  user
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const PAGE_TITLES = {
    'inicio': 'Resumen General',
    'directorio-alumnos': 'Directorio de Alumnos',
    'categorias': 'Categorías de Alumnos',
    'solicitudes': 'Solicitudes Web',
    'control-pagos': 'Control de Pagos',
    'pagos-pendientes': 'Pagos Pendientes',
    'historial-pagos': 'Historial de Pagos',
    'egresos': 'Gestión de Egresos',
    'contenidos-web': 'Configuración de Contenidos',
    'imagenes': 'Galería de Imágenes',
    'precios': 'Costos e Inscripciones',
    'membresias': 'Gestión de Membresías',
    'auspiciadores': 'Nuestros Auspiciadores',
    'donaciones': 'Donaciones y QR',
  };

  // Get current active tab from pathname
  const currentPath = location.pathname.replace('/admin', '') || '/';
  // Map current path to adminTab for title and helper logic
  const adminTab = currentPath === '/' ? 'inicio' : currentPath.substring(1);

  // --- ESTADO PARA SECCIONES COLAPSABLES DEL SIDEBAR ---
  const [expandedSections, setExpandedSections] = useState({
    'Gestión Alumnos': true,
    'Pagos y Mensualidades': false,
    'Configuración Web': false
  });

  const toggleSection = (sectionText) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionText]: !prev[sectionText]
    }));
  };

  // --- ESTADOS PARA ESTADÍSTICAS ---
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalPayments: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyEnrollment: [],
    monthlyNetIncome: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar Categorías
  const { data: categories } = useCollection('categories');
  const { totalProblems } = usePendingPayments();
  const { pendingCount: pendingRequests } = usePendingRequests();

  // --- EFECTO: Cargar estadísticas reales (Usando Aggregation Queries para ahorrar lecturas) ---
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // 1. Referencias
        const studentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'students');
        const paymentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'payments');
        const expensesCol = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');

        // 2. Obtener datos del AÑO COMPLETO para Gráficos y Totales del Mes
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth(); // 0-11

        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        // Fetch en paralelo de los datos base
        const [paymentsSnap, expensesSnap, allStudentsSnap] = await Promise.all([
          getDocs(paymentsCol),
          getDocs(expensesCol),
          getDocs(studentsCol)
        ]);

        // c. Procesamiento de datos en Memoria
        const netIncomeByMonth = Array.from({ length: 12 }, (_, i) => ({ income: 0, expenses: 0 }));
        const enrollmentByMonth = Array.from({ length: 12 }, (_, i) => 0);

        let currentMonthIncome = 0;
        let currentMonthExpenses = 0;

        // Procesar Pagos (Filtrado en Memoria por el año actual)
        paymentsSnap.forEach(doc => {
          const data = doc.data();
          const amount = parseFloat(data.amount) || 0;
          const pDate = data.paymentDate?.seconds ? new Date(data.paymentDate.seconds * 1000) : null;

          if (pDate && pDate.getFullYear() === currentYear) {
            const m = pDate.getMonth();
            netIncomeByMonth[m].income += amount;
            if (m === currentMonthIndex) currentMonthIncome += amount;
          }
        });

        // Procesar Egresos (Filtrado en Memoria por el año actual)
        expensesSnap.forEach(doc => {
          const data = doc.data();
          const amount = parseFloat(data.amount) || 0;
          const eDate = data.date?.seconds ? new Date(data.date.seconds * 1000) : null;

          if (eDate && eDate.getFullYear() === currentYear) {
            const m = eDate.getMonth();
            netIncomeByMonth[m].expenses += amount;
            if (m === currentMonthIndex) currentMonthExpenses += amount;
          }
        });

        // Procesar Alumnos (Matrículas y Conteo Activos)
        let activeStudentsCount = 0;
        allStudentsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'Activo') activeStudentsCount++;

          const cDate = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
          if (cDate && cDate.getFullYear() === currentYear) {
            enrollmentByMonth[cDate.getMonth()]++;
          }
        });

        // d. Formatear datos para los gráficos
        const monthlyNetIncomeData = netIncomeByMonth.map((data, index) => ({
          month: new Date(currentYear, index, 1).toLocaleDateString('es-PE', { month: 'short' }),
          income: data.income,
          expenses: data.expenses,
          net: data.income - data.expenses
        }));

        const monthsData = enrollmentByMonth.map((count, index) => ({
          month: new Date(currentYear, index, 1).toLocaleDateString('es-PE', { month: 'short' }),
          students: count
        }));

        setStats({
          activeStudents: activeStudentsCount,
          totalPayments: currentMonthIncome,
          totalExpenses: currentMonthExpenses,
          netIncome: currentMonthIncome - currentMonthExpenses,
          monthlyEnrollment: monthsData,
          monthlyNetIncome: monthlyNetIncomeData
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);


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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      showNotification('Actualizado correctamente');
    } catch (_e) { showNotification('Error al actualizar', 'error'); }
  };

  const toggleVisibility = async (collectionName, id, currentVisible) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id), {
        visible: !currentVisible,
        updatedAt: serverTimestamp()
      });
      showNotification(currentVisible ? 'Ocultado' : 'Visibilidad activada');
    } catch (_e) { showNotification('Error de visibilidad', 'error'); }
  };

  const handleReorder = async (collectionName, index, direction) => {
    // Placeholder para evitar errores si no se usa
    console.log("Reorder", collectionName, index, direction);
  };

  const menuItems = [
    { text: 'Inicio', icon: LayoutDashboard, id: 'inicio', path: '/' },
    {
      text: 'Gestión Alumnos', icon: Users,
      subItems: [
        { text: 'Directorio', id: 'directorio-alumnos', icon: Users, path: '/directorio-alumnos' },
        { text: 'Categorías', id: 'categorias', icon: BookOpen, path: '/categorias' },
        { text: 'Solicitudes Web', id: 'solicitudes', icon: Inbox, badge: pendingRequests, path: '/solicitudes' }
      ]
    },
    {
      text: 'Pagos y Mensualidades', icon: CalendarDays,
      subItems: [
        { text: 'Control de Pagos', id: 'control-pagos', icon: DollarSign, path: '/control-pagos' },
        { text: 'Pagos Pendientes', id: 'pagos-pendientes', icon: AlertCircle, badge: totalProblems, path: '/pagos-pendientes' },
        { text: 'Historial de Pagos', id: 'historial-pagos', icon: History, path: '/historial-pagos' },
        { text: 'Egresos', id: 'egresos', icon: DollarSign, path: '/egresos' },
      ]
    },
    {
      text: 'Configuración Web', icon: Settings,
      subItems: [
        { text: 'Contenidos', id: 'contenidos-web', icon: FileText, path: '/contenidos-web' },
        { text: 'Imágenes', id: 'imagenes', icon: Image, path: '/imagenes' },
        { text: 'Costos e Inscripciones', id: 'precios', icon: DollarSign, path: '/precios' },
        { text: 'Membresías', id: 'membresias', icon: CreditCard, path: '/membresias' },
        { text: 'Auspiciadores', id: 'auspiciadores', icon: Trophy, path: '/auspiciadores' },
        { text: 'Donaciones (QR)', id: 'donaciones', icon: Heart, path: '/donaciones' }
      ]
    }
  ];

  // Agrupador de Horarios por Día
  const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className={`flex h-screen ${THEME_CLASSES.bg.secondary} overflow-hidden`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 ${THEME_CLASSES.bg.surface} ${THEME_CLASSES.border.primary} border-r transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`p-6 flex items-center ${THEME_CLASSES.border.primary} border-b`}>
          <div className="bg-white rounded-full p-1 mr-2 border-2 border-red-600 overflow-hidden">
            <img src={LOGO_URL} alt="Milan Logo" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-lg ${THEME_CLASSES.text.primary} tracking-widest leading-none`}>ADMIN</span>
            {user && (
              <div className="mt-1">
                <p className="text-[10px] font-bold text-zinc-500 truncate w-32 uppercase tracking-tighter">
                  {user.displayName || 'Administrador'}
                </p>
                <p className="text-[9px] text-zinc-400 truncate w-32 lowercase font-medium">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              {item.subItems ? (
                <div className="mb-2">
                  <button
                    onClick={() => toggleSection(item.text)}
                    className={`w-full px-3 py-2 text-[10px] font-black ${THEME_CLASSES.text.tertiary} uppercase tracking-[0.2em] flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-lg transition-all duration-300 group`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {item.text}
                    </div>
                    {expandedSections[item.text] ? (
                      <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
                    ) : (
                      <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
                    )}
                  </button>
                  {expandedSections[item.text] && (
                    <div className="mt-1 ml-2 pl-2 border-l border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.subItems.map(sub => {
                        const SubIcon = sub.icon;
                        const isActive = currentPath === sub.path;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => { navigate(`/admin${sub.path}`); setSidebarOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all flex items-center justify-between ${isActive ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20' : `${THEME_CLASSES.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:translate-x-1`}`}
                          >
                            <div className="flex items-center gap-2">
                              {SubIcon && <SubIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />}
                              {sub.text}
                            </div>
                            {sub.badge > 0 && (
                              <span className={`${isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'} text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors`}>
                                {sub.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { navigate(`/admin${item.path}`); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${currentPath === item.path ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : `${THEME_CLASSES.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:translate-x-1`}`}
                >
                  <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" /> {item.text}
                </button>
              )}
            </div>
          ))}

          {/* Separador */}
          <div className={`${THEME_CLASSES.border.primary} border-t my-4`}></div>

          {/* Botón de tema */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium ${THEME_CLASSES.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:translate-x-1 transition-all group`}
          >
            {isDarkMode ? (
              <>
                <Sun className="h-5 w-5 text-yellow-500 transition-transform group-hover:rotate-90" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-indigo-500 transition-transform group-hover:-rotate-12" />
                <span>Modo Oscuro</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 hover:translate-x-1 transition-all group`}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" /> Salir
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className={`h-16 ${THEME_CLASSES.bg.surface} ${THEME_CLASSES.border.primary} border-b flex items-center justify-between px-6 flex-shrink-0`}>
          <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className={`h-6 w-6 ${THEME_CLASSES.text.secondary}`} /></button>
          <h1 className={`text-xl font-bold ${THEME_CLASSES.text.primary} ml-2 md:ml-0`}>
            {PAGE_TITLES[adminTab] || 'Panel Administrativo'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={
              loadingStats ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className={`w-12 h-12 animate-spin ${THEME_CLASSES.text.primary}`} />
                  <p className={`${THEME_CLASSES.text.secondary} animate-pulse font-medium`}>Cargando datos...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                      <div className="absolute right-0 top-0 p-4 opacity-5"><Users className="w-24 h-24" /></div>
                      <h3 className={`${THEME_CLASSES.text.secondary} text-xs font-bold uppercase tracking-wider`}>Alumnos Activos</h3>
                      <p className={`text-4xl font-black ${THEME_CLASSES.text.primary} mt-2`}>
                        {stats.activeStudents}
                      </p>
                    </div>
                    <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                      <div className="absolute right-0 top-0 p-4 opacity-5"><DollarSign className="w-24 h-24" /></div>
                      <h3 className={`${THEME_CLASSES.text.secondary} text-xs font-bold uppercase tracking-wider`}>Ingresos (Mes)</h3>
                      <p className="text-4xl font-black text-green-600 mt-2">
                        S/ {stats.totalPayments.toFixed(2)}
                      </p>
                    </div>
                    <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                      <div className="absolute right-0 top-0 p-4 opacity-5"><FileText className="w-24 h-24" /></div>
                      <h3 className={`${THEME_CLASSES.text.secondary} text-xs font-bold uppercase tracking-wider`}>Egresos (Mes)</h3>
                      <p className="text-4xl font-black text-red-600 mt-2">
                        S/ {stats.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border relative overflow-hidden`}>
                      <div className="absolute right-0 top-0 p-4 opacity-5"><Trophy className="w-24 h-24" /></div>
                      <h3 className={`${THEME_CLASSES.text.secondary} text-xs font-bold uppercase tracking-wider`}>Neto (Mes)</h3>
                      <p className={`text-4xl font-black mt-2 ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        S/ {stats.netIncome.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* GRÁFICO DE INGRESOS NETOS POR MES */}
                  <div className="w-full">
                    <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                      <h3 className={`text-lg font-bold ${THEME_CLASSES.text.primary} mb-6`}>Balance Financiero {new Date().getFullYear()}</h3>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={stats.monthlyNetIncome}>
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
                          />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#16a34a"
                            strokeWidth={4}
                            name="Ingresos"
                            dot={{ r: 4, fill: '#16a34a', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#dc2626"
                            strokeWidth={4}
                            name="Egresos"
                            dot={{ r: 4, fill: '#dc2626', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
            } />
            <Route path="/directorio-alumnos" element={<StudentsView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} />} />
            <Route path="/categorias" element={<CategoriesView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} />} />
            <Route path="/control-pagos" element={<PaymentsView categories={categories} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} showNotification={showNotification} />} />
            <Route path="/pagos-pendientes" element={<PendingPaymentsView showNotification={showNotification} />} />
            <Route path="/historial-pagos" element={<PaymentHistoryView categories={categories} showNotification={showNotification} />} />
            <Route path="/egresos" element={<ExpensesView showNotification={showNotification} />} />
            <Route path="/contenidos-web" element={<WebConfigView news={news} achievements={achievements} schedules={schedules} handleAdd={handleAdd} handleDelete={handleDelete} handleUpdate={handleUpdate} toggleVisibility={toggleVisibility} showNotification={showNotification} handleReorder={handleReorder} />} />
            <Route path="/imagenes" element={<SiteImagesView showNotification={showNotification} />} />
            <Route path="/precios" element={<PricingConfigView showNotification={showNotification} />} />
            <Route path="/membresias" element={<MembershipsView showNotification={showNotification} />} />
            <Route path="/auspiciadores" element={<SponsorsView showNotification={showNotification} />} />
            <Route path="/donaciones" element={<DonationConfigView showNotification={showNotification} />} />
            <Route path="/solicitudes" element={<RequestsView handleDelete={handleDelete} showNotification={showNotification} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
