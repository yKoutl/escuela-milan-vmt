import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where } from 'firebase/firestore';
import { db, appId } from '../firebase';

/**
 * Hook personalizado para paginación en Firestore
 * @param {string} collectionName - Nombre de la colección en 'artifacts/{appId}/public/data'
 * @param {number} pageSize - Tamaño de página (default 30)
 * @param {object} constraints - Restricciones adicionales (ej: where)
 */
export function usePaginatedQuery(collectionName, pageSize = 30) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    // Referencia a la colección base
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);

    const loadData = async (isNext = false) => {
        setLoading(true);
        setError(null);
        try {
            let q;

            if (isNext && lastDoc) {
                // Cargar sgte página
                q = query(colRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
            } else {
                // Cargar primera página (o refresh)
                q = query(colRef, orderBy('createdAt', 'desc'), limit(pageSize));
            }

            const snapshot = await getDocs(q);
            const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (isNext) {
                setData(prev => [...prev, ...newDocs]); // O reemplazar si prefieres paginación clásica
            } else {
                setData(newDocs);
            }

            // Actualizar cursor
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            setLastDoc(lastVisible);

            // Verificar si hay más
            setHasMore(snapshot.docs.length === pageSize);

        } catch (err) {
            console.error(`Error loading ${collectionName}:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial
    useEffect(() => {
        loadData();
    }, [collectionName]);

    return { data, loading, error, loadMore: () => loadData(true), refresh: () => loadData(false), hasMore };
}
