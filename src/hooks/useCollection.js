import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, appId } from '../firebase';

export function useCollection(collectionName, orderByField = 'createdAt') {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', collectionName));

        // NOTA: Para colecciones pequeñas como Categorías, mantuvimos el listener en tiempo real
        // porque son pocos documentos y se actualizan poco.
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Ordenamiento en cliente (simple)
            items.sort((a, b) => {
                if (orderByField === 'createdAt') {
                    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                }
                return 0;
            });
            setData(items);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName]);

    return { data, loading };
}
