import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { auth, db, appId } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { THEME_CLASSES } from './utils/theme';
import LandingScreen from './screens/LandingScreen';
const LoginScreen = React.lazy(() => import('./screens/LoginScreen'));
const AdminDashboard = React.lazy(() => import('./screens/AdminDashboard'));
import Notification from './shared/Notification';
import WelcomeModal from './shared/WelcomeModal';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

function AppContent() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- Dynamic Data State ---
  const [news, setNews] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Global loading state
  const [loadingData, setLoadingData] = useState(true);

  // Friendly loading phrases
  const LOADING_PHRASES = [
    "Preparando la cancha...",
    "Inflando los balones...",
    "Convocando a los jugadores...",
    "Alistando el entrenamiento...",
    "Cargando próximas victorias...",
    "Organizando los horarios..."
  ];
  const [currentPhrase, setCurrentPhrase] = useState(LOADING_PHRASES[0]);

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // No iniciamos sesión de forma anónima automáticamente
        // para evitar llenar la consola de Firebase con usuarios "anónimos"
        setUser({ uid: 'guest', isAnonymous: true, isGuest: true });
      }
    });

    return () => unsubscribe();
  }, []);

  // Cycle loading phrases
  useEffect(() => {
    if (!loadingData) return;
    const interval = setInterval(() => {
      setCurrentPhrase(prev => {
        const currentIndex = LOADING_PHRASES.indexOf(prev);
        return LOADING_PHRASES[(currentIndex + 1) % LOADING_PHRASES.length];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [loadingData]);

  // --- Data Fetching (PUBLIC ONLY) ---
  useEffect(() => {
    if (!user) return;

    const loadStatus = { news: false, achievements: false, schedules: false };
    const safetyTimeout = setTimeout(() => {
      setLoadingData(false);
    }, 1500);

    const checkAllLoaded = () => {
      if (loadStatus.news && loadStatus.achievements && loadStatus.schedules) {
        clearTimeout(safetyTimeout);
        setLoadingData(false);
      }
    };

    const setupListener = (colName, setState) => {
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', colName),
        orderBy('order', 'asc')
      );

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(data);
        if (!loadStatus[colName]) {
          loadStatus[colName] = true;
          checkAllLoaded();
        }
      }, (err) => {
        console.error(`Error fetching ${colName}:`, err);
        if (!loadStatus[colName]) {
          loadStatus[colName] = true;
          checkAllLoaded();
        }
      });
    };

    const unsubs = [
      setupListener('news', setNews),
      setupListener('achievements', setAchievements),
      setupListener('schedules', setSchedules)
    ];

    return () => {
      unsubs.forEach(u => u());
      clearTimeout(safetyTimeout);
    };
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loadingData || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-colors">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-xl font-bold text-zinc-800 dark:text-white animate-pulse mb-2 text-center px-4">
          {currentPhrase}
        </p>
        <p className="text-sm text-zinc-500 font-medium">Solo tomará unos segundos...</p>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen">
      <Notification notification={notification} />

      <Routes>
        <Route path="/" element={
          <>
            <WelcomeModal />
            <LandingScreen
              setView={(v) => {
                if (v === 'admin-login') navigate('/login');
                if (v === 'admin-dashboard') navigate('/admin');
              }}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              achievements={achievements}
              schedules={schedules}
              news={news}
              user={user}
              showNotification={showNotification}
            />
          </>
        } />

        <Route path="/login" element={
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>}>
            <LoginScreen setView={(v) => navigate(v === 'admin-dashboard' ? '/admin' : '/')} />
          </React.Suspense>
        } />

        <Route path="/admin/*" element={
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>}>
            <AdminDashboard
              setView={(v) => navigate('/')}
              news={news}
              achievements={achievements}
              schedules={schedules}
              showNotification={showNotification}
            />
          </React.Suspense>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
