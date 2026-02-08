import React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Shield
} from 'lucide-react';
import { LOGO_URL, FIELD_LOCATION } from '../utils/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 group cursor-default">
              <div className="bg-white rounded-full p-1 border-2 border-red-600 shadow-lg shadow-red-900/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <img src={LOGO_URL} alt="Escuela Milan Logo" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <span className="block text-sm font-bold tracking-widest text-zinc-400 uppercase">Escuela Deportiva</span>
                <span className="block text-2xl font-black text-white tracking-tighter leading-none">MILAN</span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Formando futuros campeones con valores, disciplina y pasión por el fútbol. Más que un equipo, somos una familia.
            </p>

            <div className="flex space-x-3 pt-2">
              <SocialLink icon={<Facebook size={18} />} href="https://facebook.com" label="Facebook" />
              <SocialLink icon={<Instagram size={18} />} href="https://instagram.com" label="Instagram" />
              <SocialLink icon={<Twitter size={18} />} href="https://twitter.com" label="Twitter" />
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-red-600 rounded-full"></span>
              Explorar
            </h3>
            <ul className="space-y-3">
              <FooterLink href="#" label="Inicio" />
              <FooterLink href="#historia" label="Sobre Nosotros" />
              <FooterLink href="#logros" label="Nuestros Logros" />
              <FooterLink href="#horarios" label="Horarios de Entrenamiento" />
              <FooterLink href="#matricula" label="Matrícula 2026" highlight />
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-red-600 rounded-full"></span>
              Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <div className="bg-zinc-900 p-2 rounded-lg mr-3 group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors">
                  <MapPin size={18} className="shrink-0" />
                </div>
                <span className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {FIELD_LOCATION.address},<br />{FIELD_LOCATION.district}
                </span>
              </li>
              <li className="flex items-center group">
                <div className="bg-zinc-900 p-2 rounded-lg mr-3 group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors">
                  <Phone size={18} className="shrink-0" />
                </div>
                <span className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">+51 {Phone_number}</span>
              </li>
              <li className="flex items-center group">
                <div className="bg-zinc-900 p-2 rounded-lg mr-3 group-hover:bg-red-600/10 group-hover:text-red-500 transition-colors">
                  <Mail size={18} className="shrink-0" />
                </div>
                <span className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">info@escuelamilan.com</span>
              </li>
            </ul>
          </div>

          {/* Legal/Links Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-red-600 rounded-full"></span>
              Enlaces
            </h3>
            <ul className="space-y-3">
              <FooterLink href="#" label="Términos y Condiciones" />
              <FooterLink href="#" label="Política de Privacidad" />
              <FooterLink href="#" label="Reglamento Interno" />
              <li className="pt-4 mt-4 border-t border-zinc-900">
                <a
                  href="/admin"
                  className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-wide group"
                >
                  <Shield size={14} className="mr-2 group-hover:rotate-12 transition-transform" />
                  Acceso Administrativo
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-center text-center items-center gap-4">
          <p className="text-zinc-600 text-sm font-medium">
            © {currentYear} Escuela Deportiva Milan. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Phone number imported locally to avoid undef error if not in constants yet, 
// using hardcoded per user instruction previously seen or constant if available.
// Actually let's check constants.js again for phone number.
// In constants.js: export const WHATSAPP_NUMBER = '989281819';
// I should use that or hardcode "989 281 819" formatted.

const Phone_number = "989 281 819";

// Subcomponents for cleaner code
const SocialLink = ({ icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="bg-zinc-900 hover:bg-red-600 text-zinc-400 hover:text-white p-2.5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/20"
  >
    {icon}
  </a>
);

const FooterLink = ({ href, label, highlight }) => (
  <li>
    <a
      href={href}
      className={`text-sm flex items-center group transition-colors duration-200 ${highlight
          ? 'text-red-500 font-bold hover:text-red-400'
          : 'text-zinc-400 hover:text-white'
        }`}
    >
      <ArrowRight
        size={14}
        className={`mr-2 transition-all duration-300 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 ${highlight ? 'text-red-500' : 'text-red-600'
          }`}
      />
      {label}
    </a>
  </li>
);