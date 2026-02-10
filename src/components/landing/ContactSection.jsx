import React from 'react';
import { Mail, Phone, Globe, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../utils/constants';

export default function ContactSection() {
    const contactItems = [
        {
            icon: <Mail className="w-6 h-6" />,
            label: "Correo Electrónico",
            value: "info@escuelamilan.com",
            href: "mailto:info@escuelamilan.com",
            color: "bg-red-600"
        },
        {
            icon: <Phone className="w-6 h-6" />,
            label: "Teléfono / WhatsApp",
            value: `+51 ${WHATSAPP_NUMBER}`,
            href: `https://wa.me/51${WHATSAPP_NUMBER}`,
            color: "bg-red-600"
        },
        {
            icon: <Globe className="w-6 h-6" />,
            label: "Sitio Web",
            value: "www.escuelamilan.com",
            href: "#",
            color: "bg-red-600"
        }
    ];

    return (
        <section id="contacto" className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4 transition-colors">
                        CONTÁCTANOS
                    </h2>
                    <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto font-medium transition-colors">
                        Estamos listos para responder todas tus dudas y recibirte en nuestra familia.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6 md:gap-8">
                    {contactItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center"
                        >
                            {/* Contenedor que se expande */}
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full h-16 transition-all duration-500 ease-out border-2 border-transparent group-hover:border-red-600 group-active:border-red-600 group-hover:pr-8 group-active:pr-8 group-hover:shadow-2xl group-hover:shadow-red-600/20 w-16 group-hover:w-[300px] sm:group-hover:w-[380px] md:group-hover:w-[450px] group-active:w-[300px] overflow-hidden">

                                {/* Icono (Siempre visible) */}
                                <div className={`shrink-0 w-16 h-16 flex items-center justify-center rounded-full text-white ${item.color} shadow-lg z-10 transition-transform duration-500 group-hover:rotate-[360deg] group-active:rotate-[360deg]`}>
                                    {item.icon}
                                </div>

                                {/* Texto (Se revela horizontalmente) */}
                                <div className="flex flex-col ml-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 delay-150 whitespace-nowrap">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 leading-none mb-1">
                                        {item.label}
                                    </span>
                                    <span className="text-base sm:text-lg md:text-xl font-black text-zinc-800 dark:text-white leading-none">
                                        {item.value}
                                    </span>
                                </div>

                                {/* Flecha de acción final */}
                                <div className="absolute right-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 delay-200">
                                    <ArrowRight className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

            </div>
        </section>
    );
}
