import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { THEME_CLASSES } from '../utils/theme';

export default function CustomDatePicker({ value, onChange, placeholder = "Seleccionar fecha" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse initial date or default to today
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();

    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const [showYearSelector, setShowYearSelector] = useState(false);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowYearSelector(false); // Reset internal views
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Constants
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const daysShort = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

    // Year range (1990 - Current + 2)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1990 + 3 }, (_, i) => 1990 + i).reverse();

    // Helper: Get days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDayClick = (day) => {
        const selectedDate = new Date(viewYear, viewMonth, day);
        // Format YYYY-MM-DD manually to avoid timezone issues
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');

        onChange({ target: { value: `${year}-${month}-${d}` } });
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    // Render Calendar Grid
    const renderCalendar = () => {
        const totalDays = getDaysInMonth(viewYear, viewMonth);
        const startDay = getFirstDayOfMonth(viewYear, viewMonth);
        const days = [];

        // Empty spaces for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days
        for (let i = 1; i <= totalDays; i++) {
            const isSelected = value === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(viewYear, viewMonth, i).toDateString();

            days.push(
                <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); handleDayClick(i); }}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${isSelected ? 'bg-red-600 text-white shadow-md' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}
            ${isToday && !isSelected ? 'border border-red-500 font-bold text-red-600' : ''}
          `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Input Fake */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2 border rounded cursor-pointer flex items-center justify-between
          ${THEME_CLASSES.bg.input} ${THEME_CLASSES.text.primary} ${THEME_CLASSES.border.input}
          focus:ring-2 focus:ring-red-500 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50
        `}
            >
                <span className={!value ? 'text-zinc-500 dark:text-zinc-400' : ''}>
                    {value ? new Date(value + 'T00:00:00').toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : placeholder}
                </span>
                <Calendar className="h-4 w-4 text-zinc-400" />
            </div>

            {/* Popup */}
            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-72 animate-in fade-in zoom-in-95 duration-200">

                    {/* Header: Month & Year Picker */}
                    <div className="flex items-center justify-between mb-4">
                        {showYearSelector ? (
                            <button onClick={() => setShowYearSelector(false)} className="flex items-center text-sm font-bold text-red-600 hover:underline">
                                <ChevronLeft className="h-4 w-4 mr-1" /> Volver al Calendario
                            </button>
                        ) : (
                            <>
                                <button onClick={(e) => { e.preventDefault(); handlePrevMonth() }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronLeft className="h-4 w-4 dark:text-white" /></button>
                                <button
                                    onClick={(e) => { e.preventDefault(); setShowYearSelector(true) }}
                                    className="text-sm font-bold text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded flex items-center gap-1 transition"
                                >
                                    {months[viewMonth]} {viewYear} <ChevronDown className="h-3 w-3 opacity-50" />
                                </button>
                                <button onClick={(e) => { e.preventDefault(); handleNextMonth() }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronRight className="h-4 w-4 dark:text-white" /></button>
                            </>
                        )}
                    </div>

                    {/* Body: Year List OR Calendar Grid */}
                    {showYearSelector ? (
                        <div className="h-64 overflow-y-auto grid grid-cols-3 gap-2 pr-2 custom-scrollbar">
                            {years.map(year => (
                                <button
                                    key={year}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setViewYear(year);
                                        setShowYearSelector(false);
                                    }}
                                    className={`py-2 rounded text-sm font-medium transition-colors
                            ${year === viewYear ? 'bg-red-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}
                        `}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 mb-2">
                                {daysShort.map(d => (
                                    <div key={d} className="text-center text-xs font-bold text-zinc-400 uppercase">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>
                        </>
                    )}

                </div>
            )}
        </div>
    );
}
