/* ============================================================
   PHOTO RANKING — CONFIGURACIÓN
   Edita SOLO este archivo para:
     1. Pegar tus credenciales de Supabase (paso 4 del setup)
     2. Cambiar nombres / colores de tiers
     3. Listar las fotos que dropeás en /fotos-tier/
   ============================================================ */

window.PR_CONFIG = {

  /* --- 1. Supabase ----------------------------------------- */
  // Pegá acá los valores de Project Settings → API en supabase.com
  supabaseUrl:     'https://lnfcyubjuyfligrkphcf.supabase.co',
  supabaseAnonKey: 'sb_publishable_wWAgSocPgRxv5wa2ZwCl6w_YL4ZvqIq',

  /* --- 2. Password de acceso ------------------------------- */
  // (Gate del frontend — no es seguridad real, solo bloquea curiosos)
  password: 'viajelito',

  /* --- 3. Tiers -------------------------------------------- */
  // El primero es el "mejor", el último el "peor". Editables al gusto.
  // Paleta verde (degradé oscuro → claro) + textColor por contraste.
  tiers: [
    { id: 'S', name: 'SOS',      color: '#0F2A1D', textColor: '#E3EED4' },
    { id: 'A', name: 'EDITAR',   color: '#375534', textColor: '#E3EED4' },
    { id: 'B', name: 'EN VOLA',  color: '#6B9071', textColor: '#E3EED4' },
    { id: 'F', name: 'NO BANCO', color: '#AEC3B0', textColor: '#0F2A1D' }
  ],

  /* --- 4. Fotos -------------------------------------------- */
  // 1) Soltá las fotos en la carpeta /fotos-tier/
  // 2) Agregá una línea por cada una acá. El "id" debe ser único y NO cambiar
  //    una vez clasificada (es la clave en la base de datos).
  // 3) "alt" es opcional (texto descriptivo).
  //
  // Ejemplo:
  //   { id: 'p01', file: 'IMG_0042.jpg' },
  //   { id: 'p02', file: 'atardecer.jpg', alt: 'atardecer en la playa' },
  photos: [
    { id: 'p01', file: 'agus-capri-mirador.webp',    alt: 'Agus en el mirador de Capri' },
    { id: 'p02', file: 'agus-capri-roca.webp',       alt: 'Agus solo en la roca, Capri' },
    { id: 'p03', file: 'agus-capri-roca-2.webp',     alt: 'Agus solo en la roca 2, Capri' },
    { id: 'p04', file: 'agus-capri-roca-3.webp',     alt: 'Agus solo en la roca 3, Capri' },
    { id: 'p05', file: 'agus-parque-recuerdo.webp',  alt: 'Agus en el Parque del Recuerdo' },
    { id: 'p06', file: 'capri-juntos.webp',           alt: 'Los dos juntos en Capri' },
    { id: 'p07', file: 'coliseo-agus.webp',           alt: 'Agus en el Coliseo' },
    { id: 'p08', file: 'jo-capri-roca.webp',          alt: 'Jo sola en la roca, Capri' },
    { id: 'p09', file: 'plaza-espana-juntos.webp',    alt: 'Los dos juntos en Plaza España' },
    { id: 'p10', file: 'positano-espaldas-1.webp',   alt: 'Positano juntos de espaldas 1' },
    { id: 'p11', file: 'positano-espaldas-2.webp',   alt: 'Positano juntos de espaldas 2' },
    { id: 'p12', file: 'positano-espaldas-3.webp',   alt: 'Positano juntos de espaldas 3' },
    { id: 'p13', file: 'vaticano-juntos-final.webp', alt: 'Los dos juntos afuera del Vaticano' },
    { id: 'p14', file: 'vaticano-juntos-2.webp',     alt: 'Los dos juntos afuera del Vaticano 2' }
  ],

  /* --- 5. Carpeta de assets (no tocar salvo que la renombres) */
  photosFolder: 'fotos-tier/'
};
