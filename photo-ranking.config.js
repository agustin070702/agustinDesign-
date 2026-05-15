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
    { id: 'p01', file: 'plaza-espana-final.webp', alt: 'Plaza España, los dos juntos' },
    { id: 'p02', file: 'vaticano-final.webp',     alt: 'Vaticano, los dos juntos afuera' },
    { id: 'p03', file: 'capri-juntos.webp',       alt: 'Capri, los dos juntos' },
    { id: 'p04', file: 'coliseo-juntos.webp',     alt: 'Coliseo, los dos juntos' },
    { id: 'p05', file: 'positano-agus.webp',      alt: 'Positano, retrato' }
  ],

  /* --- 5. Carpeta de assets (no tocar salvo que la renombres) */
  photosFolder: 'fotos-tier/'
};
