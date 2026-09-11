// ==================== Store Builder ====================
window.SB = {
  storeId: null,
  token: null,
  pageType: 'home',
  customPageId: null,   // إذا غير null، معناها راهو يحرر صفحة مخصّصة (مش home/products/product)
  customPages: [],
  library: {},
  sortOptions: [],
  sections: [],       // current page sections (working draft)
  navLinks: [],
  selectedId: null,
  previewTimer: null,
  lang: 'en',
};

const SB_I18N = {
  en: {
    back: 'Back', home: 'Home', allProducts: 'All Products', productPage: 'Product Page', newPage: '+ New Page',
    deletePage: 'Delete Page', save: 'Save', saving: 'Saving...', loading: 'Loading...',
    header: 'Header', sections: 'Sections', footer: 'Footer',
    addAnnouncementBar: '+ Add Announcement Bar', addFooter: '+ Add Footer', addSection: '+ Add Section',
    navMenu: 'Navigation Menu', delete: 'Delete', chooseSection: 'Choose a section to add',
    noImage: 'No Image', uploadImage: 'Upload Image', addItem: '+ Add Item',
    navLinkText: 'Text', navLinkUrl: 'Link', addLink: '+ Add Link', saveMenu: 'Save Menu',
    navMenuSaved: 'Navigation menu saved', pageTitle: 'Page Title', pageTitlePh: 'e.g. About Us',
    pageSlug: 'Link (slug) — lowercase English letters, numbers and hyphens only', createPage: 'Create Page',
    newPageModalTitle: 'New Page', enterTitleAndSlug: 'Please enter the title and link',
    pageCreated: 'Page created — don\'t forget to add its link in "Navigation Menu" so customers can see it',
    confirmDeletePage: 'Are you sure you want to delete this page?', pageDeleted: 'Page deleted',
    noStoreSelected: 'No store selected. Go back to dashboard and select your store first.',
    errorLoadingStore: 'Error loading store data: ', failedUpload: 'Failed to upload image: ',
    savedSuccess: 'Saved successfully ✓', errorSaving: 'Error while saving: ', errorGeneric: 'Error: ',
    style: '🎨 Style', styleTitle: 'Colors & Fonts', colors: 'Colors', fonts: 'Fonts',
    primaryColor: 'Primary Color', primaryColorHint: 'Used for buttons & links',
    secondaryColor: 'Secondary Color', secondaryColorHint: 'Used for banners',
    pageBg: 'Page Background', pageBgHint: "Used for the website's background",
    sectionBg: 'Section Background', sectionBgHint: 'Used for cards, section backgrounds',
    headings: 'Headings', headingsHint: 'Used for titles and headings',
    subheadings: 'Subheadings', subheadingsHint: 'Used for sub-titles',
    bodyFont: 'Body Font', saveStyle: 'Save Style', styleSaved: 'Style saved ✓',
  },
  fr: {
    back: 'Retour', home: 'Accueil', allProducts: 'Tous les Produits', productPage: 'Page Produit', newPage: '+ Nouvelle Page',
    deletePage: 'Supprimer la Page', save: 'Enregistrer', saving: 'Enregistrement...', loading: 'Chargement...',
    header: 'En-tête', sections: 'Sections', footer: 'Pied de Page',
    addAnnouncementBar: '+ Ajouter Barre d\'Annonce', addFooter: '+ Ajouter Pied de Page', addSection: '+ Ajouter Section',
    navMenu: 'Menu de Navigation', delete: 'Supprimer', chooseSection: 'Choisissez une section à ajouter',
    noImage: 'Pas d\'image', uploadImage: 'Télécharger Image', addItem: '+ Ajouter un Élément',
    navLinkText: 'Texte', navLinkUrl: 'Lien', addLink: '+ Ajouter un Lien', saveMenu: 'Enregistrer le Menu',
    navMenuSaved: 'Menu de navigation enregistré', pageTitle: 'Titre de la Page', pageTitlePh: 'ex : À propos',
    pageSlug: 'Lien (slug) — lettres anglaises minuscules, chiffres et tirets uniquement', createPage: 'Créer la Page',
    newPageModalTitle: 'Nouvelle Page', enterTitleAndSlug: 'Veuillez entrer le titre et le lien',
    pageCreated: 'Page créée — n\'oubliez pas d\'ajouter son lien dans "Menu de Navigation" pour qu\'elle soit visible aux clients',
    confirmDeletePage: 'Voulez-vous vraiment supprimer cette page ?', pageDeleted: 'Page supprimée',
    noStoreSelected: 'Aucune boutique sélectionnée. Retournez au tableau de bord et sélectionnez votre boutique.',
    errorLoadingStore: 'Erreur de chargement des données : ', failedUpload: 'Échec du téléchargement : ',
    savedSuccess: 'Enregistré avec succès ✓', errorSaving: 'Erreur lors de l\'enregistrement : ', errorGeneric: 'Erreur : ',
    style: '🎨 Style', styleTitle: 'Couleurs & Polices', colors: 'Couleurs', fonts: 'Polices',
    primaryColor: 'Couleur Primaire', primaryColorHint: 'Utilisée pour les boutons & liens',
    secondaryColor: 'Couleur Secondaire', secondaryColorHint: 'Utilisée pour les bannières',
    pageBg: 'Fond de Page', pageBgHint: 'Utilisé pour le fond du site',
    sectionBg: 'Fond des Sections', sectionBgHint: 'Utilisé pour les cartes, fonds de sections',
    headings: 'Titres', headingsHint: 'Utilisé pour les titres',
    subheadings: 'Sous-titres', subheadingsHint: 'Utilisé pour les sous-titres',
    bodyFont: 'Police du Texte', saveStyle: 'Enregistrer le Style', styleSaved: 'Style enregistré ✓',
  },
  ar: {
    back: 'رجوع', home: 'الرئيسية', allProducts: 'كل المنتجات', productPage: 'صفحة المنتج', newPage: '+ صفحة جديدة',
    deletePage: 'حذف الصفحة', save: 'حفظ', saving: 'جارِ الحفظ...', loading: 'جارِ التحميل...',
    header: 'Header', sections: 'Sections', footer: 'Footer',
    addAnnouncementBar: '+ إضافة شريط إعلانات', addFooter: '+ إضافة الفوتر', addSection: '+ إضافة قسم',
    navMenu: 'قائمة التنقل (Navigation)', delete: 'حذف', chooseSection: 'اختر قسماً لإضافته',
    noImage: 'لا توجد صورة', uploadImage: 'رفع صورة', addItem: '+ إضافة عنصر',
    navLinkText: 'النص', navLinkUrl: 'الرابط', addLink: '+ إضافة رابط', saveMenu: 'حفظ القائمة',
    navMenuSaved: 'تم حفظ قائمة التنقل', pageTitle: 'عنوان الصفحة', pageTitlePh: 'مثال: من نحن',
    pageSlug: 'الرابط (slug) — حروف إنجليزية صغيرة وأرقام وشرطات فقط', createPage: 'إنشاء الصفحة',
    newPageModalTitle: 'صفحة جديدة', enterTitleAndSlug: 'الرجاء إدخال العنوان والرابط',
    pageCreated: 'تم إنشاء الصفحة — لا تنسَ تضيف رابطها فـ "قائمة التنقل" باش تبان للزبائن',
    confirmDeletePage: 'متأكد تحب تحذف هاذي الصفحة؟', pageDeleted: 'تم حذف الصفحة',
    noStoreSelected: 'لم يتم تحديد المتجر. ارجع للوحة التحكم واختر متجرك أولاً.',
    errorLoadingStore: 'خطأ في تحميل بيانات المتجر: ', failedUpload: 'فشل رفع الصورة: ',
    savedSuccess: 'تم الحفظ بنجاح ✓', errorSaving: 'خطأ أثناء الحفظ: ', errorGeneric: 'خطأ: ',
    style: '🎨 الستايل', styleTitle: 'الألوان والخطوط', colors: 'الألوان', fonts: 'الخطوط',
    primaryColor: 'اللون الأساسي', primaryColorHint: 'كيستعمل للأزرار والروابط',
    secondaryColor: 'اللون الثانوي', secondaryColorHint: 'كيستعمل للبانرات',
    pageBg: 'خلفية الصفحة', pageBgHint: 'كتستعمل لخلفية الموقع',
    sectionBg: 'خلفية الأقسام', sectionBgHint: 'كتستعمل للكروت وخلفيات الأقسام',
    headings: 'العناوين', headingsHint: 'كتستعمل للعناوين الرئيسية',
    subheadings: 'العناوين الفرعية', subheadingsHint: 'كتستعمل للعناوين الفرعية',
    bodyFont: 'خط النص', saveStyle: 'حفظ الستايل', styleSaved: 'تم حفظ الستايل ✓',
  },
};

