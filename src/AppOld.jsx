import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db, appId } from './firebase';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import Notification from './shared/Notification';



// --- Data Fallbacks ---

const DEFAULT_NEWS = [

  { id: '1', tag: "Torneo", title: "Inicio del Torneo Apertura SJM", desc: "Nuestras categorías Sub-12 y Sub-14 debutan este fin de semana.", visible: true },

  { id: '2', tag: "Convocatoria", title: "Pruebas masivas 2026", desc: "Buscamos nuevos talentos nacidos entre 2010 y 2018.", visible: true },

];

const DEFAULT_ACHIEVEMENTS = [

  { id: '1', title: "Campeones Copa SJM", year: "2025", desc: "Categoría Sub-12 invictos.", img: "https://images.unsplash.com/photo-1561917443-6c5a9a4fca6e?auto=format&fit=crop&w=600&q=80", visible: true },

  { id: '2', title: "Subcampeones Liga", year: "2024", desc: "Gran desempeño del equipo titular.", img: "https://images.unsplash.com/photo-1518605348399-52319b027d72?auto=format&fit=crop&w=600&q=80", visible: true }

];

const DEFAULT_SCHEDULE = [

  { id: '1', cat: "Categoría 2017-2019 (Sub-6/8)", time: "Lun, Mié, Vie: 4:00 PM - 5:30 PM", visible: true },

  { id: '2', cat: "Categoría 2014-2016 (Sub-10/12)", time: "Lun, Mié, Vie: 5:30 PM - 7:00 PM", visible: true },

];



// --- Main App Component ---

