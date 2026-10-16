if (document.getElementById('product-container')) {
/* ───────── helpers ───────── */
function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

function formatCategory(cat) {
  return cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function timeAgo(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return 'baru saja';
  const m = Math.floor(s / 60); if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24); return `${d} hari lalu`;
}

/* ───────── fake user pool ───────── */
const USERS = [
  { name: 'Rina Maharani', handle: '@rina_m', avatar: 'https://i.pravatar.cc/40?img=1' },
  { name: 'Bagas Pratama', handle: '@bagas.prtm', avatar: 'https://i.pravatar.cc/40?img=3' },
  { name: 'Siti Nurhaliza', handle: '@siti_nur', avatar: 'https://i.pravatar.cc/40?img=5' },
  { name: 'Dika Ramadhan', handle: '@dika.r', avatar: 'https://i.pravatar.cc/40?img=7' },
  { name: 'Lina Wati', handle: '@linawati', avatar: 'https://i.pravatar.cc/40?img=9' },
  { name: 'Andi Setiawan', handle: '@andi_s', avatar: 'https://i.pravatar.cc/40?img=11' },
  { name: 'Mega Puspita', handle: '@megaaa', avatar: 'https://i.pravatar.cc/40?img=13' },
  { name: 'Yoga Pratama', handle: '@yogap', avatar: 'https://i.pravatar.cc/40?img=15' },
];

/* ───────── state ───────── */
let allPosts = [];
let likedIds = new Set(JSON.parse(localStorage.getItem('socmark_liked') || '[]'));
let savedIds = new Set(JSON.parse(localStorage.getItem('socmark_saved') || '[]'));
let commentsMap = JSON.parse(localStorage.getItem('socmark_comments') || '{}'); // id → [{name,text,ago}]
let activeFilter = 'all';

/* ───────── DOM refs ───────── */
const productContainer = document.getElementById('product-container');
const filterBar = document.getElementById('feed-filter-bar');
const modalOverlay = document.getElementById('product-modal-overlay');
const modalClose = document.getElementById('product-modal-close');
const modalInner = document.getElementById('product-modal-inner');

/* ───────── persist ───────── */
function persist() {
  localStorage.setItem('socmark_liked', JSON.stringify([...likedIds]));
  localStorage.setItem('socmark_saved', JSON.stringify([...savedIds]));
  localStorage.setItem('socmark_comments', JSON.stringify(commentsMap));
}

/* ───────── build post objects from API products ───────── */
function buildPost(product, index) {
  const user = USERS[index % USERS.length];
  const likeBase = Math.round(product.rating * 40 + index * 7);
  const commentSeed = Math.round(product.stock / 3 + index * 2);
  const postedMs = Date.now() - (index * 2.7 + Math.random() * 5) * 3600000;
  return { ...product, _user: user, _likeBase: likeBase, _commentSeed: commentSeed, _postedMs: postedMs };
}

/* ───────── filter pills ───────── */
function renderFilters(posts) {
  const cats = ['all', ...new Set(posts.map(p => p.category))]
    .sort((a, b) => a === 'all' ? -1 : a.localeCompare(b));

  filterBar.innerHTML = cats.map(cat => {
    const isActive = cat === activeFilter;
    const label = cat === 'all' ? 'Semua' : formatCategory(cat);
    return `<button
      class="feed-filter-pill${isActive ? ' active' : ''}"
      data-category="${escapeHtml(cat)}"
      role="tab"
      aria-selected="${isActive}"
    >${label}</button>`;
  }).join('');

  filterBar.querySelectorAll('.feed-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.category;
      renderFilters(allPosts);
      renderPosts(getFiltered());
    });
  });
}

function getFiltered() {
  if (activeFilter === 'all') return allPosts;
  return allPosts.filter(p => p.category === activeFilter);
}

