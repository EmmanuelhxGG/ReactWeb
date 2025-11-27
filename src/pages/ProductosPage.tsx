import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ProductCard } from "../components/products/ProductCard";

const SORT_OPTIONS = [
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre" }
];

export function ProductosPage() {
  const location = useLocation();
  const { storefrontProducts } = useAppContext();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("__all__");
  const [sort, setSort] = useState<string>("price-asc");

  useEffect(() => {
    if (!location.hash) return;
    const decoded = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (decoded) {
      setCategory(decoded);
    }
  }, [location.hash]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    storefrontProducts.forEach((p) => {
      if (p.categoria) unique.add(p.categoria);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "es"));
  }, [storefrontProducts]);

  const filtered = useMemo(() => {
    let list = storefrontProducts;
    if (category !== "__all__") {
      list = list.filter((p) => p.categoria.toLowerCase() === category.toLowerCase());
    }
    if (query.trim()) {
      const term = query.trim().toLowerCase();
      list = list.filter((p) =>
        [p.nombre, p.attr, p.categoria]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.precio - b.precio);
    if (sort === "price-desc") sorted.sort((a, b) => b.precio - a.precio);
    if (sort === "name-asc") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return sorted;
  }, [storefrontProducts, query, category, sort]);

  return (
    <main className="container relleno productos">
      <h1 className="section-title font-brand">Productos</h1>

      <section className="barra-herramientas-productos" aria-label="Filtros de productos">
        <div className="barra-herramientas__fila">
          <div className="busqueda">
            <label className="sr-only" htmlFor="q">
              Buscar productos
            </label>
            <input
              id="q"
              className="input"
              type="search"
              placeholder="Buscar producto (ej. vegana, chocolate)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="selectores">
            <label className="sr-only" htmlFor="cat">
              Filtrar por categoría
            </label>
            <select
              id="cat"
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="__all__">Todas las categorías</option>
              {categories.map((catValue) => (
                <option key={catValue} value={catValue}>
                  {catValue}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="sort">
              Ordenar productos
            </label>
            <select
              id="sort"
              className="input"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="chips" id="chips">
          {categories.map((catValue) => (
            <button
              key={catValue}
              type="button"
              className={`chip${category === catValue ? " chip--active" : ""}`}
              onClick={() => setCategory(catValue)}
            >
              {catValue}
            </button>
          ))}
          {categories.length === 0 && <p className="muted">Sin categorías cargadas.</p>}
        </div>
      </section>

      <section className="rejilla-productos" id="grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {!filtered.length && (
          <div className="card productos__empty">
            <p className="muted">No encontramos productos con los filtros aplicados.</p>
          </div>
        )}
      </section>
    </main>
  );
}
