/**
 * ӘДЕБИЕТ ТАНЫТҚЫШ: 100 ЖЫЛ (1926 - 2026)
 * Жоба: нурболат69
 * Толыққанды мультимедиалық жүйе, «Аққұм» күйінің синтезаторы,
 * Төменгі Sticky ойнатқыш, 3D свитчер және интерактивтер.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalAudioSystem();
  initConceptSwitcher();
  initGalleryLightbox();
  initVideoModal();
  initManuscriptLightbox();
  initSearch();
  initQuantumBridge();
  initEraSlider();
  initGenrePassports();
  initResearchCharts();
  initContentClassifierQuiz();
  initToggleViewTable();
  initPdfExport();
  initAuezeInlinePlayer();
});

/* ==========================================================================
   1. «АҚҚҰМ» КҮЙІ ЖӘНЕ ТОЛЫҚҚАНДЫ МУЛЬТИМЕДИА ОЙНАТҚЫШЫ
   ========================================================================== */

const PLAYLIST_DATA = [
  {
    id: 1,
    title: "«Аққұм» күйі (Төгілме домбыра)",
    artist: "Дәстүрлі мұра • Құрманғазы / Дина тағылымы",
    duration: 195, // 03:15
    durationStr: "03:15",
    type: "kuy",
    cover: "assets/images/ahmet_1926_study.jpg",
    tempo: 160
  },
  {
    id: 2,
    title: "Әуезе: Көшпелілердің суреттік әңгімесі",
    artist: "Аудио-баяндау • Тысқарғы ғалам сыры",
    duration: 240, // 04:00
    durationStr: "04:00",
    type: "narration",
    cover: "assets/images/ancient_manuscript.jpg",
    tempo: 90
  },
  {
    id: 3,
    title: "Толғау: Ішкергі ғаламның күйі",
    artist: "Философиялық толғаныс • Абай мен Ахмет",
    duration: 215, // 03:35
    durationStr: "03:35",
    type: "philosophy",
    cover: "assets/images/ahmet_1926_study.jpg",
    tempo: 75
  },
  {
    id: 4,
    title: "Айтыс: Сөз сайысы мен сөз майданы",
    artist: "Суырыпсалма өнер • Балуандық сөз қағысы",
    duration: 180, // 03:00
    durationStr: "03:00",
    type: "battle",
    cover: "assets/images/kazakh_vlog_village.jpg",
    tempo: 130
  },
  {
    id: 5,
    title: "Ахмет тағылымы: 100 жылдық сабақтастық",
    artist: "Ғылыми подкаст • 1926 — 2026",
    duration: 320, // 05:20
    durationStr: "05:20",
    type: "podcast",
    cover: "assets/images/media_2026_creator.jpg",
    tempo: 85
  }
];

class KazakhDombraSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.noteTimer = null;
    this.noteIndex = 0;
    this.currentTrack = null;

    // «Аққұм» күйінің негізгі дәстүрлі домбыра қағыстарының ноталық тізбегі (D3, G3, A3, C4, D4, E4, G4)
    this.akkumMelody = [
      { f: 146.83, dur: 0.18, vol: 0.9 }, // D3
      { f: 196.00, dur: 0.18, vol: 0.95 }, // G3
      { f: 220.00, dur: 0.18, vol: 0.85 }, // A3
      { f: 293.66, dur: 0.36, vol: 1.0 }, // D4
      { f: 293.66, dur: 0.18, vol: 0.9 }, // D4 қағыс
      { f: 261.63, dur: 0.18, vol: 0.8 }, // C4
      { f: 220.00, dur: 0.18, vol: 0.85 }, // A3
      { f: 196.00, dur: 0.36, vol: 0.95 }, // G3
      { f: 220.00, dur: 0.18, vol: 0.85 }, // A3
      { f: 293.66, dur: 0.18, vol: 0.95 }, // D4
      { f: 329.63, dur: 0.36, vol: 1.0 }, // E4
      { f: 392.00, dur: 0.36, vol: 1.0 }, // G4 (күйдің шарықтау шегі)
      { f: 329.63, dur: 0.18, vol: 0.9 }, // E4
      { f: 293.66, dur: 0.36, vol: 0.95 }, // D4
      { f: 220.00, dur: 0.18, vol: 0.85 }, // A3
      { f: 196.00, dur: 0.54, vol: 0.9 }  // G3 тоқтау
    ];

    // Баяндау және подкасттарға арналған жұмсақ ambient пен лирикалық саз
    this.ambientMelody = [
      { f: 196.00, dur: 0.7, vol: 0.4 },
      { f: 220.00, dur: 0.7, vol: 0.45 },
      { f: 261.63, dur: 0.9, vol: 0.5 },
      { f: 293.66, dur: 1.2, vol: 0.55 },
      { f: 220.00, dur: 0.8, vol: 0.45 },
      { f: 196.00, dur: 1.5, vol: 0.4 }
    ];
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  // Домбыраның ішекті үнін (Pluck string) жасау
  pluckDombra(freq, duration = 0.25, intensity = 0.8) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Негізгі тербеліс
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, now); // Сәл хорус эффектісі

    // Домбыра шанағының резонанстық сүзгісі
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.9, now + duration);

    // Ішекті іліп қағу (Attack & Exponential Decay)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35 * intensity, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.4);
    osc2.stop(now + duration + 0.4);
  }

  start(track) {
    this.initContext();
    this.currentTrack = track;
    this.isPlaying = true;
    this.noteIndex = 0;
    this.scheduleNextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.noteTimer) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
  }

  scheduleNextNote() {
    if (!this.isPlaying) return;

    const melody = (this.currentTrack && this.currentTrack.type === 'kuy') 
      ? this.akkumMelody 
      : this.ambientMelody;

    const note = melody[this.noteIndex % melody.length];
    this.pluckDombra(note.f, note.dur, note.vol);

    this.noteIndex++;
    const intervalMs = note.dur * 1000;
    this.noteTimer = setTimeout(() => this.scheduleNextNote(), intervalMs);
  }
}

