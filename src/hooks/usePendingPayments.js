import { useMemo } from 'react';
import { useCollection } from './useCollection';

export function usePendingPayments() {
    const { data: students, loading: loadingStudents } = useCollection('students');
    const { data: payments, loading: loadingPayments } = useCollection('payments');

    const pendingPayments = useMemo(() => {
        if (loadingStudents || loadingPayments) return [];

        const studentsWithIssues = [];
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Filtrar solo alumnos activos
        const activeStudents = students.filter(s => s.status === 'Activo');

        activeStudents.forEach(student => {
            // Buscar todos los pagos del alumno
            const studentPayments = payments.filter(p => p.studentName === student.name);

            if (studentPayments.length === 0) {
                // CASO 1: Sin ningún pago registrado
                studentsWithIssues.push({
                    id: student.id,
                    studentName: student.name,
                    category: student.category,
                    parent: student.parent,
                    phone: student.phone,
                    status: 'Pendiente',
                    registeredDate: student.createdAt,
                    reason: 'Sin pagos'
                });
            } else {
                // CASO 2: Buscar el último pago (por fecha de pago, no por fecha de registro)
                const latestPayment = studentPayments.reduce((latest, current) => {
                    const latestDate = latest.paymentDate?.seconds || latest.createdAt?.seconds || 0;
                    const currentDate = current.paymentDate?.seconds || current.createdAt?.seconds || 0;
                    return currentDate > latestDate ? current : latest;
                });

                // Verificar si pasaron más de 30 días desde el último pago
                // Usar paymentDate primero, si no existe usar createdAt
                const paymentDateSeconds = latestPayment.paymentDate?.seconds || latestPayment.createdAt?.seconds;

                if (paymentDateSeconds) {
                    const paymentDate = new Date(paymentDateSeconds * 1000);

                    if (paymentDate < thirtyDaysAgo) {
                        // El último pago fue hace más de 30 días
                        studentsWithIssues.push({
                            id: `${student.id}-overdue`,
                            studentName: student.name,
                            category: student.category,
                            parent: student.parent,
                            phone: student.phone,
                            status: 'Vencido',
                            lastPaymentDate: paymentDate,
                            lastPaymentMonth: latestPayment.month,
                            lastPaymentYear: latestPayment.year,
                            daysSincePayment: Math.floor((currentDate - paymentDate) / (1000 * 60 * 60 * 24)),
                            reason: 'Último pago vencido'
                        });
                    }
                }
            }
        });

        return studentsWithIssues;
    }, [students, payments, loadingStudents, loadingPayments]);

    return {
        pendingPayments,
        totalProblems: pendingPayments.length,
        loading: loadingStudents || loadingPayments,
        students, // Exponemos raw data si se necesita
        payments    // Exponemos raw data si se necesita
    };
}
