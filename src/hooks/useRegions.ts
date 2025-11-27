import { useEffect, useState } from "react";
import { fetchRegionsMap } from "../services/regions";

export function useRegions() {
  const [regions, setRegions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchRegionsMap()
      .then((data) => {
        if (!isMounted) return;
        setRegions(data);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("No pudimos cargar las regiones desde el servidor.");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { regions, loading, error };
}