/* ───────── render single card ───────── */
function renderCard(post) {
  const id = Number(post.id);
  const title = escapeHtml(post.title);
  const image = escapeHtml(post.images?.[0] || post.thumbnail || '');
  const catLabel = formatCategory(post.category || 'umum');
  const isSaved = savedIds.has(id);
  const isLiked = likedIds.has(id);
  const likes = post._likeBase + (isLiked ? 1 : 0);
  const cCount = (commentsMap[id] || []).length + post._commentSeed;
  const ago = timeAgo(Date.now() - post._postedMs);
  const user = post._user;

  return `
    <article class="product-card" data-id="${id}" aria-label="${title}" tabindex="0" role="button">
      <div class="product-visual">
        <img class="product-image" src="${image}" alt="${title}" loading="lazy">

        <!-- Category pill top-left -->
        <span class="product-category-pill">${escapeHtml(catLabel)}</span>

        <!-- Save button top-right -->
        <button
          class="product-save-btn${isSaved ? ' saved' : ''}"
          data-id="${id}"
          aria-label="${isSaved ? 'Hapus simpanan' : 'Simpan posting'}"
        >
          <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <!-- Card footer: poster info + actions -->
      <div class="post-card-footer">
        <div class="post-poster-row">
          <img class="post-avatar" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" loading="lazy">
          <div class="post-poster-info">
            <span class="post-poster-name">${escapeHtml(user.name)}</span>
            <span class="post-poster-meta">${escapeHtml(user.handle)} · ${escapeHtml(ago)}</span>
          </div>
        </div>
        <p class="post-card-title">${title}</p>
        <div class="post-card-actions">
          <button class="post-action-btn like-btn${isLiked ? ' active' : ''}" data-id="${id}" aria-label="Suka">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="like-count">${likes}</span>
          </button>
          <button class="post-action-btn comment-btn" data-id="${id}" aria-label="Komentar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${cCount}</span>
          </button>
        </div>
      </div>
    </article>`;
}

/* ───────── render grid ───────── */
function renderPosts(posts) {
  if (!posts.length) {
    productContainer.innerHTML = '<p class="product-state">Tidak ada posting di kategori ini.</p>';
    productContainer.setAttribute('aria-busy', 'false');
    return;
  }
  productContainer.innerHTML = posts.map(renderCard).join('');
  productContainer.setAttribute('aria-busy', 'false');
  attachCardEvents();
}

/* ───────── card events ───────── */
function attachCardEvents() {
  productContainer.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.product-save-btn') || e.target.closest('.post-action-btn')) return;
      const id = Number(card.dataset.id);
      const post = allPosts.find(p => Number(p.id) === id);
      if (post) openModal(post);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  /* like */
  productContainer.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const post = allPosts.find(p => Number(p.id) === id);
      const svg = btn.querySelector('svg');
      const count = btn.querySelector('.like-count');
      if (likedIds.has(id)) {
        likedIds.delete(id);
        btn.classList.remove('active');
        svg.setAttribute('fill', 'none');
        count.textContent = post._likeBase;
      } else {
        likedIds.add(id);
        btn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
        count.textContent = post._likeBase + 1;
      }
      persist();
    });
  });

  /* comment (open modal to comment section) */
  productContainer.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const post = allPosts.find(p => Number(p.id) === id);
      if (post) openModal(post, true);
    });
  });

  /* save */
  productContainer.querySelectorAll('.product-save-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const svg = btn.querySelector('svg');
      if (savedIds.has(id)) {
        savedIds.delete(id);
        btn.classList.remove('saved');
        btn.setAttribute('aria-label', 'Simpan posting');
        svg.setAttribute('fill', 'none');
      } else {
        savedIds.add(id);
        btn.classList.add('saved');
        btn.setAttribute('aria-label', 'Hapus simpanan');
        svg.setAttribute('fill', 'currentColor');
      }
      persist();
    });
  });
}

