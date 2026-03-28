/**
 * Genç Meclis Simülasyonu — çok sayfalı site, vanilla JS
 * data-page: home | about | team | commissions | gallery | program | contact
 */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const page = document.body.dataset.page || 'home';

  const loader = $('#page-loader');
  const body = document.body;

  /* ---------- Loader ---------- */
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-hidden');
    body.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 900);
  }

  body.classList.add('is-loading');

  /* ---------- Mobil menü + backdrop ---------- */
  const header = $('#site-header');
  const navToggle = $('#nav-toggle');
  const primaryNav = $('#primary-nav');
  const navBackdrop = $('#nav-backdrop');

  function setNavOpen(open) {
    const isOpen = !!open;
    primaryNav?.classList.toggle('is-open', isOpen);
    navToggle?.classList.toggle('is-open', isOpen);
    navToggle?.setAttribute('aria-expanded', String(isOpen));
    body.classList.toggle('nav-open', isOpen);
    navBackdrop?.classList.toggle('is-visible', isOpen);
    navBackdrop?.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setNavOpen(!primaryNav.classList.contains('is-open'));
    });

    navBackdrop?.addEventListener('click', () => setNavOpen(false));

    /* Tüm sayfa linkleri: delegasyon (dinamik içerikte de çalışır) */
    primaryNav.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !primaryNav.contains(link)) return;
      setNavOpen(false);
    });

    /* Masaüstüne geçince menü durumunu sıfırla (tıklanamaz ‘açık’ kalmasın) */
    window.addEventListener(
      'resize',
      () => {
        if (window.innerWidth > 900 && primaryNav.classList.contains('is-open')) {
          setNavOpen(false);
        }
      },
      { passive: true }
    );
  }

  function onScroll() {
    header?.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Aynı sayfa içi # bağlantıları ---------- */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Modallar ---------- */
  const modalRoot = $('#modal-root');
  const modalTitle = $('#modal-title');
  const modalBody = $('#modal-body');

  function openModal(title, html) {
    if (!modalRoot || !modalTitle || !modalBody) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalRoot.classList.add('is-open');
    modalRoot.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalRoot) return;
    modalRoot.classList.remove('is-open');
    modalRoot.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalRoot) {
    $$('[data-close-modal]', modalRoot).forEach((el) => el.addEventListener('click', closeModal));
  }

  const lightbox = $('#lightbox');
  const lightboxMedia = $('#lightbox-media');
  const lightboxCaption = $('#lightbox-caption');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxMedia?.querySelector('video')?.pause();
  }

  if (lightbox) {
    $$('[data-close-lightbox]', lightbox).forEach((el) => el.addEventListener('click', closeLightbox));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (lightbox?.classList.contains('is-open')) closeLightbox();
      setNavOpen(false);
    }
  });

  /* ---------- Intersection — reveal ---------- */
  const revealEls = $$('.reveal');
  const revealGroup = $('.reveal-group');

  const ioReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          if (en.target.dataset.observeOnce !== 'false') ioReveal.unobserve(en.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  revealEls.forEach((el) => ioReveal.observe(el));

  function initHeroReveal() {
    if (!revealGroup) return;
    ioReveal.observe(revealGroup);
    const check = () => {
      const r = revealGroup.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) revealGroup.classList.add('is-visible');
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
  }

  /* ---------- Hero video ---------- */
  function setupHeroVideo() {
    const wrap = $('.hero-video-wrap');
    const video = $('.hero-video');
    if (!video || !wrap) return;
    const source = video.querySelector('source');
    const hasSrc = source && source.getAttribute('src') && source.getAttribute('src').trim() !== '';
    if (hasSrc) {
      $('.hero')?.classList.add('has-video');
      video.load();
    } else {
      wrap.style.display = 'none';
    }
  }

  /* ---------- Parallax (yalnızca ana sayfa hero) ---------- */
  function initHeroParallax() {
    const heroSection = $('#hero');
    if (!heroSection || page !== 'home') return;
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY;
        const content = $('.hero-content', heroSection);
        if (content && scrolled < window.innerHeight) {
          content.style.transform = `translate3d(0, ${scrolled * 0.12}px, 0)`;
          content.style.opacity = String(Math.max(0.35, 1 - scrolled / (window.innerHeight * 1.2)));
        } else if (content && scrolled <= 0) {
          content.style.opacity = '1';
        }
      },
      { passive: true }
    );
  }

  /* ---------- Sayaçlar ---------- */
  function initStats() {
    const statItems = $$('#stats-row .stat-item');
    if (!statItems.length) return;
    let done = false;

    function animateValue(el, end, duration) {
      const numEl = $('.stat-number', el);
      if (!numEl) return;
      const startTime = performance.now();
      function frame(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        numEl.textContent = String(Math.round(end * eased));
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    const ioStats = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !done) {
            done = true;
            statItems.forEach((item) => {
              animateValue(item, parseInt(item.dataset.target, 10) || 0, 1600);
            });
            ioStats.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    const statsRow = $('#stats-row');
    if (statsRow) ioStats.observe(statsRow);
  }

  /* ---------- Özel video oynatıcı ---------- */
  function initCustomPlayer(playerRoot) {
    if (!playerRoot) return;
    const mainVideo = $('.player-video', playerRoot);
    const mainPoster = $('.player-poster', playerRoot);
    const mainPlayBtn = $('.player-play-btn', playerRoot);
    if (!mainVideo || !mainPoster || !mainPlayBtn) return;
    const mainSource = mainVideo.querySelector('source');
    const hasMainVideo = mainSource && mainSource.getAttribute('src') && mainSource.getAttribute('src').trim() !== '';

    mainPlayBtn.addEventListener('click', () => {
      if (!hasMainVideo) {
        openModal('Video kaynağı', '<p>MP4 adresini <code>video</code> içindeki <code>source</code> etiketine ekleyin.</p>');
        return;
      }
      playerRoot.classList.add('is-playing');
      mainVideo.play().catch(() => {});
    });
    mainVideo.addEventListener('ended', () => playerRoot.classList.remove('is-playing'));
  }

  /* ---------- Ekip videosu carousel ---------- */
  const teamVideoSlides = [
    { title: 'Akademi: Hoş geldiniz', desc: 'Program oryantasyonu ve kurallar.', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80' },
    { title: 'Akademi: Müzakere atölyesi', desc: 'Temel tartışma teknikleri.', img: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80' },
    { title: 'Organizasyon: Saha', desc: 'Salon akışı ve zaman yönetimi.', img: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80' },
    { title: 'Organizasyon: Kayıt', desc: 'Katılımcı yönlendirme ve destek.', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80' },
    { title: 'Akademi: Raporlama', desc: 'Komisyon çıktılarının yazımı.', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80' },
    { title: 'Organizasyon: Medya', desc: 'Arşiv ve iletişim koordinasyonu.', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
  ];

  function initTeamVideoCarousel() {
    const carouselTrack = $('#carousel-track-team');
    const carouselDots = $('#carousel-dots-team');
    const carouselEl = $('#team-video-carousel');
    if (!carouselTrack || !carouselEl) return;

    teamVideoSlides.forEach((slide) => {
      const li = document.createElement('li');
      li.className = 'carousel-slide';
      li.innerHTML = `
        <article class="video-card-mini">
          <div class="thumb" style="background-image:url('${slide.img}')"></div>
          <div class="body">
            <h4>${slide.title}</h4>
            <p>${slide.desc}</p>
          </div>
        </article>`;
      carouselTrack.appendChild(li);
    });

    const slides = $$('.carousel-slide', carouselTrack);
    const trackWrap = $('.carousel-track-wrap', carouselEl);
    const prevBtn = $('.prev', carouselEl);
    const nextBtn = $('.next', carouselEl);
    let slideIndex = 0;

    function slidesPerView() {
      if (window.innerWidth >= 900) return 3;
      if (window.innerWidth >= 600) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, slides.length - slidesPerView());
    }

    function updateCarousel() {
      const spv = slidesPerView();
      const wrapW = trackWrap?.offsetWidth || 0;
      const slideW = spv > 0 ? wrapW / spv : wrapW;
      carouselTrack.style.display = 'flex';
      slides.forEach((slide) => {
        slide.style.flex = '0 0 auto';
        slide.style.width = `${slideW}px`;
      });
      carouselTrack.style.width = `${slides.length * slideW}px`;
      carouselTrack.style.transform = `translateX(-${slideIndex * slideW}px)`;
      if (carouselDots) {
        carouselDots.innerHTML = '';
        for (let d = 0; d < maxIndex() + 1; d++) {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', `Slayt ${d + 1}`);
          if (d === slideIndex) b.classList.add('is-active');
          b.addEventListener('click', () => {
            slideIndex = d;
            updateCarousel();
          });
          carouselDots.appendChild(b);
        }
      }
    }

    prevBtn?.addEventListener('click', () => {
      slideIndex = Math.max(0, slideIndex - 1);
      updateCarousel();
    });
    nextBtn?.addEventListener('click', () => {
      slideIndex = Math.min(maxIndex(), slideIndex + 1);
      updateCarousel();
    });
    window.addEventListener('resize', () => {
      slideIndex = Math.min(slideIndex, maxIndex());
      updateCarousel();
    });
    requestAnimationFrame(() => updateCarousel());
  }

  /* ---------- Günlük videolar ---------- */
  const dailyDesc = {
    1: 'Gün 1: Açılış konuşmaları, komisyon oluşumu ve çalışma gruplarının atanması.',
    2: 'Gün 2: Komisyon oturumları, müzakere turları ve taslak metinlerin hazırlanması.',
    3: 'Gün 3: Genel kurul oylaması, sonuçların ilanı ve kapanış töreni.',
  };

  function initDailyVideos() {
    $$('.open-daily').forEach((btn) => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day;
        openModal(`Gün ${day} özeti`, `<p>${dailyDesc[day] || ''}</p><p class="muted">Video URL eklendiğinde buraya bağlanabilir.</p>`);
      });
    });
  }

  function initAutoplayStrip() {
    const autoplayToggle = $('#autoplay-strip-toggle');
    const autoplayPreview = $('#autoplay-preview');
    const stripVideo = $('#strip-video');
    autoplayToggle?.addEventListener('change', () => {
      if (!autoplayPreview) return;
      autoplayPreview.hidden = !autoplayToggle.checked;
      const src = stripVideo?.querySelector('source');
      if (autoplayToggle.checked && stripVideo && src?.getAttribute('src')?.trim()) {
        stripVideo.play().catch(() => {});
      } else stripVideo?.pause();
    });
  }

  /* ---------- Ekip ---------- */
  const teamMembers = [
    {
      id: 1,
      filter: 'organization',
      name: 'Kriz Ekibi',
      role: 'Kritik durumlarda yön veren ekip',
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
      bioHtml:
        '<p>Simülasyon sürecinde ortaya çıkabilecek gelişmeleri önceden öngören, komisyonların karşılaşabileceği kritik durumlarda yön verici rol üstlenen ekip: Kriz Ekibi.</p><p>Kriz Ekibi Başkanı Elif Nida Arduç, güçlü kurguları ve planlı yaklaşımıyla sürecin stratejik çerçevesini oluşturuyor. Yardımcısı Tahir Eroğlu ise analitik bakışı ve hızlı değerlendirme yeteneğiyle bu yapıya hareket ve denge katıyor.</p><p>Beklenmeyen gelişmelerin yönetildiği bu süreçte krizler bir engel değil, karar mekanizmalarını güçlendiren birer fırsat. Kriz Ekibi, müdahaleleri ve yönlendirmeleriyle simülasyonun dinamiklerini belirleyen önemli bir rol üstleniyor.</p>',
      social: {},
    },
    {
      id: 2,
      filter: 'organization',
      name: 'Tasarım Ekibi',
      role: 'Görsel kimlik ve iletişim tasarımı',
      img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
      bioHtml:
        '<p>Karatay Genç Meclis’in görsel dünyasını şekillendiren isim: Tasarım Başkanı Rüveyda Koçyiğit. Sadelik ve estetiği buluşturan tasarım anlayışıyla organizasyonun ruhunu görsel dile dönüştürür. Her ayrıntıyı titizlikle ele alarak içeriklerin daha etkileyici ve anlamlı bir biçimde yansıtılmasını sağlar.</p><p>Ortaya koyduğu çalışmalar yalnızca bir tasarım değil, Karatay Genç Meclis’in güçlü ve özgün kimliğinin görsel ifadesidir.</p>',
      social: {},
    },
    {
      id: 3,
      filter: 'organization',
      name: 'Basın Ekibi',
      role: 'Kayıt, kare ve hikâye',
      img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80',
      bioHtml:
        '<p>Karatay Genç Meclis’in her anını özenle kayda alan, detaylarda saklı hikâyeleri görünür kılan ekip: Basın.</p><p>Basın Başkanı Muhammed Süha Uca, güçlü vizyonu ve dikkatli kadrajıyla yalnızca görüntüyü değil, o anın taşıdığı duyguyu da yakalar. Her karede organizasyonun enerjisini ve ruhunu yansıtmayı hedefler. Yardımcısı Nigar Ersak ise sahadaki dinamik takibi ve estetik bakış açısıyla bu anları anlamlı bir anlatıya dönüştürür.</p><p>Onlar sadece anları kaydetmez; her fotoğraf ve her kareyle Karatay Genç Meclis’in hikâyesini görünür kılar.</p>',
      social: {},
    },
    {
      id: 4,
      filter: 'organization',
      name: 'Saha Görevlileri',
      role: 'Akış, yönlendirme ve düzen',
      img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
      bioHtml:
        '<p>Program süresince katılımcıların yönlendirilmesinden genel düzenin korunmasına kadar sürecin sahadaki akışını sağlayan ekip: Saha Görevlileri.</p><p>Başkan Zehra Koçak, sahadaki koordinasyonu ve düzeni sağlama konusundaki titizliğiyle organizasyonun sorunsuz ilerlemesine katkı sunar. Ekibin uyum içinde çalışmasını sağlayarak her anın planlandığı şekilde ilerlemesine öncülük eder.</p><p>Karatay Genç Meclis boyunca sahada hissedilen düzen ve akışta bu emeğin önemli bir payı vardır.</p>',
      social: {},
    },
    {
      id: 5,
      filter: 'organization',
      name: 'Güvenlik Ekibi',
      role: 'Güvenli ve huzurlu süreç',
      img: 'https://images.unsplash.com/photo-1589829085416-56d8b18a9efa?w=400&q=80',
      bioHtml:
        '<p>Karatay Genç Meclis’in düzen içinde ve huzurla ilerlemesini sağlayan en önemli unsurlardan biri: Güvenlik.</p><p>Güvenlik Başkanı Ramazan Çomak, planlı yaklaşımı ve dikkatli koordinasyonuyla organizasyonun güvenli şekilde ilerlemesini sağlar. Süreç boyunca oluşabilecek her duruma karşı hazırlıklı bir yönetim anlayışıyla ekibi yönlendirir. Yardımcısı Furkan Demirel ise sahadaki hızlı takibi ve güçlü refleksleriyle ekibin etkinliğini artırır, güvenliğin her an sürdürülebilmesi için aktif rol üstlenir.</p><p>Onların titiz çalışması sayesinde Karatay Genç Meclis boyunca düzen, güven ve huzur her zaman ön plandadır.</p>',
      social: {},
    },
    {
      id: 6,
      filter: 'organization',
      name: 'Halkla İlişkiler Ekibi',
      role: 'İletişim ve paydaş ilişkileri',
      img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=80',
      bioHtml:
        '<p>Karatay Genç Meclis’in dış dünyayla kurduğu bağın ve güçlü iletişimin adı: Halkla İlişkiler.</p><p>Başkan Bedirhan Çalışkan, hem dış paydaşlarla kurduğu ilişkiler hem de katılımcılarla oluşturduğu iletişim ağıyla organizasyonun etkileşimini güçlendirir. Samimiyet, nezaket ve etkili ifade gücü bu görevin temelini oluşturur.</p><p>Karatay Genç Meclis boyunca kurulan her bağ ve güçlenen her iletişimde bu emeğin izleri vardır.</p>',
      social: {},
    },
    {
      id: 7,
      filter: 'organization',
      name: 'Eğlence Ekibi',
      role: 'Motivasyon ve sosyal etkileşim',
      img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
      bioHtml:
        '<p>Program süresince katılımcıların motivasyonunu artırmayı, etkinlikler arasındaki sosyal etkileşimi güçlendirmeyi ve programın daha keyifli bir atmosferde ilerlemesini sağlamayı amaçlayan birim: Eğlence Ekibi.</p><p><strong>Eğlence Başkanı Ecrin Erva Bildirici:</strong> Eğlence ekibinin genel planlamasını yapar, etkinlik içeriklerini belirler ve program boyunca ekip çalışmalarını koordine ederek faaliyetlerin düzenli bir şekilde yürütülmesini sağlar.</p><p><strong>Yardımcısı Metehan Gözel:</strong> Başkanın planlamalarını uygulama aşamasında destekler, etkinliklerin hazırlık ve yürütülme süreçlerinde aktif görev alır ve ekip içi koordinasyonun sağlanmasına yardımcı olur.</p><p>Eğlence Ekibi, Karatay Genç Meclis’in sadece resmi yönünü değil aynı zamanda sosyal ve motivasyonel yönünü de güçlendirerek katılımcıların daha verimli, enerjik ve unutulmaz bir deneyim yaşamasına katkı sağlar.</p>',
      social: {},
    },
    {
      id: 8,
      filter: 'organization',
      name: 'Medya Ekibi',
      role: 'İçerik ve anlatım',
      img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80',
      bioHtml:
        '<p>Bir organizasyon yalnızca yaşanmaz; aynı zamanda anlatılır. Karatay Genç Meclis’in anlarını anlamlı bir hikâyeye dönüştüren ekip: Medya.</p><p>Başkan Bekir Nuri Bağcı, içerik üretiminin merkezinde yer alarak organizasyonun dışa yansıyan yüzünü titizlikle şekillendirir. Görüntülerin ötesine geçen bir anlatım diliyle yaşanan anların ruhunu yansıtır. Böylece Karatay Genç Meclis, yalnızca bir etkinlik olarak kalmaz; kayda geçen ve hatırlanan bir hikâyeye dönüşür.</p><p>Medya ekibi sadece anları kaydetmez; o anları geleceğe taşıyan bir hafıza oluşturur.</p>',
      social: {},
    },
    {
      id: 9,
      filter: 'organization',
      name: 'Lojistik Ekibi',
      role: 'Planlama ve altyapı',
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
      bioHtml:
        '<p>Her başarılı organizasyonun arkasında, düzeni sağlayan güçlü bir altyapı vardır. Karatay Genç Meclis’te bu düzenin temelini oluşturan ekip: Lojistik.</p><p>Lojistik Başkanı Yasin Koç, planlama ve koordinasyondaki titizliğiyle sürecin sağlıklı ilerlemesini sağlar. Yardımcısı Muhammed Ubeyde Fındık ise sahadaki takibi ve çözüm odaklı yaklaşımıyla tüm detayların eksiksiz şekilde yürütülmesine katkı sunar.</p><p>Görünürde olmasa da, bu ekip Karatay Genç Meclis’in düzenli ve sorunsuz ilerleyen yapısının en önemli parçalarından biridir.</p>',
      social: {},
    },
    {
      id: 10,
      filter: 'organization',
      name: 'Organizasyon Ekibi',
      role: 'Akış, zaman ve koordinasyon',
      img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80',
      bioHtml:
        '<p>Bir etkinliğin başarıyla ilerlemesi çoğu zaman sahnede değil, perde arkasındaki güçlü organizasyonla mümkün olur. Karatay Genç Meclis’te bu düzeni kuran ve süreci yöneten ekip: Organizasyon Ekibi.</p><p>Program akışının planlanması, zaman yönetimi ve tüm birimlerin uyum içinde çalışması bu yapının titiz koordinasyonuyla sağlanır.</p><p>Organizasyon Başkanı Hale Peker, sakin ve planlı yaklaşımıyla sürecin merkezinde yer alır. Detaylara verdiği önem ve güçlü koordinasyon becerisi sayesinde ekipler arasında düzenli bir işleyiş kurulmasına öncülük eder.</p><p>Böylece Karatay Genç Meclis yalnızca planlanan bir etkinlik değil, uyum içinde ilerleyen güçlü bir organizasyon yapısına dönüşür.</p>',
      social: {},
    },
    {
      id: 11,
      filter: 'academy',
      name: 'Akademi Ekibi',
      role: 'Akademik hazırlık ve içerik',
      img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80',
      bioHtml:
        '<p>Bir simülasyonun kalitesini belirleyen en önemli unsur, arkasındaki akademik hazırlıktır. Karatay Genç Meclis’te bu sağlam düşünsel zemini oluşturan yapı: Akademi Ekibi.</p><p>Komisyon başlıklarının araştırılması, içeriklerin kaynaklarla desteklenmesi ve tartışmaların güçlü bir fikrî altyapıya dayanması bu ekibin emeğiyle şekillenir.</p><p>Akademi Başkanı Eymen Çakar, planlı çalışma disiplini ve analitik bakış açısıyla akademik sürecin düzenli ve verimli ilerlemesine öncülük eder. Katılımcıların yalnızca fikirlerini ifade etmelerini değil, aynı zamanda bu fikirleri sağlam temeller üzerine kurmalarını hedefler.</p><p>Onun ekibi yalnızca hazırlık yapmaz; bilgiyi ve düşünceyi merkeze alarak Karatay Genç Meclis’i nitelikli bir öğrenme ve tartışma ortamına dönüştürür.</p>',
      social: {},
    },
  ];

  function socialIcons(member) {
    const s = member.social || {};
    const labels = { ig: 'IG', li: 'in', tw: 'X', yt: 'YT' };
    const links = Object.keys(s)
      .map((k) => `<a href="${s[k]}" aria-label="${labels[k] || k}">${labels[k] || k}</a>`)
      .join('');
    return `<div class="social-mini">${links}</div>`;
  }

  function initTeamPage() {
    const teamGrid = $('#team-grid');
    if (!teamGrid) return;

    function renderTeam(filter) {
      teamGrid.innerHTML = '';
      teamMembers.forEach((m) => {
        if (filter !== 'all' && m.filter !== filter) return;
        const card = document.createElement('article');
        card.className = 'team-card reveal is-visible';
        card.innerHTML = `
        <img src="${m.img}" alt="${m.name}" width="400" height="400" loading="lazy">
        <div class="info">
          <h4>${m.name}</h4>
          <p class="role">${m.role}</p>
          <div class="actions">
            <button type="button" class="btn btn-ghost btn-sm btn-profile" data-member-id="${m.id}">Profil</button>
            ${socialIcons(m)}
          </div>
        </div>`;
        teamGrid.appendChild(card);
      });
      $$('.btn-profile', teamGrid).forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.memberId, 10);
          const m = teamMembers.find((x) => x.id === id);
          if (m) {
            const lead = m.role ? `<p class="role"><strong>${m.role}</strong></p>` : '';
            const body = m.bioHtml || '';
            openModal(m.name, `${lead}${body}`);
          }
        });
      });
    }

    $$('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach((b) => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        renderTeam(btn.dataset.filter || 'all');
      });
    });
    renderTeam('all');
  }

  /* ---------- Komisyonlar ---------- */
  const commissions = [
    {
      id: 'c1',
      cat: 'meb',
      title: 'Milli Eğitim Komisyonu',
      logo: 'MEB',
      agenda: [
        'Zorunlu Eğitim Kademelerinde (4+4+4) Verimliliğin Artırılması ve Öğrenci İhtiyaçlarına Göre Yapısal İyileştirmeler.',
        'Öğrenci Değerlendirme Süreçlerinde Akademik Başarı ile Yetenek Temelli Yaklaşımların Entegrasyonu.',
        'Öğrenci Gelişiminde Sosyal ve Akademik Dengenin Sağlanması.',
      ],
      detail:
        '<p>Milli Eğitim Komisyonu; zorunlu eğitim kademelerinde (4+4+4) verimliliği artırmayı, eğitim yapısını öğrenci ihtiyaçlarına göre geliştirmeyi ve değerlendirme süreçlerinde akademik başarı ile yetenek temelli yaklaşımları bütünleştirmeyi amaçlar.</p><p>Komisyon ayrıca, öğrencilerin sosyal ve akademik gelişimleri arasında dengeli ve sürdürülebilir bir yapı oluşturmayı hedefler.</p>',
    },
    {
      id: 'c2',
      cat: 'tarim',
      title: 'Tarım, Orman ve Köyişleri Komisyonu',
      logo: 'TÖK',
      agenda: [
        'Stratejik Tarım Arazilerinin Korunması ve Yerli Çiftçinin Güçlendirilmesi.',
        'Tarımda Çiftçi Gelirlerinin Stabilizasyonu ve Fiyat Dalgalanmalarının Önlenmesi.',
        'Tarımsal Üretimde Nesil Devamlılığının Sağlanması ve Genç Üreticilerin Kırsal Ekonomiye Entegrasyonu.',
      ],
      detail:
        '<p>Tarım, Orman ve Köyişleri Komisyonu, stratejik tarım arazilerinin korunması, çiftçi gelirlerinde istikrarın sağlanması ve genç üreticilerin kırsal ekonomiye kazandırılması konularında çalışmalar yürüten bir komisyondur. Yerli üreticiyi güçlendirmeyi ve tarımsal üretimde sürdürülebilirliği esas alır.</p>',
    },
    {
      id: 'c3',
      cat: 'adalet',
      title: 'Adalet Komisyonu',
      logo: 'ADL',
      agenda: [
        '5237 Sayılı Türk Ceza Kanunu’nun caydırıcılık işlevi ve suça sürüklenen çocuklara yönelik ceza politikalarının değerlendirilmesi.',
        'Silahlı örgüt suçu (TCK m.314) kapsamı ve ceza yargılamasında delil standartlarının incelenmesi.',
        'Takdiri indirim ve iyi hâl uygulamalarının adalet, caydırıcılık ve kamu vicdanı üzerindeki etkisinin değerlendirilmesi.',
      ],
      detail:
        '<p>Adalet Komisyonu, ceza adalet sisteminde caydırıcılığın güçlendirilmesi, yargılama süreçlerinde delil standartlarının netleştirilmesi ve adalet–vicdan dengesinin korunmasına yönelik çalışmalar yapmayı amaçlar.</p>',
    },
    {
      id: 'c4',
      cat: 'icisleri',
      title: 'İçişleri Komisyonu',
      logo: 'İÇ',
      agenda: [
        'Avrupa Birliği’ne üyelik sürecinde içişleri alanında yapılan ve planlanan düzenlemelerin değerlendirilmesi.',
        'Dijital güvenlik uygulamaları, internet üzerindeki erişim engelleri ve veri güvenliğinin korunması.',
        'Afetlere karşı bilinçlendirme çalışmaları ve yerel hazırlık kapasitesinin artırılması.',
      ],
      detail:
        '<p>İçişleri Komisyonu, ülke içi güvenliğin güçlendirilmesi, dijital ortamda güvenliğin sağlanması ve afetlere karşı toplumsal hazırlığın artırılması amacıyla çalışmalar yürütür.</p>',
    },
    {
      id: 'c5',
      cat: 'disisleri',
      title: 'Dışişleri Komisyonu',
      logo: 'DIŞ',
      agenda: [
        'Türkiye’nin sınır bölgelerindeki otorite yetkisi: Irak ve terörle mücadele politikalarının değerlendirilmesi.',
        'Batı bloğundaki gerilimler ve Türkiye’nin dış politika yönelimi.',
        'Libya krizi ve Türkiye’nin bölgesel güç projeksiyonu.',
      ],
      detail:
        '<p>Dışişleri Komisyonu, Türkiye’nin uluslararası ilişkilerinde diplomatik dengeyi korumayı, dış politika stratejilerini değerlendirmeyi ve bölgesel gelişmeleri analiz etmeyi amaçlar.</p>',
    },
    {
      id: 'c6',
      cat: 'anayasa',
      title: 'Anayasa Komisyonu',
      logo: 'ANY',
      agenda: [
        'Olağanüstü hâl ve savaş yetkilerinin anayasal çerçevesinin yeniden düzenlenmesi',
        'Türk Boğazlarının statüsü ve ulusal güvenlik yetkilerinin anayasal güvenceye alınması',
        'Savunma sanayi ve stratejik üretimin ulusal güvenlik kapsamında anayasal statüsünün belirlenmesi.',
      ],
      detail:
        '<p>Anayasa Komisyonu, devletin temel hukuk düzenini belirleyen Türkiye Cumhuriyeti Anayasası’na uygun olarak yasa tekliflerini değerlendiren ve anayasal uyumu gözeten bir komisyondur. Temel hak ve özgürlüklerin korunması, hukuk devleti ilkesinin güçlendirilmesi ve mevzuatın anayasal çerçeveye uygunluğunun sağlanması amacıyla çalışmalar yürütür.</p>',
    },
  ];

  function initCommissionsPage() {
    const commissionGrid = $('#commission-grid');
    if (!commissionGrid) return;

    function renderCommissions(cat) {
      commissionGrid.innerHTML = '';
      commissions.forEach((c) => {
        if (cat !== 'all' && c.cat !== cat) return;
        const card = document.createElement('article');
        card.className = 'comm-card reveal is-visible';
        card.innerHTML = `
        <div class="comm-logo" aria-hidden="true">${c.logo}</div>
        <div>
          <h4>${c.title}</h4>
          <p class="agenda-preview">${c.agenda.slice(0, 2).join(' · ')}</p>
        </div>`;
        card.addEventListener('click', () => {
          const list = c.agenda.map((a) => `<li>${a}</li>`).join('');
          openModal(c.title, `${c.detail}<p><strong>Gündem maddeleri</strong></p><ul>${list}</ul>`);
        });
        commissionGrid.appendChild(card);
      });
    }

    $$('[data-comm-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-comm-filter]').forEach((b) => b.classList.toggle('active', b === btn));
        renderCommissions(btn.dataset.commFilter || 'all');
      });
    });
    renderCommissions('all');

    const submitVote = $('#submit-vote');
    const voteResult = $('#vote-result');
    const voteKey = 'genc-meclis-demo-vote';
    submitVote?.addEventListener('click', () => {
      const selected = document.querySelector('input[name="demo-vote"]:checked');
      if (!selected) {
        if (voteResult) voteResult.textContent = 'Bir seçenek işaretleyin.';
        return;
      }
      localStorage.setItem(voteKey, selected.value);
      if (voteResult) voteResult.textContent = `Oyunuz (yerel): ${selected.value}. Teşekkürler!`;
    });
    const v = localStorage.getItem(voteKey);
    if (v && voteResult) voteResult.textContent = `Son oy (bu cihaz): ${v}`;
  }

  /* ---------- Galeri ---------- */
  const galleryByDay = {
    1: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', cap: 'Açılış töreni' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80', cap: 'Kayıt alanı' },
      { type: 'video', src: '', cap: 'Örnek klip', poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', cap: 'Grup fotoğrafı' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1560439514-4cab6fd7aba5?w=600&q=80', cap: 'Oturum salonu' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80', cap: 'Kahve arası' },
    ],
    2: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80', cap: 'Komisyon çalışması' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=600&q=80', cap: 'Müzakere' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80', cap: 'Not tutma' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80', cap: 'Atölye' },
    ],
    3: [
      { type: 'image', src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', cap: 'Oylama' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1523580494863-6f303122c8bb?w=600&q=80', cap: 'Kapanış' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80', cap: 'Ödül töreni' },
    ],
  };

  function initGalleryPage() {
    const galleryGrid = $('#gallery-grid');
    const galleryViewport = $('#gallery-carousel-viewport');
    if (!galleryGrid || !galleryViewport) return;

    let currentGalleryDay = 1;
    let galleryCarouselIndex = 0;
    let galleryAutoTimer = null;

    function openLightbox(day, index) {
      const items = galleryByDay[day] || [];
      const item = items[index];
      if (!item || !lightbox || !lightboxMedia) return;
      lightboxMedia.innerHTML = '';
      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.cap || '';
        lightboxMedia.appendChild(img);
      } else if (item.src) {
        const vid = document.createElement('video');
        vid.controls = true;
        vid.poster = item.poster || '';
        const s = document.createElement('source');
        s.src = item.src;
        s.type = 'video/mp4';
        vid.appendChild(s);
        lightboxMedia.appendChild(vid);
      } else {
        lightboxMedia.innerHTML = '<p class="muted">Video URL eklenince oynatılır.</p>';
      }
      if (lightboxCaption) lightboxCaption.textContent = item.cap || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function buildGalleryGrid(day) {
      const items = galleryByDay[day] || [];
      galleryGrid.innerHTML = '';
      items.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'gallery-item' + (item.type === 'video' ? ' is-video' : '');
        div.style.backgroundImage = item.type === 'image' ? `url('${item.src}')` : `url('${item.poster || ''}')`;
        div.addEventListener('click', () => openLightbox(day, idx));
        galleryGrid.appendChild(div);
      });
    }

    function sizeGalleryCarousel() {
      const inner = $('#gallery-carousel-inner');
      if (!inner || !galleryViewport) return;
      const slides = $$('.gallery-carousel-item', inner);
      const w = galleryViewport.offsetWidth;
      inner.style.display = 'flex';
      inner.style.width = `${slides.length * w}px`;
      slides.forEach((slide) => {
        slide.style.flex = '0 0 auto';
        slide.style.width = `${w}px`;
      });
    }

    function updateGalleryCarousel() {
      const inner = $('#gallery-carousel-inner');
      if (!inner || !galleryViewport) return;
      const w = galleryViewport.offsetWidth;
      inner.style.transform = `translateX(-${galleryCarouselIndex * w}px)`;
    }

    function buildGalleryCarousel(day) {
      const items = galleryByDay[day] || [];
      galleryViewport.innerHTML = '';
      const inner = document.createElement('div');
      inner.className = 'gallery-carousel-inner';
      inner.id = 'gallery-carousel-inner';
      items.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-carousel-item';
        slide.style.backgroundImage = item.type === 'image' ? `url('${item.src}')` : `url('${item.poster || item.src}')`;
        inner.appendChild(slide);
      });
      galleryViewport.appendChild(inner);
      galleryCarouselIndex = 0;
      requestAnimationFrame(() => {
        sizeGalleryCarousel();
        updateGalleryCarousel();
      });
    }

    function setGalleryDay(day) {
      currentGalleryDay = day;
      buildGalleryGrid(day);
      buildGalleryCarousel(day);
    }

    $$('.gallery-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.gallery-tab').forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        setGalleryDay(parseInt(tab.dataset.day, 10));
      });
    });

    $('#gallery-carousel-prev')?.addEventListener('click', () => {
      const items = galleryByDay[currentGalleryDay] || [];
      galleryCarouselIndex = (galleryCarouselIndex - 1 + items.length) % items.length;
      updateGalleryCarousel();
    });
    $('#gallery-carousel-next')?.addEventListener('click', () => {
      const items = galleryByDay[currentGalleryDay] || [];
      galleryCarouselIndex = (galleryCarouselIndex + 1) % items.length;
      updateGalleryCarousel();
    });

    window.addEventListener(
      'resize',
      () => {
        sizeGalleryCarousel();
        updateGalleryCarousel();
      },
      { passive: true }
    );

    $('#gallery-autoscroll')?.addEventListener('change', (e) => {
      if (galleryAutoTimer) {
        clearInterval(galleryAutoTimer);
        galleryAutoTimer = null;
      }
      if (e.target.checked) {
        galleryAutoTimer = setInterval(() => {
          const items = galleryByDay[currentGalleryDay] || [];
          if (items.length < 2) return;
          galleryCarouselIndex = (galleryCarouselIndex + 1) % items.length;
          updateGalleryCarousel();
        }, 4500);
      }
    });

    setGalleryDay(1);
  }

  /* ---------- Program sayfası ---------- */
  function initProgramPage() {
    const timelineEl = $('#event-timeline');
    if (!timelineEl) return;

    const sessions = [
      { time: '08:30', title: 'Kayıt ve kahvaltı', desc: 'Katılımcı yaka kartları ve materyal dağıtımı.' },
      { time: '09:30', title: 'Açılış oturumu', desc: 'Program sunumu ve komisyon duyuruları.', detail: 'Salon A — protokol ve güvenlik brifingi.' },
      { time: '11:00', title: 'Komisyon oturumu I', desc: 'Gündem maddelerinin okunması.' },
      { time: '13:00', title: 'Öğle arası', desc: 'Networking.' },
      { time: '14:30', title: 'Komisyon oturumu II', desc: 'Taslak metin müzakeresi.' },
      { time: '17:00', title: 'Gün sonu değerlendirme', desc: 'Özet ve ertesi gün hazırlığı.' },
    ];

    sessions.forEach((s, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
      <span class="time">${s.time}</span>
      <p class="session-title">${s.title}</p>
      <p class="session-desc">${s.desc}</p>
      ${s.detail ? `<button type="button" class="btn btn-ghost btn-sm detail-btn" data-session="${i}">Detay</button>` : ''}`;
      timelineEl.appendChild(li);
    });

    $$('.detail-btn', timelineEl).forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.session, 10);
        const s = sessions[i];
        if (s?.detail) openModal(s.title, `<p>${s.detail}</p>`);
      });
    });

    const calendarMini = $('#calendar-mini');
    if (calendarMini) {
      ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].forEach((d) => {
        const h = document.createElement('div');
        h.className = 'cal-head';
        h.textContent = d;
        calendarMini.appendChild(h);
      });
      for (let d = 1; d <= 28; d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell' + ([5, 12, 19].includes(d) ? ' is-event' : '');
        cell.textContent = String(d);
        calendarMini.appendChild(cell);
      }
    }

    const cdDays = $('#cd-days');
    const cdHours = $('#cd-hours');
    const cdMins = $('#cd-mins');
    const cdSecs = $('#cd-secs');
    const eventTarget = new Date();
    eventTarget.setDate(eventTarget.getDate() + 45);
    eventTarget.setHours(10, 0, 0, 0);

    function tickCountdown() {
      const now = new Date();
      let diff = eventTarget - now;
      if (diff < 0) diff = 0;
      const s = Math.floor(diff / 1000);
      const days = Math.floor(s / 86400);
      const hrs = Math.floor((s % 86400) / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;
      if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
      if (cdHours) cdHours.textContent = String(hrs).padStart(2, '0');
      if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
      if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
    }
    tickCountdown();
    setInterval(tickCountdown, 1000);

    $('#pdf-download')?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('Program PDF', '<p>PDF dosyanızı <code>assets/</code> altına ekleyip bağlantıyı güncelleyin.</p>');
    });
    $('#reminder-btn')?.addEventListener('click', () => {
      openModal('Hatırlatıcı', '<p>Görsel demo: takvime manuel ekleme yapılabilir.</p>');
    });
  }

  /* ---------- İletişim ---------- */
  function initContactPage() {
    const form = $('#contact-form');
    const nameEl = $('#name');
    const emailEl = $('#email');
    const messageEl = $('#message');
    const successEl = $('#form-success');

    function showFieldError(id, msg) {
      const err = $(`#${id}-error`);
      const input = $(`#${id}`);
      if (err) err.textContent = msg || '';
      if (input) input.classList.toggle('is-invalid', !!msg);
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const name = nameEl?.value.trim() || '';
      const email = emailEl?.value.trim() || '';
      const message = messageEl?.value.trim() || '';
      showFieldError('name', '');
      showFieldError('email', '');
      showFieldError('message', '');
      if (name.length < 2) {
        showFieldError('name', 'En az 2 karakter girin.');
        ok = false;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        showFieldError('email', 'Geçerli e-posta girin.');
        ok = false;
      }
      if (message.length < 10) {
        showFieldError('message', 'Mesaj en az 10 karakter olmalı.');
        ok = false;
      }
      if (ok && successEl) {
        successEl.hidden = false;
        form.reset();
        setTimeout(() => {
          successEl.hidden = true;
        }, 5000);
      }
    });

    const faqData = [
      { q: 'Programa kimler katılabilir?', a: 'Lise ve üniversite öğrencileri; istisnalar için iletişim.' },
      { q: 'Katılım ücretli mi?', a: 'Sponsorluk ve burs kontenjanları duyurulur.' },
      { q: 'Sertifika veriliyor mu?', a: 'Tüm oturumlara katılanlara dijital belge verilir.' },
      { q: 'Hibrit katılım var mı?', a: 'Seçili oturumlarda çevrim içi izleme mümkün olabilir.' },
    ];

    const faqRoot = $('#faq-accordion');
    faqData.forEach((item, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'accordion-item';
      wrap.innerHTML = `
      <button type="button" class="accordion-trigger" aria-expanded="false" id="faq-btn-${i}" aria-controls="faq-panel-${i}">${item.q}</button>
      <div class="accordion-panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-btn-${i}">
        <div class="accordion-panel-inner">${item.a}</div>
      </div>`;
      const trig = wrap.querySelector('.accordion-trigger');
      const panel = wrap.querySelector('.accordion-panel');
      trig.addEventListener('click', () => {
        const wasOpen = wrap.classList.contains('is-open');
        $$('.accordion-item', faqRoot).forEach((acc) => {
          acc.classList.remove('is-open');
          acc.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
          const p = acc.querySelector('.accordion-panel');
          if (p) p.style.maxHeight = '';
        });
        if (!wasOpen) {
          wrap.classList.add('is-open');
          trig.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 24 + 'px';
        }
      });
      faqRoot?.appendChild(wrap);
    });
  }

  function initHomePage() {
    setupHeroVideo();
    initHeroParallax();
    initStats();
    initCustomPlayer($('#main-player'));
    initTeamVideoCarousel();
    initDailyVideos();
    initAutoplayStrip();
  }

  const pageInit = {
    home: initHomePage,
    team: initTeamPage,
    commissions: initCommissionsPage,
    gallery: initGalleryPage,
    program: initProgramPage,
    contact: initContactPage,
  };

  window.addEventListener('load', () => {
    hideLoader();
    body.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      setTimeout(() => body.classList.remove('page-transitioning'), 500);
    });
    initHeroReveal();
    if (typeof pageInit[page] === 'function') pageInit[page]();
  });

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
