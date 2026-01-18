import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db, appId } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { THEME_CLASSES } from './utils/theme';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
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
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    if (!user) return;
   
    const setupListener = (colName, setState) => {
      // Colecciones que usan ordenamiento manual por campo 'order'
      const webCollections = ['news', 'achievements', 'schedules'];
      const isWebCollection = webCollections.includes(colName);
      
      // Si es colección web, ordenar por campo 'order' en Firebase
      const q = isWebCollection 
        ? query(collection(db, 'artifacts', appId, 'public', 'data', colName), orderBy('order', 'asc'))
        : query(collection(db, 'artifacts', appId, 'public', 'data', colName));
      
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Solo aplicar ordenamiento por fecha si NO es colección web
        if (!isWebCollection) {
          data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }
        
        setState(data);
      }, (err) => console.error(`Error fetching ${colName}:`, err));
    };

    const unsubs = [
      setupListener('news', setNews),
      setupListener('achievements', setAchievements),
      setupListener('schedules', setSchedules),
      setupListener('students', setStudents),
      setupListener('categories', setCategories),
      setupListener('payments', setPayments)
    ];

    return () => unsubs.forEach(u => u());
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="font-sans min-h-screen">
      <Notification notification={notification} />
      <WelcomeModal />
     
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

      {view === 'admin-login' && <LoginScreen setView={setView} />}
      
      {view === 'admin-dashboard' && (
        <AdminDashboard
          setView={setView}
          students={students}
          categories={categories}
          payments={payments}
          news={news}
          achievements={achievements}
          schedules={schedules}
          showNotification={showNotification}
        />
      )}
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