/* ───────── modal ───────── */
function openModal(post, focusComment = false) {
  const id = Number(post.id);
  const title = escapeHtml(post.title);
  const desc = escapeHtml(post.description || '');
  const catLabel = formatCategory(post.category || '');
  const images = post.images || [post.thumbnail];
  const user = post._user;
  const isSaved = savedIds.has(id);
  const isLiked = likedIds.has(id);
  const likes = post._likeBase + (isLiked ? 1 : 0);
  const ago = timeAgo(Date.now() - post._postedMs);

  /* build existing comments (seed + stored) */
  const seedComments = buildSeedComments(post);
  const userComments = commentsMap[id] || [];
  const allComments = [...seedComments, ...userComments];

  modalInner.innerHTML = `
    <!-- Gallery side -->
    <div class="modal-gallery">
      <img class="modal-main-img" src="${escapeHtml(images[0])}" alt="${title}" id="modal-main-img">
      ${images.length > 1 ? `
      <div class="modal-thumbs">
        ${images.slice(0, 5).map((img, i) => `
          <img class="modal-thumb${i === 0 ? ' active' : ''}"
            src="${escapeHtml(img)}" alt="${title} ${i + 1}"
            data-src="${escapeHtml(img)}" tabindex="0">
        `).join('')}
      </div>` : ''}
    </div>

    <!-- Info / comment side -->
    <div class="modal-info">
      <!-- Poster -->
      <div class="modal-poster-row">
        <img class="modal-poster-avatar" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}">
        <div>
          <p class="modal-poster-name">${escapeHtml(user.name)}</p>
          <p class="modal-poster-meta">${escapeHtml(user.handle)} · ${escapeHtml(ago)}</p>
        </div>
        <div class="modal-meta-right">
          <span class="modal-category-pill">${escapeHtml(catLabel)}</span>
          <button class="modal-save-btn${isSaved ? ' saved' : ''}" data-id="${id}" aria-label="${isSaved ? 'Hapus simpanan' : 'Simpan posting'}">
            <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="15" height="15">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            ${isSaved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      <h2 class="modal-title">${title}</h2>
      <p class="modal-desc">${desc}</p>

      <!-- Like row -->
      <div class="modal-like-row">
        <button class="modal-like-btn${isLiked ? ' active' : ''}" data-id="${id}" aria-label="Suka">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="modal-like-count">${likes} suka</span>
        </button>
        <span class="modal-comment-stat">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          ${allComments.length} komentar
        </span>
      </div>

      <!-- Comments -->
      <div class="modal-comments-section">
        <p class="modal-comments-label">Komentar</p>
        <div class="modal-comments-list" id="modal-comments-list">
          ${allComments.map(c => `
            <div class="modal-comment-item">
              <img class="modal-comment-avatar" src="${escapeHtml(c.avatar)}" alt="${escapeHtml(c.name)}">
              <div class="modal-comment-body">
                <span class="modal-comment-name">${escapeHtml(c.name)}</span>
                <span class="modal-comment-ago">${escapeHtml(c.ago)}</span>
                <p class="modal-comment-text">${escapeHtml(c.text)}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Input komentar -->
        <div class="modal-comment-input-row">
          <img class="modal-comment-avatar" src="https://i.pravatar.cc/40?img=33" alt="Kamu">
          <div class="modal-comment-input-wrap">
            <input
              type="text"
              class="modal-comment-input"
              id="modal-comment-input"
              placeholder="Tulis komentar…"
              maxlength="280"
              aria-label="Tulis komentar"
            >
            <button class="modal-comment-send" id="modal-comment-send" aria-label="Kirim komentar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  /* thumbnail switcher */
  modalInner.querySelectorAll('.modal-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      modalInner.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      document.getElementById('modal-main-img').src = thumb.dataset.src;
    });
    thumb.addEventListener('keydown', e => { if (e.key === 'Enter') thumb.click(); });
  });

  /* modal save */
  const modalSaveBtn = modalInner.querySelector('.modal-save-btn');
  if (modalSaveBtn) {
    modalSaveBtn.addEventListener('click', () => {
      const sid = Number(modalSaveBtn.dataset.id);
      const svg = modalSaveBtn.querySelector('svg');
      if (savedIds.has(sid)) {
        savedIds.delete(sid);
        modalSaveBtn.classList.remove('saved');
        svg.setAttribute('fill', 'none');
        modalSaveBtn.lastChild.textContent = ' Simpan';
        modalSaveBtn.setAttribute('aria-label', 'Simpan posting');
      } else {
        savedIds.add(sid);
        modalSaveBtn.classList.add('saved');
        svg.setAttribute('fill', 'currentColor');
        modalSaveBtn.lastChild.textContent = ' Tersimpan';
        modalSaveBtn.setAttribute('aria-label', 'Hapus simpanan');
      }
      persist();
      /* sync card */
      const cardBtn = productContainer.querySelector(`.product-save-btn[data-id="${sid}"]`);
      if (cardBtn) {
        cardBtn.classList.toggle('saved', savedIds.has(sid));
        cardBtn.querySelector('svg').setAttribute('fill', savedIds.has(sid) ? 'currentColor' : 'none');
      }
    });
  }

  /* modal like */
  const modalLikeBtn = modalInner.querySelector('.modal-like-btn');
  if (modalLikeBtn) {
    modalLikeBtn.addEventListener('click', () => {
      const lid = Number(modalLikeBtn.dataset.id);
      const pst = allPosts.find(p => Number(p.id) === lid);
      const svg = modalLikeBtn.querySelector('svg');
      const countEl = modalLikeBtn.querySelector('.modal-like-count');
      if (likedIds.has(lid)) {
        likedIds.delete(lid);
        modalLikeBtn.classList.remove('active');
        svg.setAttribute('fill', 'none');
        countEl.textContent = `${pst._likeBase} suka`;
      } else {
        likedIds.add(lid);
        modalLikeBtn.classList.add('active');
        svg.setAttribute('fill', 'currentColor');
        countEl.textContent = `${pst._likeBase + 1} suka`;
      }
      persist();
      /* sync card */
      const cardLikeBtn = productContainer.querySelector(`.like-btn[data-id="${lid}"]`);
      if (cardLikeBtn) {
        cardLikeBtn.classList.toggle('active', likedIds.has(lid));
        cardLikeBtn.querySelector('svg').setAttribute('fill', likedIds.has(lid) ? 'currentColor' : 'none');
        cardLikeBtn.querySelector('.like-count').textContent = likedIds.has(lid) ? pst._likeBase + 1 : pst._likeBase;
      }
    });
  }

  /* send comment */
  const commentInput = document.getElementById('modal-comment-input');
  const commentSend = document.getElementById('modal-comment-send');
  const commentList = document.getElementById('modal-comments-list');

  function sendComment() {
    const text = commentInput.value.trim();
    if (!text) return;
    const newC = { name: 'Kamu', avatar: 'https://i.pravatar.cc/40?img=33', text, ago: 'baru saja' };
    if (!commentsMap[id]) commentsMap[id] = [];
    commentsMap[id].push(newC);
    persist();

    const el = document.createElement('div');
    el.className = 'modal-comment-item new-comment';
    el.innerHTML = `
      <img class="modal-comment-avatar" src="https://i.pravatar.cc/40?img=33" alt="Kamu">
      <div class="modal-comment-body">
        <span class="modal-comment-name">Kamu</span>
        <span class="modal-comment-ago">baru saja</span>
        <p class="modal-comment-text">${escapeHtml(text)}</p>
      </div>`;
    commentList.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    commentInput.value = '';
  }

  commentSend.addEventListener('click', sendComment);
  commentInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendComment(); });

  modalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';

  if (focusComment) {
    setTimeout(() => commentInput?.focus(), 120);
  } else {
    modalClose.focus();
  }
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modalOverlay.hidden) closeModal(); });

