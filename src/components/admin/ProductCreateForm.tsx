<<<<<<< HEAD
import { useState } from "react";
import type { FormEvent } from "react";
import { useAppContext } from "../../context/AppContext";
import type { Product } from "../../types";
import { BASE_CATEGORIES } from "../../data/products";
=======
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAppContext } from "../../context/AppContext";
import type { Product } from "../../types";
>>>>>>> master

const INITIAL_FORM = {
  id: "",
  nombre: "",
  categoria: "",
  attr: "",
  precio: "",
  stock: "",
  stockCritico: "",
  img: "",
  descripcion: ""
};

type ProductCreateFormProps = {
  onCreated?: (product: Product) => void;
  onClose?: () => void;
};

export function ProductCreateForm({ onCreated, onClose }: ProductCreateFormProps) {
  const { products, upsertProduct, showNotification } = useAppContext();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
<<<<<<< HEAD
=======
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.categoria).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    [products]
  );
>>>>>>> master

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

<<<<<<< HEAD
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
=======
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
>>>>>>> master
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.id.trim()) {
      nextErrors.id = "Código requerido";
    } else if (products.some((product) => product.id.toLowerCase() === form.id.trim().toLowerCase())) {
      nextErrors.id = "El código ya existe";
    }
    if (!form.nombre.trim()) {
      nextErrors.nombre = "Nombre requerido";
    }
    if (!form.categoria.trim()) {
      nextErrors.categoria = "Categoría requerida";
    }

    const precio = Number(form.precio);
    const MIN_PRICE = 1000; // precio mínimo razonable
    if (!Number.isFinite(precio) || precio < MIN_PRICE) {
      nextErrors.precio = `Precio inválido (mínimo ${MIN_PRICE})`;
    }

    const stock = Number(form.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      nextErrors.stock = "Stock inválido";
    }

    const stockCritico = Number(form.stockCritico);
    if (!Number.isFinite(stockCritico) || stockCritico < 0) {
      nextErrors.stockCritico = "Stock crítico inválido";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload: Product = {
      id: form.id.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      attr: form.attr.trim(),
      precio: Math.round(precio),
      stock: Math.round(stock),
      stockCritico: Math.round(stockCritico),
      img: form.img.trim().startsWith("/")
        ? form.img.trim()
        : form.img.trim() ? `/${form.img.trim()}` : "/img/placeholder.png",
      descripcion: form.descripcion.trim()
    };

<<<<<<< HEAD
    upsertProduct(payload);
=======
    setSubmitting(true);
    const result = await upsertProduct(payload, { isNew: true });
    setSubmitting(false);

    if (!result.ok) {
      showNotification({
        message: result.message ?? "No pudimos guardar el producto.",
        kind: "error"
      });
      return;
    }

>>>>>>> master
    showNotification({
      message: "Producto creado correctamente",
      kind: "success",
      mode: "dialog",
      actionLabel: "Aceptar"
    });
    onCreated?.(payload);
    resetForm();
    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="newId">Código</label>
          <input
            id="newId"
            type="text"
            value={form.id}
            onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
            maxLength={20}
            required
          />
          <small className="help">{errors.id}</small>
        </div>
        <div className="form-group">
          <label htmlFor="newNombre">Nombre</label>
          <input
            id="newNombre"
            type="text"
            value={form.nombre}
            onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
            maxLength={120}
            required
          />
          <small className="help">{errors.nombre}</small>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="newCategoria">Categoría</label>
<<<<<<< HEAD
          <select
            id="newCategoria"
            value={form.categoria}
            onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
            required
          >
            <option value="">Seleccione</option>
            {BASE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
=======
          <input
            id="newCategoria"
            type="text"
            value={form.categoria}
            onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
            list="productCategories"
            required
          />
          <datalist id="productCategories">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
>>>>>>> master
          <small className="help">{errors.categoria}</small>
        </div>
        <div className="form-group">
          <label htmlFor="newAttr">Atributo / etiqueta</label>
          <input
            id="newAttr"
            type="text"
            value={form.attr}
            onChange={(event) => setForm((prev) => ({ ...prev, attr: event.target.value }))}
            maxLength={120}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="newPrecio">Precio</label>
          <input
            id="newPrecio"
            type="number"
            value={form.precio}
            onChange={(event) => setForm((prev) => ({ ...prev, precio: event.target.value }))}
            min={1}
            required
          />
          <small className="help">{errors.precio}</small>
        </div>
        <div className="form-group">
          <label htmlFor="newStock">Stock</label>
          <input
            id="newStock"
            type="number"
            value={form.stock}
            onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
            min={0}
            required
          />
          <small className="help">{errors.stock}</small>
        </div>
        <div className="form-group">
          <label htmlFor="newStockCrit">Stock crítico</label>
          <input
            id="newStockCrit"
            type="number"
            value={form.stockCritico}
            onChange={(event) => setForm((prev) => ({ ...prev, stockCritico: event.target.value }))}
            min={0}
            required
          />
          <small className="help">{errors.stockCritico}</small>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="newImg">Imagen</label>
        <input
          id="newImg"
          type="text"
          placeholder="Ej: img/tortas/chocolate.jpg"
          value={form.img}
          onChange={(event) => setForm((prev) => ({ ...prev, img: event.target.value }))}
          maxLength={200}
        />
        <small className="help">Si no indicas una ruta, se usará un placeholder.</small>
      </div>

      <div className="form-group">
        <label htmlFor="newDesc">Descripción</label>
        <textarea
          id="newDesc"
          value={form.descripcion}
          onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
          maxLength={500}
          rows={4}
        />
      </div>

      <div className="form-actions">
<<<<<<< HEAD
        <button className="btn btn--principal" type="submit">
          Guardar producto
=======
        <button className="btn btn--principal" type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar producto"}
>>>>>>> master
        </button>
        <button
          className="btn"
          type="button"
          onClick={resetForm}
        >
          Limpiar formulario
        </button>
        {onClose && (
          <button
            className="btn"
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cerrar
          </button>
        )}
      </div>
    </form>
  );
}
