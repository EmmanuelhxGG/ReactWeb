import { Link } from "react-router-dom";

export function NosotrosPage() {
  return (
    <main className="container pad about" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
      <section className="about-hero">
        <img src="/img/logo.png" alt="Logo Pastelería Mil Sabores" className="about-hero__logo" />
        <div className="about-hero__text">
          <h1 className="section-title font-brand">Sobre nosotros</h1>
          <p>
            En <strong>Pastelería Mil Sabores</strong> llevamos más de 50 años endulzando momentos especiales.
            Somos tradición, innovación y cariño en cada receta.
          </p>
        </div>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <h3>🎂 Enunciado</h3>
          <p>
            Pastelería 1000 Sabores celebra su 50 aniversario como un referente en la repostería chilena. Famosa por su
            participación en un récord Guinness en 1995, busca renovar su sistema de ventas online para ofrecer una
            experiencia de compra moderna y accesible.
          </p>
        </article>

        <article className="about-card">
          <h3>🍩 Misión</h3>
          <p>
            Ofrecer una experiencia dulce y memorable, con tortas y productos de alta calidad para todas las ocasiones,
            celebrando nuestras raíces e impulsando la creatividad en repostería.
          </p>
        </article>

        <article className="about-card">
          <h3>🕯️ Visión</h3>
          <p>
            Ser la tienda online líder de repostería en Chile, reconocida por innovación, calidad e impacto positivo en la
            comunidad, especialmente en la formación de nuevos talentos en gastronomía.
          </p>
        </article>
      </section>

      <section className="about-values">
        <h2 className="about-subtitle">Nuestros valores</h2>
        <ul className="values">
          <li>
            <strong>Calidad</strong> — ingredientes seleccionados y técnicas artesanales.
          </li>
          <li>
            <strong>Innovación</strong> — nuevas recetas y líneas <em>sin azúcar</em>, <em>vegana</em> y <em>sin gluten</em>.
          </li>
          <li>
            <strong>Cercanía</strong> — servicio humano, pedidos personalizados y celebraciones únicas.
          </li>
          <li>
            <strong>Comunidad</strong> — colaboración con estudiantes y productores locales.
          </li>
        </ul>
      </section>

      <section className="about-timeline">
        <h2 className="about-subtitle">Hitos que nos inspiran</h2>
        <div className="timeline">
          <div className="tl-item">
            <span className="tl-dot" />
            <div className="tl-card">
              <h4>1974 · Nace Mil Sabores</h4>
              <p>Una pastelería familiar enfocada en recetas clásicas y sabor casero.</p>
            </div>
          </div>
          <div className="tl-item">
            <span className="tl-dot" />
            <div className="tl-card">
              <h4>1995 · Récord Guinness</h4>
              <p>Participamos en la torta más grande y aprendimos a producir a gran escala.</p>
            </div>
          </div>
          <div className="tl-item">
            <span className="tl-dot" />
            <div className="tl-card">
              <h4>2025 · Renovación digital</h4>
              <p>Impulsamos nuestra tienda online para llegar a todo Chile con la mejor experiencia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h3>¿Listo para celebrar con nosotros?</h3>
        <p>Explora nuestras tortas y encuentra el sabor perfecto para tu ocasión.</p>
        <Link to="/productos" className="btn btn--primary">
          Ver catálogo
        </Link>
      </section>
    </main>
  );
}