function sbT(key) { return (SB_I18N[SB.lang] && SB_I18N[SB.lang][key]) || SB_I18N.en[key] || key; }

function sbSetLang(lang) {
  SB.lang = lang;
  localStorage.setItem('oxyde_builder_lang', lang);
  document.querySelectorAll('.sb-lang-btn').forEach(b => b.classList.toggle('sb-lang-active', b.dataset.lang === lang));
  document.getElementById('sbHtml').lang = lang;
  document.getElementById('sbHtml').dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.getElementById('sbBackLink').title = sbT('back');
  document.getElementById('sbTabHome').textContent = sbT('home');
  document.getElementById('sbTabProducts').textContent = sbT('allProducts');
  document.getElementById('sbTabProduct').textContent = sbT('productPage');
  document.getElementById('sbNewPageBtn').textContent = sbT('newPage');
  document.getElementById('sbStyleBtn').textContent = sbT('style');
  document.getElementById('sbDeletePageBtn').textContent = sbT('deletePage');
  document.getElementById('sbSaveBtn').textContent = sbT('save');
  const loadingEl = document.getElementById('sbLoadingText');
  if (loadingEl) loadingEl.textContent = sbT('loading');

  // نعاود نجيب مكتبة الأقسام باللغة الجديدة، ونعاود رسم الشريط الجانبي
  sbReloadLibraryAndRerender();
}