/* ───────── seed comments generator ───────── */
const SEED_COMMENTS = [
  { name: 'Rina Maharani', avatar: 'https://i.pravatar.cc/40?img=1', texts: ['Wah bagus banget! 😍', 'Boleh minta info lebih?', 'Keren sih ini', 'Udah lama nyari yang kayak gini!'] },
  { name: 'Bagas Pratama', avatar: 'https://i.pravatar.cc/40?img=3', texts: ['Masih ada stok nggak?', 'Harga terjangkau banget 👍', 'Mantaap!'] },
  { name: 'Siti Nurhaliza', avatar: 'https://i.pravatar.cc/40?img=5', texts: ['Bisa dikirim ke luar kota?', 'Materialnya gimana kak?', 'Suka banget estetiknya ✨'] },
  { name: 'Dika Ramadhan', avatar: 'https://i.pravatar.cc/40?img=7', texts: ['Sudah order belum?', 'Recommended banget!', 'Kalau mau order chat dulu ya'] },
  { name: 'Mega Puspita', avatar: 'https://i.pravatar.cc/40?img=13', texts: ['Auto kepengen 😭', 'Kualitasnya bagus nggak ya?', 'Posting lagi dong kak!'] },
];
const SEED_AGOS = ['2 mnt lalu', '5 mnt lalu', '14 mnt lalu', '1 jam lalu', '3 jam lalu', '8 jam lalu'];

