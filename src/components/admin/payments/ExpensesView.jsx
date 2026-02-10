
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, Calendar, DollarSign, Tag, FileText, Filter, Edit, X, Save } from 'lucide-react';
import { addDoc, collection, serverTimestamp, deleteDoc, doc, updateDoc, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, appId } from '../../../firebase';
import { THEME_CLASSES } from '../../../utils/theme';
import GenericTable from '../GenericTable';
import Modal from '../../../shared/Modal';
import { MONTHS } from '../../../utils/constants';

export default function ExpensesView({ showNotification }) {
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);

    // States for Adding
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Otros');

    // States for Editing (Modal)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    // Filters
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth()); // 0-11
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const categories = [
        'Pago Profesores',
        'Costo de Campo',
        'Mantenimiento',
        'Materiales',
        'Servicios',
        'Otros'
    ];

    // Fetch Expenses
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');

            // Construct date range for the selected month (Local aware)
            const start = new Date(filterYear, filterMonth, 1);
            const end = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59);

            const q = query(
                expensesRef,
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<=', Timestamp.fromDate(end)),
                orderBy('date', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            showNotification("Error al cargar egresos", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [filterMonth, filterYear]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!amount || !date) {
            showNotification("Por favor complete todos los campos", "error");
            return;
        }

        setLoading(true);
        try {
            // Robust local date parsing
            const [y, m, d] = date.split('-').map(Number);
            const expenseDateObj = new Date(y, m - 1, d, 12, 0, 0);

            const newExpense = {
                date: Timestamp.fromDate(expenseDateObj),
                amount: parseFloat(amount),
                description,
                category,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), newExpense);
            showNotification("Egreso registrado correctamente");

            // Reset
            setAmount('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategory('Otros');

            fetchExpenses();
        } catch (error) {
            console.error("Error saving expense:", error);
            showNotification("Error al registrar egreso", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (expense) => {
        let dateFormatted = new Date().toISOString().split('T')[0];
        if (expense.date?.seconds) {
            const date = new Date(expense.date.seconds * 1000);
            dateFormatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        setEditingExpense({
            ...expense,
            dateFormatted
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingExpense.amount || !editingExpense.dateFormatted) {
            showNotification("Complete los campos requeridos", "error");
            return;
        }

        setLoading(true);
        try {
            const [y, m, d] = editingExpense.dateFormatted.split('-').map(Number);
            const expenseDateObj = new Date(y, m - 1, d, 12, 0, 0);

            const updatedData = {
                date: Timestamp.fromDate(expenseDateObj),
                amount: parseFloat(editingExpense.amount),
                description: editingExpense.description || '',
                category: editingExpense.category,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', editingExpense.id), updatedData);
            showNotification("Egreso actualizado correctamente");
            setIsEditModalOpen(false);
            setEditingExpense(null);
            fetchExpenses();
        } catch (error) {
            showNotification("Error al actualizar", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este egreso?")) return;

        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
            showNotification("Egreso eliminado");
            fetchExpenses();
        } catch (error) {
            showNotification("Error al eliminar", "error");
        }
    };

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [expenses]);

    return (
        <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${THEME_CLASSES.text.primary} flex items-center gap-2`}>
                <DollarSign className="text-red-600" />
                Gestión de Egresos
            </h2>

            {/* Formulario de Registro Rápido */}
            <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border`}>
                <h3 className={`font-bold ${THEME_CLASSES.text.primary} mb-4 flex items-center gap-2`}>
                    <Plus className="h-5 w-5" /> Registrar Nuevo Egreso
                </h3>

                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                        <label className={`text-xs font-bold ${THEME_CLASSES.text.secondary} uppercase`}>Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs font-bold ${THEME_CLASSES.text.secondary} uppercase`}>Categoría</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1 lg:col-span-2">
                        <label className={`text-xs font-bold ${THEME_CLASSES.text.secondary} uppercase`}>Descripción (Opcional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Detalle del gasto..."
                            className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={`text-xs font-bold ${THEME_CLASSES.text.secondary} uppercase`}>Monto (S/.)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="md:col-span-2 lg:col-span-5 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        {loading ? 'Guardando...' : <><Plus className="h-5 w-5" /> Registrar Egreso</>}
                    </button>
                </form>
            </div>

            {/* Filtros y Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border md:col-span-2`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold ${THEME_CLASSES.text.primary} flex items-center gap-2`}>
                            <Filter className="h-4 w-4" /> Filtros
                        </h3>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(parseInt(e.target.value))}
                            className={`flex-1 p-2 rounded-lg border ${THEME_CLASSES.input}`}
                        >
                            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(parseInt(e.target.value))}
                            className={`flex-1 p-2 rounded-lg border ${THEME_CLASSES.input}`}
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className={`${THEME_CLASSES.bg.surface} p-6 rounded-xl shadow-sm ${THEME_CLASSES.border.primary} border bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50`}>
                    <h3 className={`font-bold ${THEME_CLASSES.text.secondary} uppercase text-xs tracking-wider mb-2 text-red-800 dark:text-red-200`}>
                        Total Egresos ({MONTHS[filterMonth]})
                    </h3>
                    <p className="text-4xl font-black text-red-600">
                        S/. {totalExpenses.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Listado */}
            {loading && expenses.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">Cargando egresos...</div>
            ) : (
                <GenericTable
                    title={`Egresos de ${MONTHS[filterMonth]} ${filterYear}`}
                    data={expenses}
                    columns={[
                        { header: 'Fecha', field: 'date', render: r => r.date?.seconds ? new Date(r.date.seconds * 1000).toLocaleDateString() : '-' },
                        { header: 'Categoría', field: 'category' },
                        { header: 'Descripción', field: 'description' },
                        { header: 'Monto', field: 'amount', render: r => <span className="font-bold text-red-600">- S/. {r.amount?.toFixed(2)}</span> },
                    ]}
                    onDelete={handleDelete}
                    customActions={(row) => (
                        <button
                            onClick={() => handleEditClick(row)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 p-2 rounded"
                            title="Editar"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    )}
                />
            )}

            {/* MODAL DE EDICIÓN */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Egreso">
                {editingExpense && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Fecha</label>
                                <input
                                    type="date"
                                    value={editingExpense.dateFormatted}
                                    onChange={e => setEditingExpense({ ...editingExpense, dateFormatted: e.target.value })}
                                    className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Categoría</label>
                                <select
                                    value={editingExpense.category}
                                    onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value })}
                                    className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Descripción</label>
                            <input
                                type="text"
                                value={editingExpense.description}
                                onChange={e => setEditingExpense({ ...editingExpense, description: e.target.value })}
                                className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Monto (S/.)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editingExpense.amount}
                                onChange={e => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                className={`w-full p-2.5 rounded-lg border ${THEME_CLASSES.input}`}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
                            >
                                {loading ? 'Guardando...' : <><Save className="h-4 w-4" /> Guardar Cambios</>}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