export default function App() {

  const [user, setUser] = useState(null);

  const [view, setView] = useState('landing');

  const [adminTab, setAdminTab] = useState('overview');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notification, setNotification] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(false);



  // --- Dynamic Data State ---

  const [news, setNews] = useState([]);

  const [achievements, setAchievements] = useState([]);

  const [schedules, setSchedules] = useState([]);

  const [students, setStudents] = useState([]);

  const [categories, setCategories] = useState([]);

  const [payments, setPayments] = useState([]);



  // Auth & Theme
  useEffect(() => {
    const initAuth = async () => {
      await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);



  useEffect(() => {

    document.documentElement.classList.toggle('dark', isDarkMode);

  }, [isDarkMode]);



  // --- Data Fetching ---

  useEffect(() => {

    if (!user) return;

   

    const setupListener = (colName, setState) => {

      const q = query(collection(db, 'artifacts', appId, 'public', 'data', colName));

      return onSnapshot(q, (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordenar por fecha de creación descendente

        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

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



  // --- Components ---



  const Navbar = () => (

    <nav className="bg-white dark:bg-black sticky top-0 z-50 shadow-md border-b-4 border-red-600 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between h-20 items-center">

          <div className="flex items-center cursor-pointer" onClick={() => setView('landing')}>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 mr-3 border-2 border-red-600">

              <Dribbble className="h-8 w-8 text-red-600 animate-spin-slow" />

            </div>

            <div>

              <span className="font-bold text-xl tracking-tighter uppercase block leading-none text-zinc-900 dark:text-white">Escuela Deportiva</span>

              <span className="font-black text-2xl text-red-600 tracking-widest block leading-none">MILAN</span>

            </div>

          </div>

         

          <div className="hidden md:flex space-x-6 items-center">

            {['Historia', 'Logros', 'Horarios'].map((item) => (

              <button

                key={item}

                onClick={() => { setView('landing'); setTimeout(() => document.getElementById(item.toLowerCase())?.scrollIntoView({behavior: 'smooth'}), 100); }}

                className="text-zinc-600 dark:text-zinc-300 hover:text-red-600 font-medium transition"

              >

                {item}

              </button>

            ))}

            <button

              onClick={() => { setView('landing'); setTimeout(() => document.getElementById('matricula')?.scrollIntoView({behavior: 'smooth'}), 100); }}

              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition transform hover:scale-105 shadow-md flex items-center"

            >

              Matrícula 2026 <ArrowRight className="ml-2 h-4 w-4" />

            </button>

            <div className="flex items-center space-x-2 border-l border-zinc-200 dark:border-zinc-700 pl-4 ml-2">

              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition">

                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}

              </button>

              <button onClick={() => setView('admin-login')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition">

                <Lock className="h-5 w-5" />

              </button>

            </div>

          </div>

          <div className="md:hidden flex items-center gap-4">

             <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-zinc-500 dark:text-zinc-400">

                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}

             </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-900 dark:text-white hover:text-red-500">

              <Menu className="h-8 w-8" />

            </button>

          </div>

        </div>

      </div>

      {isMobileMenuOpen && (

        <div className="md:hidden bg-white dark:bg-zinc-900 pb-4 px-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 shadow-xl">

          <button onClick={() => { setView('landing'); setIsMobileMenuOpen(false); }} className="block py-3 w-full text-left font-medium text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800">Inicio</button>

          <button onClick={() => { document.getElementById('matricula')?.scrollIntoView(); setIsMobileMenuOpen(false); }} className="block py-3 w-full text-left font-bold text-red-600">Matrícula</button>

          <button onClick={() => { setView('admin-login'); setIsMobileMenuOpen(false); }} className="block py-3 w-full text-left font-medium text-zinc-500 text-sm flex items-center">

            <Lock className="h-4 w-4 mr-2"/> Acceso Admin

          </button>

        </div>

      )}

    </nav>

  );



  // --- Dynamic Landing Sections ---



  const Achievements = () => {

    // Logic: Filter only visible, limit to 6

    const sourceData = achievements.length > 0 ? achievements : DEFAULT_ACHIEVEMENTS;

    const displayData = sourceData

      .filter(item => item.visible !== false)

      .slice(0, 6);



    return (

      <section id="logros" className="py-20 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">

            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4">Nuestros Logros</h2>

            <div className="w-20 h-1 bg-red-600 mx-auto"></div>

            <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">Mostrando los {displayData.length} más recientes</p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {displayData.map((item, idx) => (

              <div key={idx} className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 border border-zinc-100 dark:border-zinc-700 flex flex-col">

                <div className="h-48 overflow-hidden bg-zinc-200 dark:bg-zinc-700 relative">

                  <img src={item.img || "https://placehold.co/600x400/red/white?text=Logro"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />

                </div>

                <div className="p-6 flex-1 flex flex-col">

                  <div className="flex justify-between items-center mb-2">

                    <h3 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1">{item.title}</h3>

                    <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">{item.year}</span>

                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3">{item.desc}</p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    );

  };



  const Schedule = () => {

    const sourceData = schedules.length > 0 ? schedules : DEFAULT_SCHEDULE;

    const displayData = sourceData.filter(item => item.visible !== false);

   

    return (

      <section id="horarios" className="py-20 bg-zinc-900 text-white border-t border-zinc-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-2 gap-12">

            <div>

              <h2 className="text-3xl font-black mb-6 flex items-center">

                <Calendar className="mr-3 text-red-600" /> Horarios de Entrenamiento

              </h2>

              <p className="text-zinc-400 mb-8">

                Entrenamientos diferenciados por edad para garantizar el correcto aprendizaje técnico y táctico.

              </p>

              <div className="space-y-4">

                {displayData.map((sch, i) => (

                  <div key={i} className="bg-zinc-800 p-4 rounded-lg border-l-4 border-red-600 hover:bg-zinc-700 transition">

                    <h4 className="font-bold text-lg">{sch.cat}</h4>

                    <p className="text-zinc-400 text-sm mt-1">{sch.time}</p>

                  </div>

                ))}

              </div>

            </div>

            <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800">

                <img src="https://i.postimg.cc/q7BCRrMw/CAMPO-DEPORTIVO-VIRGEN-DE-LOURDES-PARADERO-11.jpg" alt="Soccer field" className="absolute inset-0 w-full h-full object-cover opacity-60"/>

                <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-t from-black/80 to-transparent">

                  <div className="text-center">

                    <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />

                    <h3 className="text-2xl font-bold">CAMPO DE FUTBOL DE LA ASODE PROLIGA DE DEPORTE "VIRGEN DE LOURDES" "</h3>

                    <p className="text-zinc-300 mt-2">Paradero 11 Nueva Esperanza - virgen de Lourdes
</p>

                  </div>

                </div>

            </div>

          </div>

        </div>

      </section>

    );

  };



  const News = () => {

    const sourceData = news.length > 0 ? news : DEFAULT_NEWS;

    const displayData = sourceData

      .filter(item => item.visible !== false)

      .slice(0, 3); // Max 3 news



    return (

      <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-10 flex items-center justify-between">

            <span className="flex items-center"><Newspaper className="mr-3 text-red-600" /> Últimas Noticias</span>

            {sourceData.length > 3 && <span className="text-xs font-normal text-zinc-500">Ver todas ({sourceData.length})</span>}

          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {displayData.map((item, i) => (

              <div key={i} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition flex flex-col">

                <div className="mb-3 flex justify-between items-start">

                  <span className="text-xs font-bold text-red-600 uppercase bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">{item.tag}</span>

                  <span className="text-xs text-zinc-400">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Hoy'}</span>

                </div>

                <h3 className="text-xl font-bold mt-2 mb-3 text-zinc-900 dark:text-white line-clamp-2">{item.title}</h3>

                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3 flex-1">{item.desc}</p>

                <button className="text-red-600 font-bold text-sm hover:underline flex items-center mt-auto">Leer más <ChevronRight className="h-4 w-4" /></button>

              </div>

            ))}

          </div>

        </div>

      </section>

    );

  };



  const AboutCarousel = () => {

    const images = [

      "https://i.postimg.cc/nzHTpgN0/sobre-nosotros-1.png",

      "https://i.postimg.cc/WzqZv7p9/sobre-nosotros-3.png",

      "https://i.postimg.cc/pdkzYT1q/sobre-nosotros-2.png"

    ];

    const [idx, setIdx] = useState(0);



    const next = () => setIdx((prev) => (prev + 1) % images.length);

    const prev = () => setIdx((prev) => (prev - 1 + images.length) % images.length);



    return (

      <section id="historia" className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div className="relative group">

              <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full z-0"></div>

              <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden h-[400px]">

                <img

                  src={images[idx]}

                  alt={`Coach talking to kids ${idx + 1}`}

                  className="w-full h-full object-cover transition duration-500"

                />

                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">

                  <button onClick={prev} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80"><ChevronLeft className="h-6 w-6"/></button>

                  <button onClick={next} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80"><ChevronRight className="h-6 w-6"/></button>

                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">

                  {images.map((_, i) => (

                    <div key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-red-600' : 'bg-white/50'}`}></div>

                  ))}

                </div>

              </div>

            </div>

            <div>

              <h2 className="text-red-600 font-bold tracking-widest uppercase mb-2">Sobre Nosotros</h2>

              <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-6">Más que una escuela,<br/>una familia deportiva.</h3>

              <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-6 leading-relaxed">

                La <strong className="text-zinc-900 dark:text-white">Escuela Deportiva Milan</strong> es un espacio formativo en San Juan de Miraflores donde niños y niñas aprenden, crecen y desarrollan su talento futbolístico.

              </p>

              <ul className="space-y-4">

                <li className="flex items-start">

                  <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />

                  <span className="text-zinc-700 dark:text-zinc-300">Participación activa en torneos oficiales FPF y Liga Amateur.</span>

                </li>

                <li className="flex items-start">

                  <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />

                  <span className="text-zinc-700 dark:text-zinc-300">Formación basada en valores: disciplina, respeto y trabajo en equipo.</span>

                </li>

              </ul>

            </div>

          </div>

        </div>

      </section>

    );

  };



  const RegistrationSection = () => {

    const [formData, setFormData] = useState({

      childName: '', birthDate: '', parentName: '', phone: '', email: '', category: '2014-2016', notes: ''

    });

    const [loading, setLoading] = useState(false);



    const handleSubmit = async (e) => {

      e.preventDefault();

      if(!user) return;

      setLoading(true);

      try {

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'registrations'), {

          ...formData,

          createdAt: serverTimestamp(),

          status: 'Pendiente',

          year: new Date().getFullYear()

        });

        showNotification('¡Pre-inscripción enviada! Te contactaremos.');
        setFormData({ childName: '', birthDate: '', parentName: '', phone: '', email: '', category: '2014-2016', notes: '' });
      } catch (_error) {
        showNotification('Error al enviar.', 'error');

      } finally {

        setLoading(false);

      }

    };

   

    return (

     <section id="matricula" className="pt-20 bg-gradient-to-br from-red-700 to-red-900 text-white">

  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* CARD */}
    <div className="relative z-20 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md 
    text-zinc-900 dark:text-white rounded-2xl shadow-2xl 
    overflow-hidden flex flex-col md:flex-row transition-colors duration-300">

      <div className="md:w-1/3 bg-black/60 text-white p-8 flex flex-col justify-between">

        <div>
          <h3 className="text-2xl font-bold mb-4">Matrícula 2026</h3>
          <p className="text-zinc-300 text-sm mb-6">
            Asegura tu vacante en la mejor escuela de SJM. Cupos limitados.
          </p>
        </div>

        <Dribbble className="h-24 w-24 text-zinc-300 mx-auto" />

      </div>

      <div className="md:w-2/3 p-8">
        <h3 className="text-2xl font-bold text-red-600 mb-6">
          Formulario de Inscripción
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
              placeholder="Nombre Alumno"
              value={formData.childName}
              onChange={e => setFormData({ ...formData, childName: e.target.value })}
            />

            <input
              required
              type="date"
              className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
              value={formData.birthDate}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          <input
            required
            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
            placeholder="Nombre Apoderado"
            value={formData.parentName}
            onChange={e => setFormData({ ...formData, parentName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />

            <select
              className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="2017-2019">Sub-6/8 (2017-2019)</option>
              <option value="2014-2016">Sub-10/12 (2014-2016)</option>
              <option value="2010-2013">Sub-14/16 (2010-2013)</option>
              <option value="Arqueros">Arqueros</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition"
          >
            Enviar
          </button>

        </form>
      </div>

    </div>
  </div>

  {/* SVG SIN MODIFICAR */}
  <svg xmlns="http://www.w3.org/2000/svg" className="w-full -mt-60 relative z-0" viewBox="0 0 1440 320">
    <path fill="#27272A">
      <animate 
        attributeName="d"
        dur="6s"
        repeatCount="indefinite"
        values="
        M0,32L18.5,53.3C36.9,75,74,117,111,128C147.7,139,185,117,222,117.3C258.5,117,295,139,332,160C369.2,181,406,203,443,197.3C480,192,517,160,554,170.7C590.8,181,628,235,665,234.7C701.5,235,738,181,775,176C812.3,171,849,213,886,234.7C923.1,256,960,256,997,256C1033.8,256,1071,256,1108,256C1144.6,256,1182,256,1218,213.3C1255.4,171,1292,85,1329,64C1366.2,43,1403,85,1422,106.7L1440,128L1440,320L0,320Z;

        M0,64L18.5,74.7C36.9,85,74,107,111,128C147.7,149,185,171,222,176C258.5,181,295,171,332,160C369.2,149,406,139,443,144C480,149,517,171,554,176C590.8,181,628,171,665,160C701.5,149,738,139,775,149.3C812.3,160,849,192,886,202.7C923.1,213,960,203,997,192C1033.8,181,1071,171,1108,165.3C1144.6,160,1182,160,1218,165.3C1255.4,171,1292,181,1329,181.3C1366.2,181,1403,171,1422,165.3L1440,160L1440,320L0,320Z;

        M0,32L18.5,53.3C36.9,75,74,117,111,128C147.7,139,185,117,222,117.3C258.5,117,295,139,332,160C369.2,181,406,203,443,197.3C480,192,517,160,554,170.7C590.8,181,628,235,665,234.7C701.5,235,738,181,775,176C812.3,171,849,213,886,234.7C923.1,256,960,256,997,256C1033.8,256,1071,256,1108,256C1144.6,256,1182,256,1218,213.3C1255.4,171,1292,85,1329,64C1366.2,43,1403,85,1422,106.7L1440,128L1440,320L0,320Z;
        "
      />
    </path>
  </svg>

</section>



    );

  };



  const Footer = () => (

    <footer className="bg-black text-white py-12 border-t border-zinc-800">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <h2 className="text-2xl font-black uppercase tracking-tighter">Escuela Deportiva Milan</h2>

        <p className="text-zinc-500 text-sm mt-1">© 2026. Todos los derechos reservados.</p>

      </div>

    </footer>

  );



  // --- Admin Logic & Components ---



  const Login = () => {

    const [username, setUsername] = useState('');

    const [pass, setPass] = useState('');

    const [error, setError] = useState('');



    const handleLogin = (e) => {

      e.preventDefault();

      // Verificación de credenciales (Usuario: admin, Clave: milan123)

      if (username === 'admin' && pass === 'milan123') {

        setView('admin-dashboard');

      } else {

        setError('Credenciales incorrectas');

      }

    };



    return (

      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-800">

          <div className="text-center mb-6">

            <Lock className="text-red-600 h-10 w-10 mx-auto mb-2" />

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Login</h2>

          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            <input

              type="text"

              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 rounded"

              value={username}

              onChange={e => setUsername(e.target.value)}

              placeholder="Usuario"

              autoComplete="username"

            />

            <input

              type="password"

              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 rounded"

              value={pass}

              onChange={e => setPass(e.target.value)}

              placeholder="Contraseña"

              autoComplete="current-password"

            />

            {error && <p className="text-red-600 text-xs text-center">{error}</p>}

            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded">Ingresar</button>

            <button type="button" onClick={() => setView('landing')} className="w-full text-zinc-500 text-sm">Volver al Sitio</button>

          </form>

          <div className="mt-4 text-center">

            <p className="text-xs text-zinc-400">Credenciales Demo: <br/>Usuario: <span className="font-mono font-bold">admin</span> / Clave: <span className="font-mono font-bold">milan123</span></p>

          </div>

        </div>

      </div>

    );

  };



  const AdminDashboard = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);

   

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



    // Modal Component

    const Modal = ({ isOpen, onClose, title, children }) => {

      if (!isOpen) return null;

      return (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-slide-up">

            <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700">

              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{title}</h3>

              <button onClick={onClose}><X className="h-5 w-5 text-zinc-500 hover:text-red-500" /></button>

            </div>

            <div className="p-6">{children}</div>

          </div>

        </div>

      );

    };



    const GenericTable = ({ title, data, columns, onDelete, collectionName }) => {

      const [confirmId, setConfirmId] = useState(null);



      return (

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-8">

          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800">

            <h3 className="font-bold text-zinc-800 dark:text-white">{title}</h3>

            <span className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-full">{data.length} Items</span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-400">

              <thead className="bg-zinc-100 dark:bg-zinc-950 uppercase text-xs">

                <tr>

                  {columns.map((c, i) => <th key={i} className="px-6 py-3">{c.header}</th>)}

                  {collectionName && <th className="px-6 py-3">Visibilidad</th>}

                  <th className="px-6 py-3">Acciones</th>

                </tr>

              </thead>

              <tbody>

                {data.map((row) => (

                  <tr key={row.id} className={`border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${row.visible === false ? 'opacity-50' : ''}`}>

                    {columns.map((c, i) => <td key={i} className="px-6 py-4">{c.render ? c.render(row) : row[c.field]}</td>)}

                    {collectionName && (

                      <td className="px-6 py-4">

                        <button onClick={() => toggleVisibility(collectionName, row.id, row.visible !== false)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${row.visible !== false ? 'bg-green-100 text-green-800' : 'bg-zinc-200 text-zinc-600'}`}>

                          {row.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}

                          {row.visible !== false ? 'Visible' : 'Oculto'}

                        </button>

                      </td>

                    )}

                    <td className="px-6 py-4">

                      {confirmId === row.id ? (

                        <div className="flex gap-2">

                          <button onClick={() => { onDelete(row.id); setConfirmId(null); }} className="text-red-600 font-bold text-xs">Confirmar</button>

                          <button onClick={() => setConfirmId(null)} className="text-zinc-400"><X className="h-4 w-4"/></button>

                        </div>

                      ) : (

                        <button onClick={() => setConfirmId(row.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 className="h-4 w-4"/></button>

                      )}

                    </td>

                  </tr>

                ))}

                {data.length === 0 && <tr><td colSpan={columns.length + (collectionName ? 2 : 1)} className="p-6 text-center">No hay datos registrados.</td></tr>}

              </tbody>

            </table>

          </div>

        </div>

      );

    };



    // --- Sub-Views Implementations ---



    const StudentsView = () => {

      const [showForm, setShowForm] = useState(false);

      const [newStudent, setNewStudent] = useState({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });

     

      const submitStudent = (e) => {

        e.preventDefault();

        handleAdd('students', newStudent);

        setShowForm(false);

        setNewStudent({ name: '', dob: '', category: '', parent: '', phone: '', status: 'Activo' });

      };



      return (

        <div className="space-y-6">

          <div className="flex justify-between items-center">

            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Directorio de Alumnos</h2>

            <button onClick={() => setShowForm(!showForm)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 font-bold text-sm"><Plus className="h-4 w-4 mr-2"/> Nuevo Alumno</button>

          </div>



          {showForm && (

            <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg animate-fade-in-up border border-zinc-200 dark:border-zinc-700">

              <form onSubmit={submitStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input required placeholder="Nombre Completo" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />

                <input required type="date" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} />

                <select className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.category} onChange={e => setNewStudent({...newStudent, category: e.target.value})}>

                  <option value="">Seleccionar Categoría</option>

                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}

                </select>

                <input required placeholder="Apoderado" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.parent} onChange={e => setNewStudent({...newStudent, parent: e.target.value})} />

                <input required placeholder="Teléfono" className="p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />

                <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">

                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-300 dark:bg-zinc-700 rounded font-bold">Cancelar</button>

                    <button type="submit" className="px-4 py-2 bg-zinc-900 dark:bg-white dark:text-black text-white rounded font-bold">Guardar Alumno</button>

                </div>

              </form>

            </div>

          )}



          <GenericTable

            title="Lista de Alumnos"

            data={students}

            onDelete={(id) => handleDelete('students', id)}

            columns={[

              { header: 'Nombre', field: 'name', render: (r) => <div className="font-bold text-zinc-900 dark:text-white">{r.name}</div> },

              { header: 'Categoría', field: 'category', render: (r) => <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{r.category || 'Sin Cat'}</span> },

              { header: 'Apoderado', field: 'parent' },

              { header: 'Contacto', field: 'phone' },

              { header: 'Estado', field: 'status', render: (r) => <span className={`text-xs px-2 py-1 rounded ${r.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span> }

            ]}

          />

        </div>

      );

    };



    const CategoriesView = () => {

      const [newCat, setNewCat] = useState({ name: '', range: '' });

      return (

        <div className="space-y-6">

          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Gestión de Categorías</h2>

          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded flex flex-col md:flex-row gap-2 border border-zinc-200 dark:border-zinc-700">

            <input placeholder="Nombre (Ej: Sub-12)" className="flex-1 p-2 rounded dark:bg-zinc-900 dark:border-zinc-700 border" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />

            <input placeholder="Rango Edad (Ej: 2014-2016)" className="flex-1 p-2 rounded dark:bg-zinc-900 dark:border-zinc-700 border" value={newCat.range} onChange={e => setNewCat({...newCat, range: e.target.value})} />

            <button onClick={() => { handleAdd('categories', newCat); setNewCat({name:'', range:''}) }} className="bg-red-600 text-white px-4 py-2 rounded font-bold">Crear Categoría</button>

          </div>

          <GenericTable

            title="Categorías Activas"

            data={categories}

            onDelete={(id) => handleDelete('categories', id)}

            columns={[

              { header: 'Nombre', field: 'name', render: r => <span className="font-bold text-zinc-800 dark:text-white">{r.name}</span> },

              { header: 'Rango de Edad', field: 'range' }

            ]}

          />

        </div>

      );

    };



    const PaymentsView = () => {

      const [selCategory, setSelCategory] = useState('');

      const [selStudent, setSelStudent] = useState('');

      const [selMonth, setSelMonth] = useState('');

      const [amount, setAmount] = useState('');

      const [filteredStudents, setFilteredStudents] = useState([]);



      useEffect(() => {
        if (selCategory) {
          setFilteredStudents(students.filter(s => s.category === selCategory));
        } else {
          setFilteredStudents([]);
        }
      }, [selCategory]);



      const handleRegisterPayment = () => {

        if(!selStudent || !selMonth || !amount) { showNotification('Complete todos los campos', 'error'); return; }

       

        handleAdd('payments', {

          studentId: selStudent,

          studentName: selStudent,

          category: selCategory,

          month: selMonth,

          year: new Date().getFullYear(),

          paymentDate: serverTimestamp(),

          amount: amount,

          status: 'Pagado'

        });

        setAmount('');

      };



      return (

        <div className="space-y-6">

          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Control de Pagos</h2>

         

          <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">

             <h3 className="font-bold mb-4 text-zinc-700 dark:text-zinc-300">Registrar Nuevo Pago (Año Actual: {new Date().getFullYear()})</h3>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* 1. Select Category */}

                <div>

                  <label className="block text-xs font-bold text-zinc-500 mb-1">1. Categoría</label>

                  <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={selCategory} onChange={e => setSelCategory(e.target.value)}>

                    <option value="">Seleccione...</option>

                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}

                  </select>

                </div>

               

                {/* 2. Select Student (Filtered) */}

                <div>

                  <label className="block text-xs font-bold text-zinc-500 mb-1">2. Alumno</label>

                  <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={selStudent} onChange={e => setSelStudent(e.target.value)} disabled={!selCategory}>

                    <option value="">{selCategory ? 'Seleccione Alumno...' : 'Seleccione Categoría primero'}</option>

                    {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}

                  </select>

                </div>



                {/* 3. Month & Amount */}

                <div>

                  <label className="block text-xs font-bold text-zinc-500 mb-1">3. Mes</label>

                  <select className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={selMonth} onChange={e => setSelMonth(e.target.value)}>

                    <option value="">Seleccione...</option>

                    {['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(m => <option key={m} value={m}>{m}</option>)}

                  </select>

                </div>



                <div className="flex gap-2 items-end">

                   <div className="flex-1">

                      <label className="block text-xs font-bold text-zinc-500 mb-1">Monto (S/.)</label>

                      <input type="number" className="w-full p-2 rounded border dark:bg-zinc-900 dark:border-zinc-700" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />

                   </div>

                   <button onClick={handleRegisterPayment} className="bg-green-600 text-white p-2 rounded h-[42px] px-4 hover:bg-green-700 flex items-center justify-center"><Save className="h-5 w-5"/></button>

                </div>

             </div>

          </div>



          <GenericTable

            title="Historial de Pagos Recientes"

            data={payments}

            onDelete={(id) => handleDelete('payments', id)}

            columns={[

              { header: 'Fecha Pago', field: 'paymentDate', render: r => r.paymentDate?.seconds ? new Date(r.paymentDate.seconds * 1000).toLocaleDateString() + ' ' + new Date(r.paymentDate.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Hoy' },

              { header: 'Alumno', field: 'studentName' },

              { header: 'Concepto', field: 'month', render: r => `${r.month} ${r.year}` },

              { header: 'Monto', field: 'amount', render: r => `S/. ${r.amount}` },
              { header: 'Estado', field: 'status', render: () => <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Pagado</span> }

            ]}

          />

        </div>

      );

    };



    const WebConfigView = () => {

      const [modalOpen, setModalOpen] = useState(false);

      const [modalType, setModalType] = useState('');

      const [formData, setFormData] = useState({});



      const openModal = (type) => { setModalType(type); setFormData({}); setModalOpen(true); };



      const handleSave = () => {

        const collectionMap = {

          'news': 'news',

          'events': 'news',

          'achievements': 'achievements',

          'schedules': 'schedules'

        };

        const col = collectionMap[modalType];

       

        const dataToSave = { ...formData };

        if(modalType === 'events') { dataToSave.tag = 'Evento'; dataToSave.isEvent = true; }

       

        handleAdd(col, dataToSave);

        setModalOpen(false);

      };



      return (

        <div className="space-y-8">

          <div className="flex justify-between items-center">

            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Configuración Web</h2>

          </div>



          <div className="grid md:grid-cols-2 gap-6">

             <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">

                <div className="flex justify-between items-start mb-4">

                  <div>

                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Gestión de Eventos</h3>

                    <p className="text-sm text-blue-600 dark:text-blue-400">Convocatorias y actividades especiales.</p>

                  </div>

                  <button onClick={() => openModal('events')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700">

                    + Nuevo Evento

                  </button>

                </div>

                <ul className="space-y-2">

                   {news.filter(n => n.tag === 'Evento' || n.tag === 'Convocatoria').slice(0, 3).map(e => (

                     <li key={e.id} className="bg-white dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-sm flex justify-between">

                       <span>{e.title}</span>

                       <span className={`text-xs px-2 py-0.5 rounded ${e.visible !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>{e.visible !== false ? 'Activo' : 'Oculto'}</span>

                     </li>

                   ))}

                </ul>

             </div>



             <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">

                <div className="flex justify-between items-start mb-4">

                  <div>

                    <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Noticias Generales</h3>

                    <p className="text-sm text-red-600 dark:text-red-400">Artículos del blog y novedades.</p>

                  </div>

                  <button onClick={() => openModal('news')} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow hover:bg-red-700">

                    + Nueva Noticia

                  </button>

                </div>

             </div>

          </div>



          <GenericTable

            title="Todas las Noticias y Eventos"

            data={news}

            collectionName="news"

            onDelete={id => handleDelete('news', id)}

            columns={[{header:'Título', field:'title'}, {header:'Etiqueta', field:'tag'}]}

          />



          <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">

             <h3 className="text-xl font-bold">Logros Deportivos</h3>

             <button onClick={() => openModal('achievements')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-3 py-2 rounded-lg text-sm font-bold">+ Agregar Logro</button>

          </div>

          <GenericTable

            title="Logros"

            data={achievements}

            collectionName="achievements"

            onDelete={id => handleDelete('achievements', id)}

            columns={[{header:'Título', field:'title'}, {header:'Año', field:'year'}]}

          />

         

          <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">

             <h3 className="text-xl font-bold">Horarios</h3>

             <button onClick={() => openModal('schedules')} className="bg-zinc-900 dark:bg-white dark:text-black text-white px-3 py-2 rounded-lg text-sm font-bold">+ Agregar Horario</button>

          </div>

          <GenericTable

            title="Horarios"

            data={schedules}

            collectionName="schedules"

            onDelete={id => handleDelete('schedules', id)}

            columns={[{header:'Categoría', field:'cat'}, {header:'Horario', field:'time'}]}

          />



          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalType === 'events' ? 'Nuevo Evento' : modalType === 'news' ? 'Nueva Noticia' : modalType === 'achievements' ? 'Nuevo Logro' : 'Nuevo Horario'}>

             <div className="space-y-4">

               {(modalType === 'news' || modalType === 'events') && (

                 <>

                   <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />

                   <textarea className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Descripción" rows="3" value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} />

                   {modalType === 'news' && <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Etiqueta (Ej: Social, Torneo)" value={formData.tag || ''} onChange={e => setFormData({...formData, tag: e.target.value})} />}

                 </>

               )}

               {modalType === 'achievements' && (

                 <>

                   <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Título del Logro" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />

                   <input className="w-full p-2 border rounded dark:bg-zinc-800" type="number" placeholder="Año" value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} />

                   <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Descripción corta" value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} />

                 </>

               )}

               {modalType === 'schedules' && (

                 <>

                   <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Categoría (Ej: Sub-12)" value={formData.cat || ''} onChange={e => setFormData({...formData, cat: e.target.value})} />

                   <input className="w-full p-2 border rounded dark:bg-zinc-800" placeholder="Horario (Ej: Lun-Vie 4pm)" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} />

                 </>

               )}

               <button onClick={handleSave} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">Guardar</button>

             </div>

          </Modal>

        </div>

      );

    };



    const RequestsView = () => {

      const [regs, setRegs] = useState([]);

      useEffect(() => {

        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'registrations'), orderBy('createdAt', 'desc'));

        const unsub = onSnapshot(q, snap => setRegs(snap.docs.map(d => ({id: d.id, ...d.data()}))));

        return () => unsub();

      }, []);



      const updateStatus = async (id, val) => {

        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registrations', id), { status: val });

        showNotification('Estado actualizado');

      };



      return (

        <div>

           <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">Solicitudes de Matrícula</h2>

           <GenericTable

             title="Inscripciones Web"

             data={regs}

             onDelete={id => handleDelete('registrations', id)}

             columns={[

               { header: 'Fecha', field: 'createdAt', render: r => r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() + ' ' + new Date(r.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-' },

               { header: 'Alumno', field: 'childName' },

               { header: 'Categoría', field: 'category' },

               { header: 'Contacto', field: 'phone' },

               { header: 'Estado', field: 'status', render: r => (

                  <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs p-1 rounded border dark:bg-zinc-800">

                    <option>Pendiente</option><option>Contactado</option><option>Matriculado</option>

                  </select>

               )}

             ]}

           />

        </div>

      );

    };



    // --- Sidebar Menu ---

    const menuItems = [

      { text: 'Dashboard', icon: LayoutDashboard, id: 'overview' },

      {

        text: 'Gestión Alumnos', icon: Users,

        subItems: [

          { text: 'Directorio', id: 'students-list' },

          { text: 'Categorías', id: 'students-cats' },

          { text: 'Pagos y Mensualidades', id: 'students-pay' },

        ]

      },

      {

        text: 'Configuración Web', icon: Settings,

        subItems: [

          { text: 'Contenidos (Noticias/Logros)', id: 'config-web' },

          { text: 'Solicitudes Web', id: 'requests' }

        ]

      }

    ];



    return (

      <div className="flex h-screen bg-zinc-100 dark:bg-black transition-colors duration-300 overflow-hidden">

        {/* Sidebar */}

        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          <div className="p-6 flex items-center border-b border-zinc-200 dark:border-zinc-800">

             <div className="bg-red-600 rounded-full p-1 mr-2"><Dribbble className="h-6 w-6 text-white" /></div>

             <span className="font-black text-lg text-zinc-800 dark:text-white tracking-widest">ADMIN</span>

          </div>

          <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">

             {menuItems.map((item, idx) => (

               <div key={idx}>

                 {item.subItems ? (

                   <div className="mb-2">

                     <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><item.icon className="h-4 w-4"/> {item.text}</div>

                     {item.subItems.map(sub => (

                       <button key={sub.id} onClick={() => { setAdminTab(sub.id); setSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${adminTab === sub.id ? 'bg-red-50 text-red-600 font-bold dark:bg-red-900/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>

                         {sub.text}

                       </button>

                     ))}

                   </div>

                 ) : (

                   <button onClick={() => { setAdminTab(item.id); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${adminTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>

                     <item.icon className="h-5 w-5" /> {item.text}

                   </button>

                 )}

               </div>

             ))}

             <button onClick={() => setView('landing')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-600 mt-8">

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

             {adminTab === 'students-list' && <StudentsView />}

             {adminTab === 'students-cats' && <CategoriesView />}

             {adminTab === 'students-pay' && <PaymentsView />}

             {adminTab === 'config-web' && <WebConfigView />}

             {adminTab === 'requests' && <RequestsView />}

          </main>

        </div>

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      </div>

    );

  };



  const Notification = () => (

    <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-xl text-white font-bold transition-all transform duration-300 flex items-center ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>

      {notification.type === 'error' ? <AlertCircle className="mr-2 h-5 w-5"/> : <CheckCircle className="mr-2 h-5 w-5"/>}

      {notification.message}

    </div>

  );



  const Hero = () => (

    <div className="relative bg-zinc-900 h-[600px] flex items-center overflow-hidden">

      <div className="absolute inset-0 opacity-40">

        <img src="https://i.postimg.cc/J4R4Hyc0/imagen-milan-fondo-principal.png" className="w-full h-full object-cover"/>

      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        <div className="max-w-2xl animate-fade-in-up">

          <span className="inline-block py-1 px-3 rounded-full bg-red-600 text-white text-sm font-bold tracking-wider mb-4 uppercase">Liga Amateur 1.ª División SJM</span>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">FORMANDO <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">FUTUROS CAMPEONES</span></h1>

          <div className="flex flex-col sm:flex-row gap-4">

            <button onClick={() => document.getElementById('matricula').scrollIntoView({behavior: 'smooth'})} className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.5)] flex justify-center items-center">Inscríbete Ahora <ArrowRight className="ml-2" /></button>

          </div>

        </div>

      </div>

    </div>

  );



  return (

    <div className={`font-sans min-h-screen ${isDarkMode ? 'dark' : ''}`}>

      {notification && <Notification />}

     

      {view === 'landing' && (

        <div className="bg-zinc-50 dark:bg-black transition-colors duration-300 min-h-screen">

          <Navbar />

          <Hero />

          <AboutCarousel />

          <Achievements />

          <Schedule />

          <News />

          <RegistrationSection />

          <Footer />

        </div>

      )}



      {view === 'admin-login' && <Login />}

      {view === 'admin-dashboard' && <AdminDashboard />}

    </div>

  );

}