function buildSeedComments(post) {
  const count = Math.min(post._commentSeed, 6);
  const results = [];
  for (let i = 0; i < count; i++) {
    const u = SEED_COMMENTS[i % SEED_COMMENTS.length];
    const text = u.texts[(Number(post.id) + i) % u.texts.length];
    results.push({ name: u.name, avatar: u.avatar, text, ago: SEED_AGOS[i % SEED_AGOS.length] });
  }
  return results;
}

/* ───────── fetch ───────── */
fetch('https://dummyjson.com/products?limit=50')
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(data => {
    allPosts = (data.products || []).map((p, i) => buildPost(p, i));
    renderFilters(allPosts);
    renderPosts(allPosts);
  })
  .catch(() => {
    productContainer.innerHTML = '<p class="product-state product-error">Gagal memuat posting. Periksa koneksi lalu muat ulang.</p>';
    productContainer.setAttribute('aria-busy', 'false');
  });
}

if (document.getElementById('user-tbody')) {
  const COLORS = ['#52705f', '#c65b83', '#c28b35', '#43815a', '#3385a5', '#8060a8', '#b64a3b', '#3f8d83'];
  const users = [
    { id: 'USR001', name: 'Grace Nakamura', username: 'gracemark', email: 'grace@socmark.id', role: 'admin', status: 'active', apiKey: genKey(), color: '#52705f' },
    { id: 'USR002', name: 'Bima Santoso', username: 'bimasnt', email: 'bima@socmark.id', role: 'reseller', status: 'active', apiKey: genKey(), color: '#c28b35' },
    { id: 'USR003', name: 'Laila Putri', username: 'laila_p', email: 'laila@socmark.id', role: 'member', status: 'active', apiKey: genKey(), color: '#43815a' },
    { id: 'USR004', name: 'Dimas Arief', username: 'dimasarief', email: 'dimas@socmark.id', role: 'reseller', status: 'inactive', apiKey: genKey(), color: '#3385a5' },
    { id: 'USR005', name: 'Sari Wulandari', username: 'sariwulan', email: 'sari@socmark.id', role: 'member', status: 'active', apiKey: genKey(), color: '#c65b83' },
    { id: 'USR006', name: 'Reza Firmansyah', username: 'rezafirman', email: 'reza@socmark.id', role: 'admin', status: 'active', apiKey: genKey(), color: '#8060a8' },
    { id: 'USR007', name: 'Nadia Kusuma', username: 'nadiakusuma', email: 'nadia@socmark.id', role: 'member', status: 'inactive', apiKey: genKey(), color: '#b64a3b' },
    { id: 'USR008', name: 'Fajar Nugroho', username: 'fajarnug', email: 'fajar@socmark.id', role: 'reseller', status: 'active', apiKey: genKey(), color: '#3f8d83' },
    { id: 'USR009', name: 'Citra Ayu', username: 'citraayu', email: 'citra@socmark.id', role: 'member', status: 'active', apiKey: genKey(), color: '#c28b35' },
    { id: 'USR010', name: 'Hendra Wijaya', username: 'hendrawj', email: 'hendra@socmark.id', role: 'reseller', status: 'active', apiKey: genKey(), color: '#52705f' },
    { id: 'USR011', name: 'Putri Rahayu', username: 'putrirahay', email: 'putri@socmark.id', role: 'member', status: 'inactive', apiKey: genKey(), color: '#43815a' },
    { id: 'USR012', name: 'Andi Prasetyo', username: 'andipras', email: 'andi@socmark.id', role: 'admin', status: 'active', apiKey: genKey(), color: '#c65b83' },
  ];

  let nextId = 13;
  let editId = null;
  let deleteTargetId = null;
  let toastTimer = null;

  const tbody = document.getElementById('user-tbody');
  const formModal = document.getElementById('form-modal');
  const deleteModal = document.getElementById('delete-modal');
  const fName = document.getElementById('f-name');
  const fUsername = document.getElementById('f-username');
  const fEmail = document.getElementById('f-email');
  const fRole = document.getElementById('f-role');
  const fStatus = document.getElementById('f-status');
  const modalTitle = document.getElementById('form-modal-title');
  const formSaveBtn = document.getElementById('form-save-btn');

  function genKey() {
    return `sk_${Array.from({ length: 28 }, () => Math.random().toString(36)[2]).join('')}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
  }

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).map(word => word[0]).join('').slice(0, 2).toUpperCase();
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-3', 'border-[#dce4dc]', 'border-[#e6b8b0]');
    toast.classList.add('opacity-100', 'translate-y-0');
    toast.classList.add(type === 'danger' ? 'border-[#e6b8b0]' : 'border-[#dce4dc]');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-3');
    }, 2800);
  }

  function updateStats() {
    document.getElementById('stat-total').textContent = users.length;
    document.getElementById('stat-admin').textContent = users.filter(user => user.role === 'admin').length;
    document.getElementById('stat-reseller').textContent = users.filter(user => user.role === 'reseller').length;
    document.getElementById('stat-member').textContent = users.filter(user => user.role === 'member').length;
    document.getElementById('total-badge').textContent = `${users.length} pengguna`;
  }

  function render() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    const role = document.getElementById('role-filter').value;
    const status = document.getElementById('status-filter').value;
    const filteredUsers = users.filter(user => {
      const matchesQuery = !query || [user.name, user.username, user.email]
        .some(value => value.toLowerCase().includes(query));
      return matchesQuery && (!role || user.role === role) && (!status || user.status === status);
    });

    if (!filteredUsers.length) {
      tbody.innerHTML = '<tr><td class="px-5 py-12 text-center text-sm text-[#69736c]" colspan="8">Tidak ada pengguna yang cocok.</td></tr>';
    } else {
      tbody.innerHTML = filteredUsers.map(user => {
        const safeId = escapeHtml(user.id);
        const safeName = escapeHtml(user.name);
        const safeUsername = escapeHtml(user.username);
        const safeEmail = escapeHtml(user.email);
        const safeKey = escapeHtml(user.apiKey);
        const roleClasses = user.role === 'admin'
          ? 'bg-[#edf1e9] text-[#355744]'
          : user.role === 'reseller'
            ? 'bg-[#fbf2df] text-[#946019]'
            : 'bg-[#f1f3f0] text-[#59645d]';
        const statusClasses = user.status === 'active'
          ? 'bg-[#e8f3ec] text-[#34724b]'
          : 'bg-[#f1f3f0] text-[#69736c]';

        return `<tr class="transition hover:bg-[#fafbf9]">
          <td class="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#8a938d]">${safeId}</td>
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-white" style="background-color:${user.color}">${escapeHtml(initials(user.name))}</span>
              <span class="whitespace-nowrap font-semibold text-[#18231e]">${safeName}</span>
            </div>
          </td>
          <td class="whitespace-nowrap px-5 py-4 text-[#69736c]">@${safeUsername}</td>
          <td class="whitespace-nowrap px-5 py-4 text-[#69736c]">${safeEmail}</td>
          <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleClasses}">${escapeHtml(user.role)}</span></td>
          <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}">${user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
          <td class="px-5 py-4">
            <div class="flex items-center gap-1.5">
              <span class="max-w-28 truncate font-mono text-xs text-[#69736c]" title="${safeKey}">${safeKey}</span>
              <button class="rounded-md p-1.5 text-[#8a938d] transition hover:bg-[#edf1e9] hover:text-[#355744]" type="button" data-action="copy" data-user-id="${safeId}" aria-label="Salin API key ${safeId}" title="Salin API key">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <button class="rounded-md p-1.5 text-[#8a938d] transition hover:bg-[#edf1e9] hover:text-[#355744]" type="button" data-action="regenerate" data-user-id="${safeId}" aria-label="Buat ulang API key ${safeId}" title="Buat ulang API key">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 7h-5V2"/><path d="M4 17h5v5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 9M4 15l2.8 2a7 7 0 0 0 11.6-2"/></svg>
              </button>
            </div>
          </td>
          <td class="px-5 py-4">
            <div class="flex items-center gap-2">
              <button class="rounded-lg border border-[#dce4dc] px-2.5 py-1.5 text-xs font-semibold text-[#355744] transition hover:bg-[#edf1e9]" type="button" data-action="edit" data-user-id="${safeId}">Ubah</button>
              <button class="rounded-lg border border-[#efd5d0] px-2.5 py-1.5 text-xs font-semibold text-[#a43f32] transition hover:bg-[#fbefec]" type="button" data-action="delete" data-user-id="${safeId}">Hapus</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    document.getElementById('showing-label').textContent =
      `Menampilkan ${filteredUsers.length} dari ${users.length} pengguna`;
    updateStats();
  }

  function openFormModal(user = null) {
    editId = user ? user.id : null;
    modalTitle.textContent = user ? 'Ubah pengguna' : 'Tambah pengguna';
    formSaveBtn.textContent = user ? 'Simpan perubahan' : 'Simpan pengguna';
    fName.value = user ? user.name : '';
    fUsername.value = user ? user.username : '';
    fEmail.value = user ? user.email : '';
    fRole.value = user ? user.role : 'member';
    fStatus.value = user ? user.status : 'active';
    formModal.classList.remove('hidden');
    fName.focus();
  }

  function closeFormModal() {
    formModal.classList.add('hidden');
  }

  function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    deleteTargetId = null;
  }

  document.getElementById('add-user-btn').addEventListener('click', () => openFormModal());
  document.getElementById('form-modal-close').addEventListener('click', closeFormModal);
  document.getElementById('form-cancel-btn').addEventListener('click', closeFormModal);
  formModal.addEventListener('click', event => {
    if (event.target === formModal) closeFormModal();
  });

  formSaveBtn.addEventListener('click', () => {
    const name = fName.value.trim();
    const username = fUsername.value.trim();
    const email = fEmail.value.trim();
    if (!name || !username || !email) {
      showToast('Lengkapi nama, username, dan email terlebih dahulu.', 'danger');
      return;
    }

    if (editId) {
      const user = users.find(item => item.id === editId);
      if (!user) {
        showToast('Pengguna tidak ditemukan. Muat ulang halaman dan coba lagi.', 'danger');
        return;
      }
      Object.assign(user, { name, username, email, role: fRole.value, status: fStatus.value });
      showToast('Data pengguna berhasil diperbarui.');
    } else {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      users.push({
        id: `USR${String(nextId).padStart(3, '0')}`,
        name,
        username,
        email,
        role: fRole.value,
        status: fStatus.value,
        apiKey: genKey(),
        color,
      });
      nextId += 1;
      showToast('Pengguna berhasil ditambahkan.');
    }
    closeFormModal();
    render();
  });

  document.getElementById('delete-cancel-btn').addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', event => {
    if (event.target === deleteModal) closeDeleteModal();
  });
  document.getElementById('delete-confirm-btn').addEventListener('click', () => {
    if (!deleteTargetId) return;
    users.splice(0, users.length, ...users.filter(user => user.id !== deleteTargetId));
    closeDeleteModal();
    render();
    showToast('Pengguna berhasil dihapus.');
  });

  tbody.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const user = users.find(item => item.id === button.dataset.userId);
    if (!user) return;

    if (button.dataset.action === 'edit') {
      openFormModal(user);
    } else if (button.dataset.action === 'delete') {
      deleteTargetId = user.id;
      document.getElementById('delete-modal-desc').textContent =
        `Pengguna "${user.name}" akan dihapus secara permanen.`;
      deleteModal.classList.remove('hidden');
    } else if (button.dataset.action === 'regenerate') {
      user.apiKey = genKey();
      render();
      showToast('API key berhasil dibuat ulang.');
    } else if (button.dataset.action === 'copy') {
      try {
        await navigator.clipboard.writeText(user.apiKey);
        showToast('API key berhasil disalin.');
      } catch {
        showToast('Tidak dapat menyalin API key. Periksa izin clipboard browser.', 'danger');
      }
    }
  });

  document.getElementById('search-input').addEventListener('input', render);
  document.getElementById('role-filter').addEventListener('change', render);
  document.getElementById('status-filter').addEventListener('change', render);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!deleteModal.classList.contains('hidden')) closeDeleteModal();
    else if (!formModal.classList.contains('hidden')) closeFormModal();
  });

  render();
}