// Жаһандық ойнатқышты басқару
function initGlobalAudioSystem() {
  const synth = new KazakhDombraSynthesizer();
  let currentTrackIdx = 1; // Әуезе бетінде бірден «Әуезе» аудио баяндауы тұрады
  let isPlaying = false;
  let currentTimeSec = 0;
  let timerInterval = null;
  let hasUserInteracted = false;

  // DOM элементтері (Ойнатқыш тек Әуезе бетінде ғана орналасады)
  const playerContainer = document.getElementById('auezeStandalonePlayer') || document.getElementById('floatingAudioPlayer');
  const playBtn = document.getElementById('floatingPlayBtn');
  const headerSoundBtn = document.getElementById('headerSoundBtn');

  // Егер ағымдағы бетте ойнатқыш жоқ болса (тек Әуезеде болуы тиіс)
  if (!playerContainer || !playBtn) {
    if (headerSoundBtn) {
      headerSoundBtn.addEventListener('click', () => {
        window.location.href = 'aueze.html#auezeStandalonePlayer';
      });
    }
    return;
  }

  const prevBtn = document.getElementById('floatingPrevBtn');
  const nextBtn = document.getElementById('floatingNextBtn');
  const trackTitle = document.getElementById('playerTrackTitle');
  const trackArtist = document.getElementById('playerTrackArtist');
  const trackCover = document.getElementById('playerTrackCover');
  const timeCurrent = document.getElementById('playerTimeCurrent');
  const timeTotal = document.getElementById('playerTimeTotal');
  const progressFill = document.getElementById('playerProgressFill');
  const progressTrack = document.getElementById('playerProgressTrack');
  const volumeSlider = document.getElementById('playerVolumeSlider');
  const muteBtn = document.getElementById('playerMuteBtn');
  const collapseBtn = document.getElementById('togglePlayerCollapse');
  const playlistBtn = document.getElementById('togglePlaylistDrawer');
  const playlistDrawer = document.getElementById('playerPlaylistDrawer');
  const playlistItemsList = document.getElementById('playlistItemsList');
  const playIcon = document.getElementById('floatingIconPlay');
  const pauseIcon = document.getElementById('floatingIconPause');

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Плейлист тізімін толтыру
  if (playlistItemsList) {
    playlistItemsList.innerHTML = PLAYLIST_DATA.map((t, idx) => `
      <li class="playlist-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <div class="playlist-item-meta">
          <span class="playlist-item-num">${(idx + 1).toString().padStart(2, '0')}</span>
          <div>
            <div style="font-weight: 800;">${t.title}</div>
            <div style="font-size: 0.72rem; color: #94A3B8;">${t.artist}</div>
          </div>
        </div>
        <span class="playlist-item-duration">${t.durationStr}</span>
      </li>
    `).join('');

    playlistItemsList.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        selectTrack(idx);
        startPlay();
      });
    });
  }

  function updateTrackUI() {
    const track = PLAYLIST_DATA[currentTrackIdx];
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (trackCover) trackCover.src = track.cover;
    if (timeTotal) timeTotal.textContent = track.durationStr;
    if (timeCurrent) timeCurrent.textContent = formatTime(currentTimeSec);

    // Плейлисттегі белсенді қатар
    if (playlistItemsList) {
      playlistItemsList.querySelectorAll('.playlist-item').forEach((el, i) => {
        el.classList.toggle('active', i === currentTrackIdx);
      });
    }
  }

  function startPlay() {
    synth.initContext();
    synth.start(PLAYLIST_DATA[currentTrackIdx]);
    isPlaying = true;

    if (playerContainer) playerContainer.classList.add('is-playing');
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (headerSoundBtn) headerSoundBtn.classList.add('playing');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      currentTimeSec++;
      const currentTrack = PLAYLIST_DATA[currentTrackIdx];
      if (currentTimeSec >= currentTrack.duration) {
        nextTrack();
      } else {
        if (timeCurrent) timeCurrent.textContent = formatTime(currentTimeSec);
        if (progressFill) {
          const pct = (currentTimeSec / currentTrack.duration) * 100;
          progressFill.style.width = `${pct}%`;
        }
      }
    }, 1000);
  }

  function pausePlay() {
    synth.stop();
    isPlaying = false;
    clearInterval(timerInterval);

    if (playerContainer) playerContainer.classList.remove('is-playing');
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (headerSoundBtn) headerSoundBtn.classList.remove('playing');
  }

  function togglePlay() {
    if (isPlaying) {
      pausePlay();
    } else {
      startPlay();
    }
  }

  function selectTrack(idx) {
    currentTrackIdx = (idx + PLAYLIST_DATA.length) % PLAYLIST_DATA.length;
    currentTimeSec = 0;
    if (progressFill) progressFill.style.width = '0%';
    updateTrackUI();
    if (isPlaying) {
      synth.stop();
      synth.start(PLAYLIST_DATA[currentTrackIdx]);
    }
  }

  function nextTrack() {
    selectTrack(currentTrackIdx + 1);
    if (isPlaying) startPlay();
  }

  function prevTrack() {
    selectTrack(currentTrackIdx - 1);
    if (isPlaying) startPlay();
  }

  // Прогресс-барды шерту (Scrubber)
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const ratio = Math.max(0, Math.min(1, clickX / width));
      const currentTrack = PLAYLIST_DATA[currentTrackIdx];
      currentTimeSec = Math.floor(ratio * currentTrack.duration);
      if (progressFill) progressFill.style.width = `${ratio * 100}%`;
      if (timeCurrent) timeCurrent.textContent = formatTime(currentTimeSec);
    });
  }

  // Батырмалар оқиғалары
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);

  // Хедердегі дыбыс батырмасы
  if (headerSoundBtn) {
    headerSoundBtn.addEventListener('click', () => {
      togglePlay();
      if (playerContainer && playerContainer.classList.contains('is-collapsed')) {
        playerContainer.classList.remove('is-collapsed');
      }
    });
  }

  // Громкость реттеу
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      synth.setVolume(val);
    });
  }

  let isMuted = false;
  let prevVolume = 0.5;
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (isMuted) {
        if (volumeSlider) {
          prevVolume = parseFloat(volumeSlider.value);
          volumeSlider.value = 0;
        }
        synth.setVolume(0);
        muteBtn.style.opacity = '0.5';
      } else {
        if (volumeSlider) volumeSlider.value = prevVolume;
        synth.setVolume(prevVolume);
        muteBtn.style.opacity = '1';
      }
    });
  }

  // Ойнатқышты жинау / жаю (Collapse / Expand)
  if (collapseBtn && playerContainer) {
    collapseBtn.addEventListener('click', () => {
      const isCollapsed = playerContainer.classList.toggle('is-collapsed');
      collapseBtn.innerHTML = isCollapsed 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg> Жаю`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg> Жинау`;
    });
  }

  // Плейлист тартпасы (Playlist Drawer)
  if (playlistBtn && playlistDrawer) {
    playlistBtn.addEventListener('click', () => {
      playlistDrawer.classList.toggle('is-open');
    });
  }

  // Бастапқы күйді орнату
  updateTrackUI();
  window.appAudioController = {
    togglePlay,
    startPlay,
    pausePlay,
    selectTrack,
    getIsPlaying: () => isPlaying
  };
}