async function sbReloadLibraryAndRerender() {
  if (!SB.storeId || !SB.token) return;
  try {
    const libRes = await sbApi(`/builder/sections-library?lang=${SB.lang}`);
    SB.library = libRes.library;
    SB.sortOptions = libRes.sort_options;
    sbRenderSidebar();
  } catch (e) { /* best effort */ }
}

function sbAuthHeaders(json = true) {
  const h = {};
  if (SB.token) h['Authorization'] = `Bearer ${SB.token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function sbApi(path, opts = {}) {
  const res = await fetch(`/stores/${SB.storeId}${path}`, {
    method: opts.method || 'GET',
    headers: sbAuthHeaders(!opts.form),
    body: opts.body ? (opts.form ? opts.body : JSON.stringify(opts.body)) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.detail) ? JSON.stringify(data.detail) : `${sbT('errorGeneric')}(${res.status})`);
  return data;
}

async function sbInit() {
  const params = new URLSearchParams(window.location.search);
  SB.storeId = params.get('store_id');
  SB.token = localStorage.getItem('oxyde_token');
  SB.lang = localStorage.getItem('oxyde_builder_lang') || 'en';
  const savedDevice = localStorage.getItem('oxyde_builder_device') || 'mobile';
  sbSetPreviewDevice(savedDevice);

  if (!SB.token) { window.location.href = 'login.html'; return; }
  if (!SB.storeId) { document.body.innerHTML = `<div style="padding:40px;color:#fff;font-family:sans-serif;">${sbT('noStoreSelected')}</div>`; return; }

  document.querySelectorAll('.sb-lang-btn').forEach(b => b.classList.toggle('sb-lang-active', b.dataset.lang === SB.lang));
  document.getElementById('sbHtml').lang = SB.lang;
  document.getElementById('sbHtml').dir = SB.lang === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('sbBackLink').title = sbT('back');
  document.getElementById('sbTabHome').textContent = sbT('home');
  document.getElementById('sbTabProducts').textContent = sbT('allProducts');
  document.getElementById('sbTabProduct').textContent = sbT('productPage');
  document.getElementById('sbNewPageBtn').textContent = sbT('newPage');
  document.getElementById('sbStyleBtn').textContent = sbT('style');
  document.getElementById('sbSaveBtn').textContent = sbT('save');
  document.getElementById('sbLoadingText').textContent = sbT('loading');

  try {
    const libRes = await sbApi(`/builder/sections-library?lang=${SB.lang}`);
    SB.library = libRes.library;
    SB.sortOptions = libRes.sort_options;

    const nav = await sbApi('/builder/nav-menu');
    SB.navLinks = nav.links;

    SB.customPages = await sbApi('/builder/custom-pages');
    sbRenderCustomPageTabs();

    await sbLoadPage('home');
    sbRenderSidebar();
    sbSchedulePreview();
    sbFetchStoreLabel();
  } catch (e) {
    alert(sbT('errorLoadingStore') + e.message);
  }
}

async function sbFetchStoreLabel() {
  try {
    const res = await fetch('/auth/me', { headers: sbAuthHeaders() });
    // best effort only, not essential
  } catch (e) {}
}

async function sbLoadPage(pageType) {
  SB.pageType = pageType;
  SB.customPageId = null;
  const data = await sbApi(`/builder/pages/${pageType}`);
  SB.sections = data.sections;
  SB.selectedId = null;
  sbRenderCustomPageTabs();
  document.querySelectorAll('.sb-page-tab[data-page]').forEach(b => b.classList.toggle('sb-tab-active', b.dataset.page === pageType));
  sbRenderSidebar();
  sbSchedulePreview();
}

async function sbLoadCustomPage(pageId) {
  SB.customPageId = pageId;
  const data = await sbApi(`/builder/custom-pages/${pageId}`);
  SB.sections = data.sections;
  SB.selectedId = null;
  sbRenderCustomPageTabs();
  document.querySelectorAll('.sb-page-tab[data-page]').forEach(b => b.classList.remove('sb-tab-active'));
  sbRenderSidebar();
  sbSchedulePreview();
}

function sbRenderCustomPageTabs() {
  // نحذف أي تابات مخصصة قديمة كانت مزادة، ونعاود نبنيها
  document.querySelectorAll('.sb-custom-tab').forEach(el => el.remove());
  const tabsWrap = document.getElementById('sbPageTabs');
  SB.customPages.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'sb-page-tab sb-custom-tab' + (SB.customPageId === p.id ? ' sb-tab-active' : '');
    btn.textContent = p.title || p.slug;
    btn.onclick = () => sbLoadCustomPage(p.id);
    tabsWrap.appendChild(btn);
  });
  const delBtn = document.getElementById('sbDeletePageBtn');
  if (delBtn) delBtn.style.display = SB.customPageId ? 'inline-block' : 'none';
}

function sbFieldDefaultsFor(type) {
  const lib = SB.library[type];
  const props = {};
  (lib.fields || []).forEach(f => { props[f.key] = f.default; });
  return props;
}

function sbNewSection(type) {
  return { id: 'tmp_' + Math.random().toString(36).slice(2, 10), type, props: sbFieldDefaultsFor(type) };
}

// ---------- Sidebar ----------
function sbRenderSidebar() {
  const root = document.getElementById('sbSidebarContent');
  const headerItems = SB.sections.filter(s => s.type === 'announcement_bar');
  const footerItems = SB.sections.filter(s => s.type === 'footer');
  const middleItems = SB.sections.filter(s => s.type !== 'announcement_bar' && s.type !== 'footer');

  let html = '';

  // -------- Header group --------
  html += `<div class="sb-group-label">${sbT('header')}</div>`;
  if (headerItems.length) {
    headerItems.forEach(s => { html += sbSectionRow(s, false); });
  } else {
    html += sbAddSectionButton('announcement_bar', sbT('addAnnouncementBar'));
  }
  html += sbAccordionRow('sbNavMenuRow', sbIcon('compass'), sbT('navMenu'), 'sbOpenNavMenuEditor()');

  // -------- Sections group --------
  html += `<div class="sb-group-label" style="margin-top:18px;">${sbT('sections')}</div>`;
  html += `<div id="sbSectionsList">`;
  middleItems.forEach(s => { html += sbSectionRow(s, true); });
  html += `</div>`;
  html += `<button class="sb-add-btn" onclick="sbOpenAddSectionMenu()">${sbT('addSection')}</button>`;

  // -------- Footer group --------
  html += `<div class="sb-group-label" style="margin-top:18px;">${sbT('footer')}</div>`;
  if (footerItems.length) {
    footerItems.forEach(s => { html += sbSectionRow(s, false); });
  } else {
    html += sbAddSectionButton('footer', sbT('addFooter'));
  }

  root.innerHTML = html;
  sbEnableDragDrop();

  // re-render expanded field form if a section is selected
  if (SB.selectedId) {
    const container = document.getElementById(`sb-fields-${SB.selectedId}`);
    if (container) sbRenderFieldsForm(SB.selectedId, container);
  }
}

function sbAddSectionButton(type, label) {
  return `<button class="sb-add-btn" onclick="sbAddSectionOfType('${type}')">${label}</button>`;
}

// ==================== أيقونات SVG مباشرة (بلا اعتماد على مكتبة خارجية) ====================
const SB_ICONS = {
  x: '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>',
  compass: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 16.016a7.5 7.5 0 0 0 1.962-14.74A1 1 0 0 0 9 0H7a1 1 0 0 0-.962 1.276A7.5 7.5 0 0 0 8 16.016m6.5-7.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"/><path d="m6.94 7.44 4.95-2.83-2.83 4.95-4.949 2.83 2.828-4.95z"/></svg>',
  megaphone: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 75 75 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0m-1 1.35c-2.344 1.205-5.209 1.842-8 2.033v4.233q.27.015.537.036c2.568.189 5.093.744 7.463 1.993zm-9 6.215v-4.13a95 95 0 0 1-1.992.052A1.02 1.02 0 0 0 1 7v2c0 .55.448 1.002 1.006 1.009A61 61 0 0 1 4 10.065m-.657.975 1.609 3.037.01.024h.548l-.002-.014-.443-2.966a68 68 0 0 0-1.722-.082z"/></svg>',
  image: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/></svg>',
  bag: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></svg>',
  star: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>',
  layout: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.5 3a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zm0 3a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zm.5 3.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5m-.5 2.5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1z"/><path d="M16 2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM4 1v14H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm1 0h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5z"/></svg>',
  chat: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/><path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/></svg>',
  images: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/><path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"/></svg>',
  grid: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13zM1.5 1a.5.5 0 0 0-.5.5V5h4V1H1.5zM5 6H1v4h4V6zm1 4h4V6H6v4zm-1 1H1v3.5a.5.5 0 0 0 .5.5H5v-4zm1 0v4h4v-4H6zm5 0v4h3.5a.5.5 0 0 0 .5-.5V11h-4zm0-1h4V6h-4v4zm0-5h4V1.5a.5.5 0 0 0-.5-.5H11v4zm-1 0V1H6v4h4z"/></svg>',
  copyright: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M10.83 7.443c-.198-1.037-.898-1.6-1.958-1.6-1.316 0-2.191.978-2.191 2.516v.163c0 1.5.865 2.457 2.191 2.457 1.024 0 1.749-.518 1.958-1.489h1.058c-.242 1.57-1.417 2.454-3.016 2.454-2.03 0-3.339-1.36-3.339-3.422v-.162c0-2.086 1.32-3.516 3.339-3.516 1.594 0 2.774.895 3.017 2.599z"/></svg>',
  compass2: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/></svg>',
  'arrow-left': '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></svg>',
  palette: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m4 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M5.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/><path d="M16 8c0 3.15-1.866 2.585-3.567 2.07C11.42 9.763 10.465 9.473 10 10c-.603.683-.475 1.819-.351 2.92C9.826 14.495 9.996 16 8 16a8 8 0 1 1 8-8m-8 7c.611 0 .654-.171.655-.176.078-.146.124-.464.07-1.119-.014-.168-.037-.37-.061-.591-.052-.464-.112-1.005-.118-1.462-.01-.707.083-1.61.704-2.314.369-.417.845-.578 1.272-.618.404-.038.812.026 1.16.104.343.077.702.186 1.025.284l.028.008c.346.105.658.199.953.266.653.148.904.083.991.024C14.717 9.38 15 9.161 15 8a7 7 0 1 0-7 7"/></svg>',
  smartphone: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/><path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>',
  monitor: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5"/></svg>',
};
function sbIcon(name, size) {
  let svg = SB_ICONS[name] || SB_ICONS.x;
  if (size) svg = svg.replace('width="16"', `width="${size}"`).replace('height="16"', `height="${size}"`).replace('width="14"', `width="${size}"`).replace('height="14"', `height="${size}"`).replace('width="18"', `width="${size}"`).replace('height="18"', `height="${size}"`);
  return svg;
}

function sbAccordionRow(id, icon, label, onclick) {
  return `<div class="sb-row" id="${id}" onclick="${onclick}">
    <span class="sb-row-icon">${icon}</span>
    <span class="sb-row-label">${label}</span>
    <span class="sb-row-chevron">›</span>
  </div>`;
}

function sbSectionRow(section, draggable) {
  const lib = SB.library[section.type];
  if (!lib) return '';
  const isOpen = SB.selectedId === section.id;
  const dragAttrs = draggable ? `draggable="true" data-drag-id="${section.id}"` : '';
  let html = `<div class="sb-row ${isOpen ? 'sb-row-open' : ''}" ${dragAttrs}>
    <div class="sb-row-main" onclick="sbToggleSection('${section.id}')">
      ${draggable ? '<span class="sb-drag-handle">⠿</span>' : ''}
      <span class="sb-row-icon">${sbIcon(lib.icon)}</span>
      <span class="sb-row-label">${lib.label}</span>
      <span class="sb-row-chevron">${isOpen ? '⌄' : '›'}</span>
    </div>`;
  if (draggable) {
    html += `<button class="sb-row-del" title="${sbT('delete')}" onclick="event.stopPropagation(); sbDeleteSection('${section.id}')">${sbIcon('x')}</button>`;
  }
  html += `</div>`;
  if (isOpen) {
    html += `<div class="sb-fields" id="sb-fields-${section.id}"></div>`;
  }
  return html;
}

function sbToggleSection(id) {
  SB.selectedId = SB.selectedId === id ? null : id;
  sbRenderSidebar();
}

function sbDeleteSection(id) {
  SB.sections = SB.sections.filter(s => s.id !== id);
  if (SB.selectedId === id) SB.selectedId = null;
  sbRenderSidebar();
  sbSchedulePreview();
}

function sbOpenAddSectionMenu() {
  const excluded = ['announcement_bar', 'footer'];
  const options = Object.entries(SB.library).filter(([type]) => !excluded.includes(type));
  const list = options.map(([type, lib]) =>
    `<button class="sb-picker-item" onclick="sbAddSectionOfType('${type}'); sbCloseModal();">
      ${sbIcon(lib.icon, 22)}<span>${lib.label}</span>
    </button>`
  ).join('');
  sbOpenModal(sbT('chooseSection'), `<div class="sb-picker-grid">${list}</div>`);
}

function sbAddSectionOfType(type) {
  const newSection = sbNewSection(type);
  if (type === 'announcement_bar' || type === 'footer') {
    SB.sections = SB.sections.filter(s => s.type !== type);
    if (type === 'announcement_bar') SB.sections.unshift(newSection);
    else SB.sections.push(newSection);
  } else {
    // insert before footer if any, else at end
    const footerIdx = SB.sections.findIndex(s => s.type === 'footer');
    if (footerIdx >= 0) SB.sections.splice(footerIdx, 0, newSection);
    else SB.sections.push(newSection);
  }
  SB.selectedId = newSection.id;
  sbRenderSidebar();
  sbSchedulePreview();
}

// ---------- Drag & drop reorder (middle "Sections" group only) ----------
let sbDragSrcId = null;
function sbEnableDragDrop() {
  const rows = document.querySelectorAll('#sbSectionsList [data-drag-id]');
  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      sbDragSrcId = row.dataset.dragId;
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('sb-drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('sb-drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('sb-drag-over');
      const targetId = row.dataset.dragId;
      if (!sbDragSrcId || sbDragSrcId === targetId) return;
      const srcIdx = SB.sections.findIndex(s => s.id === sbDragSrcId);
      const tgtIdx = SB.sections.findIndex(s => s.id === targetId);
      if (srcIdx < 0 || tgtIdx < 0) return;
      const [moved] = SB.sections.splice(srcIdx, 1);
      SB.sections.splice(tgtIdx, 0, moved);
      sbRenderSidebar();
      sbSchedulePreview();
    });
  });
}

// ---------- Dynamic field form ----------
function sbGetSection(id) { return SB.sections.find(s => s.id === id); }

function sbRenderFieldsForm(id, container) {
  const section = sbGetSection(id);
  const lib = SB.library[section.type];
  let html = '';
  (lib.fields || []).forEach(f => { html += sbRenderField(section, f); });
  container.innerHTML = html;
}

function sbRenderField(section, f) {
  const val = section.props[f.key];
  const inputId = `f_${section.id}_${f.key}`;
  let inner = '';
  if (f.type === 'text' || f.type === 'url') {
    inner = `<input type="text" id="${inputId}" class="sb-input" value="${sbEsc(val || '')}" oninput="sbUpdateProp('${section.id}','${f.key}', this.value)">`;
  } else if (f.type === 'textarea') {
    inner = `<textarea id="${inputId}" class="sb-input" rows="3" oninput="sbUpdateProp('${section.id}','${f.key}', this.value)">${sbEsc(val || '')}</textarea>`;
  } else if (f.type === 'number') {
    inner = `<input type="number" id="${inputId}" class="sb-input" value="${val || 0}" oninput="sbUpdateProp('${section.id}','${f.key}', Number(this.value))">`;
  } else if (f.type === 'color') {
    inner = `<input type="color" id="${inputId}" class="sb-color" value="${val || '#000000'}" oninput="sbUpdateProp('${section.id}','${f.key}', this.value)">`;
  } else if (f.type === 'boolean') {
    inner = `<label class="sb-switch"><input type="checkbox" ${val ? 'checked' : ''} onchange="sbUpdateProp('${section.id}','${f.key}', this.checked)"><span></span></label>`;
  } else if (f.type === 'select') {
    const opts = (f.options || []).map(o => `<option value="${o.value}" ${o.value === val ? 'selected' : ''}>${o.label}</option>`).join('');
    inner = `<select id="${inputId}" class="sb-input" onchange="sbUpdateProp('${section.id}','${f.key}', this.value)">${opts}</select>`;
  } else if (f.type === 'image') {
    inner = `<div class="sb-image-field">
      ${val ? `<img src="${val}" class="sb-image-preview">` : `<div class="sb-image-empty">${sbT('noImage')}</div>`}
      <input type="file" accept="image/*" id="${inputId}" style="display:none" onchange="sbUploadImage('${section.id}','${f.key}', this)">
      <button type="button" class="sb-btn-secondary" onclick="document.getElementById('${inputId}').click()">${sbT('uploadImage')}</button>
    </div>`;
  } else if (f.type === 'list') {
    inner = sbRenderListField(section, f);
  }
  return `<div class="sb-field"><label class="sb-field-label">${f.label}</label>${inner}</div>`;
}

function sbRenderListField(section, f) {
  const items = section.props[f.key] || [];
  let rows = items.map((item, idx) => {
    const fields = (f.item_fields || []).map(sf => {
      const v = item[sf.key];
      const iid = `li_${section.id}_${f.key}_${idx}_${sf.key}`;
      let inp;
      if (sf.type === 'textarea') {
        inp = `<textarea class="sb-input" rows="2" oninput="sbUpdateListItem('${section.id}','${f.key}',${idx},'${sf.key}', this.value)">${sbEsc(v || '')}</textarea>`;
      } else if (sf.type === 'number') {
        inp = `<input type="number" class="sb-input" value="${v || 0}" oninput="sbUpdateListItem('${section.id}','${f.key}',${idx},'${sf.key}', Number(this.value))">`;
      } else if (sf.type === 'image') {
        inp = `<div class="sb-image-field">
          ${v ? `<img src="${v}" class="sb-image-preview">` : `<div class="sb-image-empty">${sbT('noImage')}</div>`}
          <input type="file" accept="image/*" id="${iid}" style="display:none" onchange="sbUploadListImage('${section.id}','${f.key}',${idx},'${sf.key}', this)">
          <button type="button" class="sb-btn-secondary" onclick="document.getElementById('${iid}').click()">${sbT('uploadImage')}</button>
        </div>`;
      } else {
        inp = `<input type="text" class="sb-input" value="${sbEsc(v || '')}" oninput="sbUpdateListItem('${section.id}','${f.key}',${idx},'${sf.key}', this.value)">`;
      }
      return `<div class="sb-field"><label class="sb-field-label-sm">${sf.label}</label>${inp}</div>`;
    }).join('');
    return `<div class="sb-list-item">
      <div class="sb-list-item-head">
        <span>#${idx + 1}</span>
        <button type="button" class="sb-row-del" onclick="sbRemoveListItem('${section.id}','${f.key}',${idx})">${sbIcon('x')}</button>
      </div>
      ${fields}
    </div>`;
  }).join('');
  return `<div class="sb-list-field">${rows}<button type="button" class="sb-add-btn" onclick="sbAddListItem('${section.id}','${f.key}')">${sbT('addItem')}</button></div>`;
}

function sbUpdateProp(sectionId, key, value) {
  const s = sbGetSection(sectionId);
  s.props[key] = value;
  sbSchedulePreview();
}

function sbUpdateListItem(sectionId, listKey, idx, itemKey, value) {
  const s = sbGetSection(sectionId);
  s.props[listKey][idx][itemKey] = value;
  sbSchedulePreview();
}

function sbAddListItem(sectionId, listKey) {
  const s = sbGetSection(sectionId);
  const lib = SB.library[s.type];
  const fieldDef = lib.fields.find(f => f.key === listKey);
  const blank = {};
  (fieldDef.item_fields || []).forEach(sf => { blank[sf.key] = sf.type === 'number' ? 0 : ''; });
  s.props[listKey].push(blank);
  sbRenderSidebar();
  sbSchedulePreview();
}

function sbRemoveListItem(sectionId, listKey, idx) {
  const s = sbGetSection(sectionId);
  s.props[listKey].splice(idx, 1);
  sbRenderSidebar();
  sbSchedulePreview();
}

async function sbUploadImage(sectionId, key, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  try {
    const url = await sbDoUpload(file);
    sbUpdateProp(sectionId, key, url);
    sbRenderSidebar();
  } catch (e) { alert(sbT('failedUpload') + e.message); }
}

async function sbUploadListImage(sectionId, listKey, idx, itemKey, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  try {
    const url = await sbDoUpload(file);
    sbUpdateListItem(sectionId, listKey, idx, itemKey, url);
    sbRenderSidebar();
  } catch (e) { alert(sbT('failedUpload') + e.message); }
}

async function sbDoUpload(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`/stores/${SB.storeId}/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SB.token}` },
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.detail) || 'error');
  return data.url;
}

function sbEsc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------- Nav menu editor ----------
function sbOpenNavMenuEditor() {
  sbRenderNavMenuModal();
}

function sbRenderNavMenuModal() {
  let rows = SB.navLinks.map((l, idx) => `
    <div class="sb-list-item">
      <div class="sb-list-item-head"><span>#${idx + 1}</span><button type="button" class="sb-row-del" onclick="sbRemoveNavLink(${idx})">${sbIcon('x')}</button></div>
      <div class="sb-field"><label class="sb-field-label-sm">${sbT('navLinkText')}</label><input type="text" class="sb-input" value="${sbEsc(l.label)}" oninput="sbUpdateNavLink(${idx},'label', this.value)"></div>
      <div class="sb-field"><label class="sb-field-label-sm">${sbT('navLinkUrl')}</label><input type="text" class="sb-input" value="${sbEsc(l.url)}" oninput="sbUpdateNavLink(${idx},'url', this.value)"></div>
    </div>
  `).join('');
  const body = `
    <div class="sb-list-field">${rows}<button type="button" class="sb-add-btn" onclick="sbAddNavLink()">${sbT('addLink')}</button></div>
    <button class="sb-save-btn" style="margin-top:16px;" onclick="sbSaveNavMenu()">${sbT('saveMenu')}</button>
  `;
  sbOpenModal(sbT('navMenu'), body);
}

function sbAddNavLink() { SB.navLinks.push({ label: '', url: '/' }); sbRenderNavMenuModal(); }
function sbRemoveNavLink(idx) { SB.navLinks.splice(idx, 1); sbRenderNavMenuModal(); }
function sbUpdateNavLink(idx, key, val) { SB.navLinks[idx][key] = val; }

async function sbSaveNavMenu() {
  try {
    await sbApi('/builder/nav-menu', { method: 'PUT', body: { links: SB.navLinks } });
    sbCloseModal();
    sbToast(sbT('navMenuSaved'));
  } catch (e) { alert(sbT('errorGeneric') + e.message); }
}

// ---------- Modal ----------
function sbOpenModal(title, bodyHtml) {
  document.getElementById('sbModalTitle').textContent = title;
  document.getElementById('sbModalBody').innerHTML = bodyHtml;
  document.getElementById('sbModalOverlay').classList.add('open');
}
function sbCloseModal() {
  document.getElementById('sbModalOverlay').classList.remove('open');
}

// ---------- Preview ----------
function sbSetPreviewDevice(device) {
  const outer = document.getElementById('sbPreviewFrameOuter');
  outer.classList.toggle('sb-preview-desktop', device === 'desktop');
  document.querySelectorAll('.sb-device-btn').forEach(b => b.classList.toggle('sb-device-active', b.dataset.device === device));
  localStorage.setItem('oxyde_builder_device', device);
}

function sbSchedulePreview() {
  clearTimeout(SB.previewTimer);
  SB.previewTimer = setTimeout(sbRefreshPreview, 450);
}

async function sbRefreshPreview() {
  try {
    const data = await sbApi('/builder/preview', {
      method: 'POST',
      body: { page_type: SB.pageType, sections: SB.sections.map(s => ({ id: s.id, type: s.type, props: s.props })) },
    });
    const iframe = document.getElementById('sbPreviewFrame');
    iframe.srcdoc = data.html;
  } catch (e) {
    console.error('preview error', e);
  }
}

// ---------- Save ----------
async function sbSavePage() {
  const btn = document.getElementById('sbSaveBtn');
  btn.disabled = true;
  btn.textContent = sbT('saving');
  try {
    const payload = { sections: SB.sections.map(s => ({ id: s.id, type: s.type, props: s.props })) };
    if (SB.customPageId) {
      await sbApi(`/builder/custom-pages/${SB.customPageId}`, { method: 'PUT', body: payload });
    } else {
      await sbApi(`/builder/pages/${SB.pageType}`, { method: 'PUT', body: payload });
    }
    sbToast(sbT('savedSuccess'));
  } catch (e) {
    alert(sbT('errorSaving') + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = sbT('save');
  }
}

// ---------- Custom pages: create / delete ----------
// ---------- Style panel (Colors & Fonts) ----------
const SB_FONT_OPTIONS = ['Inter', 'Roboto', 'Poppins', 'Cairo', 'Tajawal', 'Montserrat', 'Open Sans', 'Lato'];

async function sbOpenStylePanel() {
  let current = {};
  try {
    current = await sbApi('/builder/style');
  } catch (e) { /* best effort — نبداو بقيم فارغة */ }

  const colorRow = (key, labelKey, hintKey, defaultVal) => `
    <div class="sb-field" style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
      <input type="color" id="sbStyle_${key}" value="${current[key] || defaultVal}" style="width:44px; height:44px; border-radius:8px; border:1px solid var(--sb-border); cursor:pointer; background:transparent; padding:2px;">
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:600; color:var(--sb-text);">${sbT(labelKey)}</div>
        <div style="font-size:11px; color:var(--sb-faint);">${sbT(hintKey)}</div>
      </div>
      <input type="text" id="sbStyleHex_${key}" value="${current[key] || defaultVal}" style="width:90px; font-family:monospace; font-size:12px; background:var(--sb-panel2); border:1px solid var(--sb-border); border-radius:6px; padding:6px 8px; color:var(--sb-text);" oninput="document.getElementById('sbStyle_${key}').value=this.value">
    </div>`;

  const fontOptions = SB_FONT_OPTIONS.map(f => `<option value="${f}" ${current.font === f ? 'selected' : ''}>${f}</option>`).join('');

  const body = `
    <div style="margin-bottom:18px;">
      <div style="font-size:12px; font-weight:700; color:var(--sb-faint); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px;">${sbT('colors')}</div>
      ${colorRow('primary_color', 'primaryColor', 'primaryColorHint', '#6366f1')}
      ${colorRow('secondary_color', 'secondaryColor', 'secondaryColorHint', '#818cf8')}
      ${colorRow('bg_color', 'pageBg', 'pageBgHint', '#0a0a0f')}
      ${colorRow('section_bg_color', 'sectionBg', 'sectionBgHint', '#1a1a25')}
      ${colorRow('heading_color', 'headings', 'headingsHint', '#f1f5f9')}
      ${colorRow('subheading_color', 'subheadings', 'subheadingsHint', '#94a3b8')}
    </div>
    <div style="margin-bottom:10px;">
      <div style="font-size:12px; font-weight:700; color:var(--sb-faint); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px;">${sbT('fonts')}</div>
      <div class="sb-field">
        <label class="sb-field-label-sm">${sbT('bodyFont')}</label>
        <select id="sbStyle_font" class="sb-input">${fontOptions}</select>
      </div>
    </div>
    <button class="sb-save-btn" style="margin-top:14px;" onclick="sbSaveStyle()">${sbT('saveStyle')}</button>
  `;
  sbOpenModal(sbT('styleTitle'), body);
}

async function sbSaveStyle() {
  const keys = ['primary_color', 'secondary_color', 'bg_color', 'section_bg_color', 'heading_color', 'subheading_color'];
  const payload = {};
  keys.forEach(k => {
    const el = document.getElementById(`sbStyle_${k}`);
    if (el) payload[k] = el.value;
  });
  const fontEl = document.getElementById('sbStyle_font');
  if (fontEl) payload.font = fontEl.value;

  try {
    await sbApi('/builder/style', { method: 'PUT', body: payload });
    sbCloseModal();
    sbToast(sbT('styleSaved'));
    sbSchedulePreview();
  } catch (e) {
    alert(sbT('errorGeneric') + e.message);
  }
}

function sbOpenCreateCustomPage() {
  const body = `
    <div class="sb-field"><label class="sb-field-label">${sbT('pageTitle')}</label><input type="text" id="sbNewPageTitle" class="sb-input" placeholder="${sbT('pageTitlePh')}"></div>
    <div class="sb-field"><label class="sb-field-label">${sbT('pageSlug')}</label><input type="text" id="sbNewPageSlug" class="sb-input" placeholder="about-us"></div>
    <button class="sb-save-btn" style="margin-top:10px;" onclick="sbCreateCustomPage()">${sbT('createPage')}</button>
  `;
  sbOpenModal(sbT('newPageModalTitle'), body);
}

async function sbCreateCustomPage() {
  const title = document.getElementById('sbNewPageTitle').value.trim();
  const slug = document.getElementById('sbNewPageSlug').value.trim();
  if (!title || !slug) { alert(sbT('enterTitleAndSlug')); return; }
  try {
    const page = await sbApi('/builder/custom-pages', { method: 'POST', body: { title, slug } });
    SB.customPages.push(page);
    sbCloseModal();
    await sbLoadCustomPage(page.id);
    sbToast(sbT('pageCreated'));
  } catch (e) {
    alert(sbT('errorGeneric') + e.message);
  }
}

async function sbDeleteCurrentCustomPage() {
  if (!SB.customPageId) return;
  if (!confirm(sbT('confirmDeletePage'))) return;
  try {
    await sbApi(`/builder/custom-pages/${SB.customPageId}`, { method: 'DELETE' });
    SB.customPages = SB.customPages.filter(p => p.id !== SB.customPageId);
    await sbLoadPage('home');
    sbToast(sbT('pageDeleted'));
  } catch (e) {
    alert(sbT('errorGeneric') + e.message);
  }
}

function sbToast(msg) {
  const el = document.getElementById('sbToast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function sbSwitchPage(pageType) {
  if (pageType === SB.pageType && !SB.customPageId) return;
  sbLoadPage(pageType);
}

document.addEventListener('DOMContentLoaded', sbInit);
