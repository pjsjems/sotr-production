// sanity/schemas/freeText.js
// "Texte du mois" — Free Text model
// Trilingual (FR / EN / ES), manual entry only
// Register in sanity.config.js / schemas/index.js

export default {
  name: 'freeText',
  title: 'Texte du mois',
  type: 'document',
  icon: () => '📝',
  groups: [
    { name: 'meta', title: '📋 Meta & Settings', default: true },
    { name: 'fr',   title: '🇫🇷 Français' },
    { name: 'en',   title: '🇺🇸 English' },
    { name: 'es',   title: '🇪🇸 Español' },
    { name: 'seo',  title: '🔍 SEO' },
  ],
  fields: [
    // META
    { name:'slug', title:'Slug (URL)', type:'slug', group:'meta',
      options:{ source:'title_fr', maxLength:96 }, validation: R => R.required() },
    { name:'author', title:'Author', type:'string', group:'meta', validation: R => R.required() },
    { name:'coverImage', title:'Cover Image (optional)', type:'image', group:'meta', options:{ hotspot:true } },
    { name:'is_featured', title:'Featured (Texte du mois — homepage)', type:'boolean', group:'meta',
      description:'Only one text should be featured at a time.', initialValue:false },
    { name:'sectionLabel', title:'Section Label Override', type:'string', group:'meta',
      description:'Overrides the global section name. Leave blank to use site default.' },
    { name:'createdAt', title:'Publication Date', type:'datetime', group:'meta',
      initialValue: () => new Date().toISOString(), validation: R => R.required() },
    // FR
    { name:'title_fr',    title:'Titre (FR)',       type:'string', group:'fr', validation: R => R.required() },
    { name:'subtitle_fr', title:'Sous-titre (FR)',  type:'string', group:'fr' },
    { name:'synopsis_fr', title:'Synopsis (FR)',    type:'text',   group:'fr', rows:3, validation: R => R.required().max(400) },
    { name:'preview_fr',  title:'Extrait visible (FR)', type:'array', group:'fr', of:[{type:'block'}], validation: R => R.required() },
    { name:'full_fr',     title:'Texte complet (FR)',   type:'array', group:'fr', of:[{type:'block'}], validation: R => R.required() },
    // EN
    { name:'title_en',    title:'Title (EN)',       type:'string', group:'en', validation: R => R.required() },
    { name:'subtitle_en', title:'Subtitle (EN)',    type:'string', group:'en' },
    { name:'synopsis_en', title:'Synopsis (EN)',    type:'text',   group:'en', rows:3, validation: R => R.required().max(400) },
    { name:'preview_en',  title:'Visible excerpt (EN)', type:'array', group:'en', of:[{type:'block'}], validation: R => R.required() },
    { name:'full_en',     title:'Full text (EN)',        type:'array', group:'en', of:[{type:'block'}], validation: R => R.required() },
    // ES
    { name:'title_es',    title:'Título (ES)',      type:'string', group:'es', validation: R => R.required() },
    { name:'subtitle_es', title:'Subtítulo (ES)',   type:'string', group:'es' },
    { name:'synopsis_es', title:'Sinopsis (ES)',    type:'text',   group:'es', rows:3, validation: R => R.required().max(400) },
    { name:'preview_es',  title:'Extracto visible (ES)', type:'array', group:'es', of:[{type:'block'}], validation: R => R.required() },
    { name:'full_es',     title:'Texto completo (ES)',    type:'array', group:'es', of:[{type:'block'}], validation: R => R.required() },
    // SEO
    { name:'seo_title_fr', title:'Meta Title (FR)', type:'string', group:'seo', validation: R => R.max(60) },
    { name:'seo_desc_fr',  title:'Meta Description (FR)', type:'text', group:'seo', rows:2, validation: R => R.max(155) },
    { name:'seo_title_en', title:'Meta Title (EN)', type:'string', group:'seo', validation: R => R.max(60) },
    { name:'seo_desc_en',  title:'Meta Description (EN)', type:'text', group:'seo', rows:2, validation: R => R.max(155) },
    { name:'seo_title_es', title:'Meta Title (ES)', type:'string', group:'seo', validation: R => R.max(60) },
    { name:'seo_desc_es',  title:'Meta Description (ES)', type:'text', group:'seo', rows:2, validation: R => R.max(155) },
  ],
  preview: {
    select: { title:'title_fr', subtitle:'author', media:'coverImage', featured:'is_featured' },
    prepare: ({ title, subtitle, media, featured }) => ({
      title: `${featured ? '⭐ ' : ''}${title || 'Untitled'}`,
      subtitle: subtitle || '', media,
    }),
  },
  orderings: [
    { title:'Publication date (newest)', name:'createdAtDesc', by:[{ field:'createdAt', direction:'desc' }] },
    { title:'Featured first', name:'featuredFirst',
      by:[{ field:'is_featured', direction:'desc' }, { field:'createdAt', direction:'desc' }] },
  ],
};
