// Logo URL
export const LOGO_URL = 'https://i.postimg.cc/43L0J04m/logo-milan.png';

// Data Fallbacks
export const DEFAULT_NEWS = [
  { id: '1', tag: "Torneo", title: "Inicio del Torneo Apertura SJM", desc: "Nuestras categorías Sub-12 y Sub-14 debutan este fin de semana.", visible: true },
  { id: '2', tag: "Convocatoria", title: "Pruebas masivas 2026", desc: "Buscamos nuevos talentos nacidos entre 2010 y 2018.", visible: true },
];

export const DEFAULT_ACHIEVEMENTS = [
  { 
    id: '1', 
    title: "Campeones internacionales", 
    year: "2025", 
    desc: "Escuela Milan se consagró campeon del Torneo Internacional Salinas - Ecuador 2025 Categoría 2018 - 2016.", 
    img: "https://i.postimg.cc/xdh5G1d7/campeon-ecuador.png", 
    visible: true 
  },

  { 
    id: '2', 
    title: "Campeones Liga SJM", 
    year: "2019", 
    desc: "La Escuela Milan se coronó campeona de la Liga de San Juan de Miraflores en 2019.", 
    img: "https://i.postimg.cc/VLXHgnQj/Campeon-2019.jpg", 
    visible: true 
  },
  { 
    id: '3', 
    title: "Campeones Liga SJM", 
    year: "2017", 
    desc: "La Escuela Milan logró el campeonato de la Liga de San Juan de Miraflores en 2017.", 
    img: "https://i.postimg.cc/RCkDwG84/Campeon-2017.jpg", 
    visible: true 
  }
];
export const DEFAULT_SCHEDULE = [
  { id: '1', cat: "Categoría 2023-2022-2021", time: "17:00 - 18:15", days: "Lun a Vie", visible: true },
  { id: '2', cat: "Categoría 2020-2019", time: "17:00 - 18:15", days: "Lun a Vie", visible: true },
  { id: '3', cat: "Categoría 2018-2017", time: "17:45 - 19:00", days: "Lun a Vie", visible: true },
  { id: '4', cat: "Categoría 2016-2015", time: "17:45 - 19:00", days: "Lun a Vie", visible: true },
  { id: '5', cat: "Categoría 2014-2013", time: "18:45 - 20:00", days: "Lun a Vie", visible: true },
  { id: '6', cat: "Categoría 2012-2011", time: "18:45 - 20:00", days: "Lun a Vie", visible: true },
  { id: '7', cat: "Categoría 2010-2009", time: "19:45 - 21:00", days: "Lun a Vie", visible: true },
  { id: '8', cat: "Categoría 2008 y Mayores", time: "19:45 - 21:00", days: "Lun a Vie", visible: true },
];


export const FIELD_LOCATION = {
  name: "Campo Deportivo Asoc. Virgen de Lourdes",
  address: "Paradero 11, Nueva Esperanza",
  district: "Virgen de Lourdes"
};

export const CAROUSEL_IMAGES = [
  "https://i.postimg.cc/nzHTpgN0/sobre-nosotros-1.png",

      "https://i.postimg.cc/WzqZv7p9/sobre-nosotros-3.png",

      "https://i.postimg.cc/pdkzYT1q/sobre-nosotros-2.png"];

export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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

export const DEFAULT_SPONSORS = [
  {
    id: '1',
    name: 'Sponsor Principal',
    logo: 'https://i.postimg.cc/SRXT91CV/auspiciadores.jpg',
    tier: 'gold',
    description: '',
    visible: true
  },
  {
    id: '2',
    name: 'Sponsor Oficial',
    logo: 'https://i.postimg.cc/SRXT91CV/auspiciadores.jpg',
    tier: 'silver',
    description: '',
    visible: true
  },
  {
    id: '3',
    name: 'Aliado Estratégico',
    logo: 'https://i.postimg.cc/SRXT91CV/auspiciadores.jpg',
    tier: 'bronze',
    description: '',
    visible: true
  }
];

export const DONATION_METHODS = [
  {
    id: 'yape',
    name: 'Yape',
    logo: 'https://i.postimg.cc/XqYfBsB5/yape.png',
    color: 'from-purple-600 to-purple-700',
    phone: '987654321',
    qrImage: 'https://i.postimg.cc/MpqQnPkM/QRYAPE.png'
  },
  {
    id: 'plin',
    name: 'Plin',
    logo: 'https://i.postimg.cc/4y2z6ppB/plin.png',
    color: 'from-blue-600 to-blue-700',
    phone: '987654321',
    qrImage: 'https://i.postimg.cc/MpqQnPkx/QRPLIN.png'
  }
];

export const WHATSAPP_NUMBER = '989281819';
export const WHATSAPP_MESSAGE = 'Hola, quiero más información sobre la Escuela de Fútbol Milan';
