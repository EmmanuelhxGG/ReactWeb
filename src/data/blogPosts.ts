import type { BlogPost } from "../types";

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "caso-curioso-1",
    title: "Caso curioso #1: La torta gigante del récord",
    hero: {
      image: "/img/blog1.png",
      caption: "La torta gigante celebrada en la plaza principal."
    },
    excerpt:
      "Cómo se preparó la torta gigante que nos dio un récord y qué aprendimos para producir a gran escala en días festivos.",
    body: [
      {
        type: "p",
        content:
          "En 1995, Mil Sabores sorprendió al país con una de las tortas más grandes jamás preparadas. Fue un desafío histórico que puso a prueba nuestra logística, creatividad y, sobre todo, la pasión por endulzar grandes momentos."
      },
      {
        type: "p",
        content:
          "El proyecto nació como parte de las celebraciones de aniversario de la ciudad. La meta era reunir a miles de personas en torno a un único postre, uniendo tradición y comunidad. Para lograrlo, se necesitaron más de 200 kilos de harina, 150 litros de leche y cientos de horas de trabajo en equipo."
      },
      {
        type: "p",
        content:
          "El día del evento, la plaza principal se llenó de aromas dulces mientras hornos industriales funcionaban sin descanso. La coordinación con voluntarios, estudiantes de gastronomía y maestros pasteleros fue clave para que todo resultara a la perfección."
      },
      {
        type: "p",
        content:
          "Al final, la torta no solo batió un récord local, sino que también quedó en la memoria colectiva de quienes participaron. Este hito marcó un antes y un después en nuestra historia, consolidando a Mil Sabores como un referente en innovación pastelera."
      }
    ]
  },
  {
    id: "blog-2",
    slug: "caso-curioso-2",
    title: "Caso curioso #2: Galletas 100% veganas",
    hero: {
      image: "/img/blog2.png",
      caption: "Selección de galletas veganas de temporada."
    },
    excerpt:
      "Secretos de nuestra masa de galletas veganas: textura crujiente con ingredientes 100% de origen vegetal.",
    body: [
      {
        type: "p",
        content:
          "En Mil Sabores siempre hemos buscado innovar para atender a todos nuestros clientes. Una de nuestras mayores apuestas fue desarrollar una receta de galletas 100% veganas, sin ingredientes de origen animal, que mantuvieran la textura crujiente y el sabor dulce de las clásicas galletas caseras."
      },
      {
        type: "p",
        content:
          "El proceso no fue sencillo: probamos diferentes combinaciones de harinas, aceites vegetales y endulzantes naturales hasta encontrar la mezcla perfecta. Tras varias pruebas en nuestro taller, logramos un producto que no solo cumplió con nuestras expectativas, sino que encantó a quienes lo probaron en la primera degustación abierta al público."
      },
      {
        type: "p",
        content:
          "Estas galletas no solo son una alternativa deliciosa para clientes veganos, sino también para quienes buscan opciones más saludables y sostenibles. Usamos ingredientes de productores locales, lo que refuerza nuestro compromiso con la comunidad y el medio ambiente."
      },
      {
        type: "p",
        content:
          "Hoy forman parte de nuestro catálogo fijo y se han convertido en uno de los productos más pedidos en nuestra tienda online. ¡Una muestra de que con creatividad y dedicación se pueden lograr sabores sorprendentes sin renunciar a la calidad!"
      }
    ]
  }
];