/* ==========================================================================
   2. 3D ИНТЕРАКТИВТІ СВИТЧЕР: ӘУЕЗЕ • ТОЛҒАУ • АЙТЫС
   ========================================================================== */
function initConceptSwitcher() {
  const tabBtns = document.querySelectorAll('.concept-tab-btn');
  const panels = document.querySelectorAll('.concept-panel');

  if (!tabBtns.length || !panels.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. МЕДИА ГАЛЕРЕЯСЫ ЖӘНЕ ЛАЙТБОКС (LIGHTBOX)
   ========================================================================== */
function initGalleryLightbox() {
  const galleryCards = document.querySelectorAll('.gallery-card');
  const modal = document.getElementById('galleryLightboxModal');
  const modalImg = document.getElementById('lightboxModalImg');
  const modalTitle = document.getElementById('lightboxModalTitle');
  const modalDesc = document.getElementById('lightboxModalDesc');
  const closeBtn = document.getElementById('galleryLightboxClose');

  if (!galleryCards.length || !modal) return;

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.getAttribute('data-title') || '';
      const desc = card.getAttribute('data-desc') || '';

      if (img && modalImg) modalImg.src = img.src;
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;

      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

/* ==========================================================================
   4. ЗАМАНАУИ ВЛОГ МОДАЛЬДІ БЕЙНЕ ОЙНАТҚЫШЫ
   ========================================================================== */
function initVideoModal() {
  const vlogTrigger = document.getElementById('vlogPlayerTrigger');
  const modal = document.getElementById('videoModalOverlay');
  const closeBtn = document.getElementById('videoModalClose');

  if (!vlogTrigger || !modal) return;

  vlogTrigger.addEventListener('click', () => {
    modal.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

/* ==========================================================================
   5. КӨНЕ ҚОЛЖАЗБА ЛАЙТБОКСЫ (1926 ӘДЕБИЕТ ТАНЫТҚЫШ МӘТІНІ)
   ========================================================================== */
function initManuscriptLightbox() {
  const trigger = document.getElementById('manuscriptTrigger');
  const modal = document.getElementById('manuscriptModalOverlay');
  const closeBtn = document.getElementById('manuscriptModalClose');

  if (!trigger || !modal) return;

  trigger.addEventListener('click', () => {
    modal.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

/* ==========================================================================
   6. ІЗДЕУ ЖҮЙЕСІ (SEARCH MODAL)
   ========================================================================== */
const SITE_DATABASE = [
  { title: "Әуезе (Тысқарғы ғалам баяндауы)", page: "aueze.html", desc: "Ахмет Байтұрсынұлы: Әуезе тысқы ғалам турасындағы сөз. Көшпелілер әуезесі мен заманауи влог." },
  { title: "Толғау (Ішкергі ғалам күйі)", page: "tolgau.html", desc: "Ахмет Байтұрсынұлы: Толғау ішкергі ғаламнан алынады. Адам санасы фотоаппарат емес, жанның күйі." },
  { title: "Айтыс (Сөз сайысы мен күрес)", page: "aitys.html", desc: "Ахмет Байтұрсынұлы: Айтысқанда екі балуандай бірін-бірі аңдиды. Алаң алданышы және заманауи сайыс." },
  { title: "Таймлайн: 1926 — 2026", page: "timeline.html", desc: "«Әдебиет танытқыштың» 100 жылдық даму хронологиясы мен басты тарихи белестері." },
  { title: "Ахметтің ізімен", page: "izimen.html", desc: "Ұлт ұстазының ғылыми терминологиясы, Төте жазу әліпбиі және Алаш аманаты." },
  { title: "«Аққұм» күйі", page: "index.html", desc: "Қазақтың төгілме домбыра мұрасы, дәстүрлі саз бен күй өнері." }
];

function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchBtn = document.getElementById('globalSearchBtn');
  const modal = document.getElementById('searchModalOverlay');
  const closeBtn = document.getElementById('searchModalClose');
  const queryField = document.getElementById('modalSearchField');
  const resultsContainer = document.getElementById('searchResultsList');

  if (!searchInput || !modal) return;

  function openSearch(query = '') {
    modal.classList.add('active');
    if (queryField) {
      queryField.value = query;
      queryField.focus();
      renderResults(query);
    }
  }

  function renderResults(query) {
    if (!resultsContainer) return;
    const cleanQuery = query.toLowerCase().trim();
    const filtered = cleanQuery 
      ? SITE_DATABASE.filter(item => item.title.toLowerCase().includes(cleanQuery) || item.desc.toLowerCase().includes(cleanQuery))
      : SITE_DATABASE;

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #94A3B8;">
          «${query}» бойынша ештеңе табылмады. Басқа сөз жазып көріңіз.
        </div>`;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <a href="${item.page}" class="search-result-row" style="display: block; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); text-decoration: none; transition: background 0.2s;">
        <div style="font-weight: 800; font-size: 0.98rem; color: #38BDF8; margin-bottom: 4px;">${item.title}</div>
        <div style="font-size: 0.84rem; color: #CBD5E1; line-height: 1.4;">${item.desc}</div>
      </a>
    `).join('');
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') openSearch(searchInput.value);
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', () => openSearch(searchInput.value));
  }

  if (queryField) {
    queryField.addEventListener('input', () => renderResults(queryField.value));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

/* ==========================================================================
   7. ОРТАЛЫҚ КВАНТТЫҚ КӨПІР
   ========================================================================== */
function initQuantumBridge() {
  const bridge = document.getElementById('centerBridgeBadge');
  const prevBtn = document.getElementById('bridgePrevBtn');
  const nextBtn = document.getElementById('bridgeNextBtn');

  if (!bridge) return;

  function scrollToSection(targetId) {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollToSection('cardHistorical');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollToSection('cardDigital');
    });
  }

  bridge.addEventListener('click', () => {
    scrollToSection('conceptSwitcherSection');
  });
}

/* ==========================================================================
   8. УАҚЫТ МАШИНАСЫ (1926 ↔ 2026 TIME MACHINE SLIDER & MORPHING)
   ========================================================================== */
function initEraSlider() {
  const slider = document.getElementById('eraRangeSlider');
  const heroSection = document.getElementById('heroSplitSection');
  const statusIndicator = document.getElementById('eraStatusIndicator');
  const presetBtns = document.querySelectorAll('.era-preset-btn');
  const left1926 = document.getElementById('left1926Node');
  const right2026 = document.getElementById('right2026Node');

  if (!slider || !heroSection) return;

  function updateEraState(val) {
    slider.value = val;
    presetBtns.forEach(btn => btn.classList.remove('active'));

    if (val <= 35) {
      heroSection.className = 'hero-split-section mode-1926';
      if (statusIndicator) {
        statusIndicator.innerHTML = `📜 <strong>1926 ДӘУІРІ:</strong> ДӘСТҮРЛІ МҰРА ЖӘНЕ АХМЕТ ТЕОРИЯСЫ (ТАШКЕНТ) — ${100 - val}%`;
      }
      const p1926 = document.querySelector('.era-preset-btn[data-value="0"]');
      if (p1926) p1926.classList.add('active');
    } else if (val >= 65) {
      heroSection.className = 'hero-split-section mode-2026';
      if (statusIndicator) {
        statusIndicator.innerHTML = `🚀 <strong>2026 ДӘУІРІ:</strong> ЗАМАНАУИ МЕДИА, САНДЫҚ ВЛОГ ЖӘНЕ ПОДКАСТТАР — ${val}%`;
      }
      const p2026 = document.querySelector('.era-preset-btn[data-value="100"]');
      if (p2026) p2026.classList.add('active');
    } else {
      heroSection.className = 'hero-split-section mode-balanced';
      if (statusIndicator) {
        statusIndicator.innerHTML = `⚡ <strong>100 ЖЫЛДЫҚ ТОҒЫСУ:</strong> ТЕКСТЕР МЕН САНДЫҚ МҮМКІНДІКТЕРДІҢ 50/50 ҮЙЛЕСІМІ`;
      }
      const pBal = document.querySelector('.era-preset-btn[data-value="50"]');
      if (pBal) pBal.classList.add('active');
    }
  }

  slider.addEventListener('input', (e) => {
    updateEraState(parseInt(e.target.value, 10));
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetVal = parseInt(btn.getAttribute('data-value'), 10);
      updateEraState(targetVal);
    });
  });

  if (left1926) {
    left1926.style.cursor = 'pointer';
    left1926.addEventListener('click', () => updateEraState(0));
  }

  if (right2026) {
    right2026.style.cursor = 'pointer';
    right2026.addEventListener('click', () => updateEraState(100));
  }

  // Бастапқы теңгерім күйі
  updateEraState(50);
}

/* ==========================================================================
   9. ИНТЕРАКТИВТІ «ПАСПОРТ ЖАНРОВ» (ACCORDION & EXPAND)
   ========================================================================== */
function initGenrePassports() {
  const cards = document.querySelectorAll('.passport-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const headBar = card.querySelector('.passport-header-bar');
    if (headBar) {
      headBar.addEventListener('click', () => {
        card.classList.toggle('open');
      });
    }
  });
}

/* ==========================================================================
   10. ЗЕРТТЕУ НӘТИЖЕЛЕРІ ДИАГРАММАЛАРЫ (CHARTS ANIMATION)
   ========================================================================== */
function initResearchCharts() {
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach(bar => {
          const targetW = bar.getAttribute('data-width');
          if (targetW) bar.style.width = targetW;
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const section = document.getElementById('researchSection');
  if (section) observer.observe(section);
}

/* ==========================================================================
   11. ИНТЕРАКТИВТІ КОНТЕНТ КЛАССИФИКАТОРЫ (QUIZ ENGINE)
   ========================================================================== */
const QUIZ_DATA = [
  {
    step: "1-СҰРАҚ (3-ТЕН)",
    question: "Сіздің медиа контентіңіз нені көбірек суреттейді немесе зерттейді?",
    options: [
      { letter: "А", text: "Сыртқы ғаламды: адамдардың өмірі, саяхат, мекендер мен нақты оқиғалар желісі", genre: "aueze" },
      { letter: "Б", text: "Ішкі ғаламды: ақыл мен қиял, адам көңілінің тебіренісі мен философиялық терең ойлар", genre: "tolgau" },
      { letter: "В", text: "Қоғамдық кемшіліктерді түзету, екі жақтың өткір пікірталасы мен сөз сайысы", genre: "aitys" }
    ]
  },
  {
    step: "2-СҰРАҚ (3-ТЕН)",
    question: "Контентті жасаудағы басты авторлық позицияңыз қандай?",
    options: [
      { letter: "А", text: "Оқиғаның сыртынан қарап, басынан кешкендей емес, біреуден естігендей көріктеп жеткізу", genre: "aueze" },
      { letter: "Б", text: "Жүректің лебін ақтарып, тыңдаушымен жеке рухани сырласу, ойға батыру", genre: "tolgau" },
      { letter: "В", text: "Екі балуандай сөзбен күресу, тапқыр риторикамен қарсыластың уәжін қағып алу", genre: "aitys" }
    ]
  },
  {
    step: "3-СҰРАҚ (3-ТЕН)",
    question: "Қандай заманауи сандық формат сіздің стиліңізге ең жақын?",
    options: [
      { letter: "А", text: "YouTube Travel-влог, 4K деректі видео, көріністік сторителлинг", genre: "aueze" },
      { letter: "Б", text: "Spotify / Apple Podcasts аудио-эссесі, авторлық сұхбат, үнтаспа монологы", genre: "tolgau" },
      { letter: "В", text: "Тікелей эфир дебаттары, рэп-баттл, TikTok / X желісіндегі пікірталастар", genre: "aitys" }
    ]
  }
];

function initContentClassifierQuiz() {
  const quizBox = document.getElementById('quizDynamicStage');
  if (!quizBox) return;

  let currentStep = 0;
  const userAnswers = [];

  function renderStep(idx) {
    if (idx >= QUIZ_DATA.length) {
      renderResult();
      return;
    }

    const data = QUIZ_DATA[idx];
    quizBox.innerHTML = `
      <div class="quiz-step-indicator">
        <span class="quiz-step-title">${data.step}</span>
        <span style="font-size: 0.82rem; color: #94A3B8; font-weight: 700;">Кезең: ${idx + 1} / 3</span>
      </div>
      <h3 class="quiz-question-heading">${data.question}</h3>
      <div class="quiz-options-group">
        ${data.options.map((opt) => `
          <button class="quiz-opt-btn ${userAnswers[idx] === opt.genre ? 'selected' : ''}" data-genre="${opt.genre}">
            <span class="quiz-opt-letter">${opt.letter}</span>
            <span style="font-size: 0.95rem; line-height: 1.45;">${opt.text}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-nav-row">
        ${idx > 0 
          ? `<button class="quiz-action-btn btn-secondary" id="quizPrevBtn">← Артқа</button>` 
          : `<div></div>`}
        <button class="quiz-action-btn btn-primary" id="quizNextBtn" ${!userAnswers[idx] ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          ${idx === QUIZ_DATA.length - 1 ? 'Нәтижені көру 🎯' : 'Келесі сұрақ →'}
        </button>
      </div>
    `;

    quizBox.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const genre = btn.getAttribute('data-genre');
        userAnswers[idx] = genre;
        renderStep(idx);
      });
    });

    const prevBtn = document.getElementById('quizPrevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          renderStep(currentStep);
        }
      });
    }

    const nextBtn = document.getElementById('quizNextBtn');
    if (nextBtn && userAnswers[idx]) {
      nextBtn.addEventListener('click', () => {
        currentStep++;
        renderStep(currentStep);
      });
    }
  }

  function renderResult() {
    const counts = { aueze: 0, tolgau: 0, aitys: 0 };
    userAnswers.forEach(g => {
      if (counts[g] !== undefined) counts[g]++;
    });

    let winningGenre = 'tolgau';
    if (counts.aueze >= counts.tolgau && counts.aueze >= counts.aitys) {
      winningGenre = 'aueze';
    } else if (counts.aitys >= counts.tolgau && counts.aitys >= counts.aueze) {
      winningGenre = 'aitys';
    }

    let title = "";
    let quote = "";
    let desc = "";
    let link = "";
    let colorTheme = "";

    if (winningGenre === 'aueze') {
      title = "ӘУЕЗЕ • САНДЫҚ ВЛОГ / СТОРИТЕЛЛИНГ";
      quote = "«Әуезелеуші айтатын сөзіне өзін қатыстырмай, өзінен тысқары ғаламда болған істі әңгіме қылады...»";
      desc = "Сіздің шығармашылық қуатыңыз — сыртқы дүние оқиғаларын дәл, көрікті әрі әсерлі бейнелеуде. YouTube travel-влогтары, деректі шолулар мен саяхат хроникалары сіздің дарыныңызды толық ашады!";
      link = "aueze.html";
      colorTheme = "#F59E0B";
    } else if (winningGenre === 'aitys') {
      title = "АЙТЫС • ДЕБАТ / РЭП-БАТТЛ / ДРАМА";
      quote = "«Айтысқанда екі күрескен балуандар сияқты бірін-бірі аңдиды, әдіс қолданады...»";
      desc = "Сіздің басты қаруыңыз — өткір сөз, логикалық тапқырлық және қоғамдағы өзекті кемшіліктерді ашып көрсету. Тікелей эфирлердегі пікірталас пен интеллектуалды баттлдарда сізге тең келер ешкім жоқ!";
      link = "aitys.html";
      colorTheme = "#F43F5E";
    } else {
      title = "ТОЛҒАУ • АВТОРЛЫҚ ПОДКАСТ / АУДИО-ЭССЕ";
      quote = "«Толғанғанда айтатын нәрсесін толғаушы тысқарғы ғаламнан алмай, ішкергі ғаламнан алады...»";
      desc = "Сіздің мінезіңіз терең ойға, жүрек тебіренісіне және тыңдарманмен рухани үндестік орнатуға құрылған. Жеке авторлық подкаст, үнтаспа және интеллектуалды аудио-монолог — сіздің табиғи кеңістігіңіз!";
      link = "tolgau.html";
      colorTheme = "#38BDF8";
    }

    quizBox.innerHTML = `
      <div class="quiz-result-view">
        <span class="result-celebrate-badge">🎯 ДИАГНОСТИКА ҚОРЫТЫНДЫСЫ</span>
        <h3 class="result-genre-title" style="color: ${colorTheme};">${title}</h3>
        <div class="result-genre-sub">1926 — 2026 Сабақтастығы бойынша анықталды</div>

        <div class="result-desc-box">
          <div style="font-size: 0.95rem; font-style: italic; color: #FCD34D; margin-bottom: 12px; border-left: 3px solid ${colorTheme}; padding-left: 12px;">
            ${quote} <br><strong style="font-size: 0.8rem; color: #94A3B8;">— Ахмет Байтұрсынұлы, «Әдебиет танытқыш»</strong>
          </div>
          <p style="color: #E2E8F0; font-size: 0.96rem; line-height: 1.6;">${desc}</p>
        </div>

        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="${link}" class="quiz-action-btn btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
            Жанрды терең зерттеу →
          </a>
          <button class="quiz-action-btn btn-secondary" id="quizResetBtn">
            Тестті қайта тапсыру ↻
          </button>
        </div>
      </div>
    `;

    const resetBtn = document.getElementById('quizResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentStep = 0;
        userAnswers.length = 0;
        renderStep(0);
      });
    }
  }

  // Start quiz
  renderStep(0);
}

/* ==========================================================================
   12. САЛЫСТЫРМАЛЫ ТАБЛИЦА (TOGGLE VIEW: 1926 ↔ 2026)
   ========================================================================== */
function initToggleViewTable() {
  const table = document.getElementById('modernCompareTable');
  const btnBoth = document.getElementById('btnViewBoth');
  const btn1926 = document.getElementById('btnView1926');
  const btn2026 = document.getElementById('btnView2026');

  if (!table) return;

  function setView(filterClass, activeBtn) {
    table.classList.remove('filter-1926', 'filter-2026');
    if (filterClass) table.classList.add(filterClass);

    [btnBoth, btn1926, btn2026].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  if (btnBoth) btnBoth.addEventListener('click', () => setView('', btnBoth));
  if (btn1926) btn1926.addEventListener('click', () => setView('filter-1926', btn1926));
  if (btn2026) btn2026.addEventListener('click', () => setView('filter-2026', btn2026));
}

/* ==========================================================================
   13. PDF ЭКСПОРТ (PRINT DIALOG TRIGGER)
   ========================================================================== */
function initPdfExport() {
  const btn = document.getElementById('btnPdfDownload');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }
}

/* ==========================================================================
   14. ӘУЕЗЕ БЕТІНДЕГІ ИНЛАЙН ОЙНАТҚЫШ (AUEZE INLINE SHOWCASE)
   ========================================================================== */
function initAuezeInlinePlayer() {
  const inlinePlayBtn = document.getElementById('auezeInlinePlayBtn');
  const inlinePlayIcon = document.getElementById('auezeInlineIconPlay');
  const inlinePauseIcon = document.getElementById('auezeInlineIconPause');

  if (!inlinePlayBtn) return;

  inlinePlayBtn.addEventListener('click', () => {
    if (window.appAudioController) {
      if (!window.appAudioController.getIsPlaying()) {
        window.appAudioController.selectTrack(1); // Track 2: Әуезе
        window.appAudioController.startPlay();
      } else {
        window.appAudioController.togglePlay();
      }
    }
  });

  // Keep icon in sync
  setInterval(() => {
    if (window.appAudioController && inlinePlayIcon && inlinePauseIcon) {
      const playing = window.appAudioController.getIsPlaying();
      inlinePlayIcon.style.display = playing ? 'none' : 'block';
      inlinePauseIcon.style.display = playing ? 'block' : 'none';
    }
  }, 300);
}
