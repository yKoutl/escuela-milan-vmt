// Local Asset Imports
import heroMilan from '../assets/hero milan.png';
import campeonEcuador from '../assets/campeon ecuador.png';
import campeon2019 from '../assets/Campeon-2019.jpg';
import campeon2017 from '../assets/Campeon-2017.jpg';
import sobreNosotros1 from '../assets/sobre nosotros 1.png';
import sobreNosotros2 from '../assets/sobre nosotros 2.png';
import sobreNosotros3 from '../assets/sobre nosotros 3.png';

// Logo URL
export const LOGO_URL = 'https://i.postimg.cc/43L0J04m/logo-milan.png';

// Data Fallbacks
export const DEFAULT_NEWS = [
  {
    id: '1',
    tag: "Torneo",
    title: "Inicio del Torneo Apertura SJM",
    desc: "Nuestras categorías Sub-12 y Sub-14 debutan este fin de semana.",
    visible: true,
    img: heroMilan
  },
  {
    id: '2',
    tag: "Convocatoria",
    title: "Pruebas masivas 2026",
    desc: "Buscamos nuevos talentos nacidos entre 2010 y 2018.",
    visible: true,
    img: heroMilan
  }
];


export const DEFAULT_ACHIEVEMENTS = [
  {
    id: '1',
    title: "Campeones internacionales",
    year: "2025",
    desc: "Escuela Milan se consagró campeon del Torneo Internacional Salinas - Ecuador 2025 Categoría 2018 - 2016.",
    img: campeonEcuador,
    visible: true
  },

  {
    id: '2',
    title: "Campeones Liga SJM",
    year: "2019",
    desc: "La Escuela Milan se coronó campeona de la Liga de San Juan de Miraflores en 2019.",
    img: campeon2019,
    visible: true
  },
  {
    id: '3',
    title: "Campeones Liga SJM",
    year: "2017",
    desc: "La Escuela Milan logró el campeonato de la Liga de San Juan de Miraflores en 2017.",
    img: campeon2017,
    visible: true
  }
];
export const DEFAULT_SCHEDULE = [
  { id: '1', cat: "Categoría 2023-2022-2021", time: "17:00 - 18:15", days: "Lunes a Viernes", visible: true },
  { id: '2', cat: "Categoría 2020-2019", time: "17:00 - 18:15", days: "Lunes a Viernes", visible: true },
  { id: '3', cat: "Categoría 2018-2017", time: "17:45 - 19:00", days: "Lunes a Viernes", visible: true },
  { id: '4', cat: "Categoría 2016-2015", time: "17:45 - 19:00", days: "Lunes a Viernes", visible: true },
  { id: '5', cat: "Categoría 2014-2013", time: "18:45 - 20:00", days: "Lunes a Viernes", visible: true },
  { id: '6', cat: "Categoría 2012-2011", time: "18:45 - 20:00", days: "Lunes a Viernes", visible: true },
  { id: '7', cat: "Categoría 2010-2009", time: "19:45 - 21:00", days: "Lunes a Viernes", visible: true },
  { id: '8', cat: "Categoría 2008 y Mayores", time: "19:45 - 21:00", days: "Lunes a Viernes", visible: true },
];


export const FIELD_LOCATION = {
  name: "La Once Campo Deportivo Asoc. Virgen de Lourdes",
  address: "Paradero 11, Nueva Esperanza",
  district: "Virgen de Lourdes"
};

export const CAROUSEL_IMAGES = [
  sobreNosotros1,
  sobreNosotros3,
  sobreNosotros2
];

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const PACKAGES = [
  { months: '1 MES', price: '149.90', discount: false },
  { months: '2 MESES', price: '249.90', discount: true },
  { months: '3 MESES', price: '349.90', discount: true, featured: true }
];

export const MEMBERSHIP_OPTIONS = [
  {
    id: '1',
    title: 'Socio Básico',
    price: '20',
    period: 'Mensual',
    color: 'blue',
    benefits: [
      'Descuento 10% en mensualidades',
      'Acceso a eventos especiales',
      'Carnet de socio digital'
    ]
  },
  {
    id: '2',
    title: 'Socio Premium',
    price: '50',
    period: 'Mensual',
    color: 'red',
    featured: true,
    benefits: [
      'Descuento 20% en mensualidades',
      'Prioridad en inscripciones',
      'Kit deportivo de regalo',
      'Acceso VIP a torneos'
    ]
  },
  {
    id: '3',
    title: 'Socio Corporativo',
    price: 'Contactar',
    period: '',
    color: 'green',
    benefits: [
      'Publicidad en uniformes',
      'Logo en instalaciones',
      'Menciones en redes sociales',
      'Espacios de marca en eventos'
    ]
  }
];
// ✅ AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Textos actualizados para los sponsors
import auspiciadoresImg from '../assets/auspiciadores.jpg';
import sponsorOficialImg from '../assets/sponsor oficial.png';
import yapeLogo from '../assets/logo yape.png';
import plinLogo from '../assets/logo plin.png';
import qrYape from '../assets/QRYAPE.png';
import qrPlin from '../assets/QRPLIN.png';

export const DEFAULT_SPONSORS = [
  {
    id: '1',
    name: 'Sponsor Principal',
    logo: auspiciadoresImg,
    tier: 'gold',
    description: `Máxima visibilidad y exclusividad

• Logo destacado en uniformes oficiales
• Espacios publicitarios en instalaciones
• Menciones en redes sociales (posts semanales)
• Stand exclusivo en eventos deportivos
• Entradas VIP para todos los partidos
• Acceso a base de datos de familias socias`,
    visible: true
  },
  {
    id: '2',
    name: 'Sponsor Oficial',
    logo: sponsorOficialImg,
    tier: 'silver',
    description: `Excelente presencia y alcance

• Logo en uniformes de entrenamiento
• Banners en instalaciones deportivas
• Menciones en redes sociales (mensuales)
• Stand en eventos principales
• Entradas preferenciales a partidos`,
    visible: true
  },
  {
    id: '3',
    name: 'Aliado Estratégico',
    logo: auspiciadoresImg,
    tier: 'bronze',
    description: `Visibilidad estratégica y valor

• Logo en página web oficial
• Mención en comunicados institucionales
• Banner en eventos especiales
• Descuentos en productos/servicios para socios`,
    visible: true
  }
];

export const DONATION_METHODS = [
  {
    id: 'yape',
    name: 'Yape',
    logo: yapeLogo,
    color: 'from-purple-600 to-purple-700',
    phone: '999999999',
    qrImage: qrYape
  },
  {
    id: 'plin',
    name: 'Plin',
    logo: plinLogo,
    color: 'from-blue-600 to-blue-700',
    phone: '999999999',
    qrImage: qrPlin
  }
];

export const WHATSAPP_NUMBER = '989281819';
export const WHATSAPP_MESSAGE = 'Hola, quiero más información sobre la Escuela de Fútbol Milan';
