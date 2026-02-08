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

function AppContent() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // --- Dynamic Data State ---
  const [news, setNews] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Global loading state for initial data fetch (Landing FOUC prevention)
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
        // Si ya hay un usuario (anónimo o no), lo usamos y NO creamos uno nuevo.
        setUser(currentUser);
      } else {
        // Solo si NO hay usuario, iniciamos sesión anónima.
        console.log("No user detected, signing in anonymously...");
        signInAnonymously(auth).catch((error) => {
          console.error("Auth Error:", error);
          if (error.code === 'auth/admin-restricted-operation') {
            console.warn("Please enable Anonymous Authentication in the Firebase Console.");
          }
          // Fallback UI (opcional)
          setUser({ uid: 'guest', isAnonymous: true });
        });
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
    // If we require auth for data, checking !user here blocks everything if auth fails.
    // For now, we'll keep it, assuming user fixes Auth in console.
    if (!user) return;

    // Track loading status of each collection
    const loadStatus = { news: false, achievements: false, schedules: false };

    // Safety timeout to ensure app always loads eventually
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

        // Mark this collection as loaded on first fetch
        if (!loadStatus[colName]) {
          loadStatus[colName] = true;
          checkAllLoaded();
        }
      }, (err) => {
        console.error(`Error fetching ${colName}:`, err);
        // Even on error, mark as "processed" to not block app
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

  if (view === 'landing' && (loadingData || !user)) {
    // If auth failed, user might be null forever. 
    // We should probably show the landing anyway after timeout if user is null but auth failed?
    // For now, let's stick to original logic but we might need to revisit if auth never succeeds.
    // However, the error handling above prevents the CRASH, but user state remains null.

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
      {view === 'landing' && <WelcomeModal />}

      {view === 'landing' && (
        <LandingScreen
          setView={setView}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          achievements={achievements}
          schedules={schedules}
          news={news}
          user={user}
          showNotification={showNotification}
        />
      )}

      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      }>
        {view === 'admin-login' && <LoginScreen setView={setView} />}

        {view === 'admin-dashboard' && (
          <AdminDashboard
            setView={setView}
            news={news}
            achievements={achievements}
            schedules={schedules}
            showNotification={showNotification}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
