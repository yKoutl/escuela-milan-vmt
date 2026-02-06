import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase';

export function usePendingRequests() {
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'registrations'),
            where('status', '==', 'Pendiente')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPendingCount(snapshot.size);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching pending requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { pendingCount, loading };
}
