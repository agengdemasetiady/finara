/* Finara: utilitas angka dan animasi */
const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tween(el, to, dur = 850) {
  if (!el) return;
  const from = el._v || 0;
  el._v = to;
  if (!motionOK() || from === to) {
    el.textContent = idr.format(to);
    return;
  }
  cancelAnimationFrame(el._raf);
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = idr.format(Math.round(from + (to - from) * e));
    if (k < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

/* ===== Demo interaktif profil & menu ponsel ===== */
(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panel = document.getElementById('demo-panel');
  const demoBody = document.querySelector('.demo-body');
  let shimmerTimer = null;

  const data = {
    pelajar: {
      balanceLabel: 'Sisa uang saku',
      balance: 285000,
      balanceNote: 'dari uang saku Rp500.000',
      income: 500000,
      expense: 215000,
      chartLabel: 'Pengeluaran 7 hari',
      chart: [25000, 18000, 42000, 16000, 34000, 28000, 52000],
      budgetLabel: 'Anggaran jajan',
      budgetValue: 120000,
      budgetMax: 150000,
      insight: 'Jajan bulan ini Rp120.000. Batas aman harianmu Rp19.000.'
    },
    kos: {
      balanceLabel: 'Sisa uang bulanan',
      balance: 1240000,
      balanceNote: 'dari uang bulanan Rp2.000.000',
      income: 2000000,
      expense: 760000,
      chartLabel: 'Pengeluaran 7 hari',
      chart: [95000, 80000, 130000, 70000, 110000, 125000, 150000],
      budgetLabel: 'Anggaran makan',
      budgetValue: 648000,
      budgetMax: 900000,
      insight: 'Batas aman Rp103.000 per hari. Tagihan kos jatuh tempo 3 hari lagi.'
    },
    umkm: {
      balanceLabel: 'Laba sederhana bulan ini',
      balance: 3870000,
      balanceNote: 'pemasukan minus biaya usaha',
      income: 6450000,
      expense: 2580000,
      chartLabel: 'Pemasukan 7 hari',
      chart: [780000, 820000, 910000, 760000, 980000, 1050000, 1150000],
      budgetLabel: 'Biaya bahan baku',
      budgetValue: 1560000,
      budgetMax: 2000000,
      insight: 'Biaya bahan baku naik 14% dari bulan lalu.'
    }
  };

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const els = {
    balanceLabel: document.getElementById('balance-label'),
    balance: document.getElementById('balance-value'),
    balanceNote: document.getElementById('balance-note'),
    income: document.getElementById('income-value'),
    expense: document.getElementById('expense-value'),
    chartLabel: document.getElementById('chart-label'),
    chartTotal: document.getElementById('chart-total'),
    chartSummary: document.getElementById('chart-summary'),
    budgetLabel: document.getElementById('budget-label'),
    budgetPercent: document.getElementById('budget-percent'),
    budgetProgress: document.getElementById('budget-progress'),
    budgetNote: document.getElementById('budget-note'),
    insight: document.getElementById('insight-text')
  };
  const bars = Array.from(document.querySelectorAll('.chart .bar'));

  function selectTab(tab, moveFocus) {
    const profile = data[tab.dataset.profile];
    if (!profile || !panel) return;

    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panel.setAttribute('aria-labelledby', tab.id);

    if (demoBody && motionOK()) {
      clearTimeout(shimmerTimer);
      demoBody.classList.remove('is-loading');
      void demoBody.offsetWidth;
      demoBody.classList.add('is-loading');
      shimmerTimer = setTimeout(() => demoBody.classList.remove('is-loading'), 360);
    }

    const chartSum = profile.chart.reduce((total, value) => total + value, 0);

    els.balanceLabel.textContent = profile.balanceLabel;
    tween(els.balance, profile.balance);
    els.balanceNote.textContent = profile.balanceNote;
    tween(els.income, profile.income);
    tween(els.expense, profile.expense);
    els.chartLabel.textContent = profile.chartLabel;
    tween(els.chartTotal, chartSum);
    els.budgetLabel.textContent = profile.budgetLabel;
    els.budgetPercent.textContent = Math.round((profile.budgetValue / profile.budgetMax) * 100) + '%';
    els.budgetProgress.value = profile.budgetValue;
    els.budgetProgress.max = profile.budgetMax;
    els.budgetNote.textContent = idr.format(profile.budgetValue) + ' dari ' + idr.format(profile.budgetMax);
    els.insight.textContent = profile.insight;

    const max = Math.max(...profile.chart);
    bars.forEach((bar, index) => {
      bar.style.setProperty('--h', (profile.chart[index] / max).toFixed(3));
      bar.classList.toggle('is-last', index === bars.length - 1);
    });

    els.chartSummary.textContent = profile.chartLabel + ': ' +
      profile.chart.map((value, index) => dayNames[index] + ' ' + idr.format(value)).join(', ') + '.';

    if (moveFocus) tab.focus();

    if (motionOK() && panel.animate) {
      panel.animate(
        [
          { opacity: 0.65, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab, false));

    tab.addEventListener('keydown', (event) => {
      let target = null;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (!target) return;
      event.preventDefault();
      selectTab(target, true);
    });
  });

  const menuButton = document.querySelector('.menu-btn');
  const menu = document.getElementById('mobile-menu');

  if (menuButton && menu) {
    menu.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', i));

    const setMenu = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      clearTimeout(menu._t);
      if (open) {
        menu.classList.remove('is-closing');
        menu.hidden = false;
        return;
      }
      if (menu.hidden) return;
      if (!motionOK()) { menu.hidden = true; return; }
      menu.classList.add('is-closing');
      menu._t = setTimeout(() => {
        menu.hidden = true;
        menu.classList.remove('is-closing');
      }, 300);
    };

    menuButton.addEventListener('click', () => {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', (event) => {
      if (menuButton.getAttribute('aria-expanded') !== 'true') return;
      if (menu.contains(event.target) || menuButton.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
      setMenu(false);
      menuButton.focus();
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }
})();

/* ===== Tema terang/gelap ===== */
(() => {
  const root = document.documentElement;
  const btn = document.querySelector('.theme-switch');
  const meta = document.getElementById('meta-theme');
  const KEY = 'finara-theme';
  if (!btn) return;

  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-checked', String(dark));
    if (meta) meta.content = dark ? '#0D1713' : '#F6F7F2';
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    sync();
  };

  const set = (theme) => {
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    if (!motionOK()) return apply(theme);
    root.classList.add('theme-fade');
    apply(theme);
    clearTimeout(root._themeT);
    root._themeT = setTimeout(() => root.classList.remove('theme-fade'), 260);
  };

  btn.addEventListener('click', () => {
    set(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (_) {}
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });

  sync();
})();

/* ===== Animasi, sorot kartu, tilt demo, scrollspy, dan header ===== */
(() => {
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  $$('.alert-list,.file-list,.reminder-list,.mini-ledger,.cat-chart,.mini-budgets,.compare,.step-chips,.profile-tags,.tx-chips,.tx-steps,.team-grid,.about-principles,.contact-list')
    .forEach((c) => Array.from(c.children).forEach((ch, i) => ch.style.setProperty('--k', i)));

  $$('.hero .bar').forEach((b, i) => b.style.setProperty('--n', i));

  $$('.card, .profile-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });

  const demoStage = document.querySelector('.demo-stage');
  const demoCard = document.querySelector('.demo-card');
  if (demoStage && demoCard && motionOK()) {
    demoStage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = demoStage.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      demoCard.style.setProperty('--rx', (-ny * 4).toFixed(2) + 'deg');
      demoCard.style.setProperty('--ry', (nx * 5).toFixed(2) + 'deg');
    });

    demoStage.addEventListener('pointerleave', () => {
      demoCard.style.setProperty('--rx', '0deg');
      demoCard.style.setProperty('--ry', '0deg');
    });
  }

  // Easing pegas (spring) asli lewat CSS linear(): naik, mantul sedikit, lalu mengendap halus
  const SPRING = (() => {
    if (!(window.CSS && CSS.supports('animation-timing-function', 'linear(0, 1)'))) return 'cubic-bezier(.34, 1.56, .64, 1)';
    const N = 56, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push(i === N ? 1 : +(1 - Math.exp(-6.5 * t) * Math.cos(9.5 * t)).toFixed(4));
    }
    return 'linear(' + pts.join(', ') + ')';
  })();
  const SOFT = 'cubic-bezier(.22, 1, .36, 1)';

  const reveal = (el, delay) => {
    el.style.setProperty('--d', delay + 'ms');
    el.classList.add('is-in');
    if (!el.animate) return;

    // Reduced motion: cukup fade pelan tanpa gerakan
    if (!motionOK()) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay, easing: 'ease-out', fill: 'backwards' });
      return;
    }

    let from = 'translateY(80px) scale(.93)', dur = 1200, ease = SPRING;
    if (el.matches('.section-head, .faq-intro, .contact-intro')) {
      from = 'translateY(36px)'; dur = 950; ease = SOFT;
    } else if (el.getAttribute('data-reveal') === 'in') {
      from = 'translateY(46px) scale(.9)'; dur = 1250;
    }

    el.animate([
      { opacity: 0, transform: from, filter: 'blur(10px)' },
      { opacity: 1, filter: 'blur(0px)', offset: 0.3 },
      { opacity: 1, transform: 'none', filter: 'blur(0px)' }
    ], { duration: dur, delay, easing: ease, fill: 'backwards' });
  };

  // Elemen yang muncul bersamaan dikasih jeda bertahap (kiri-ke-kanan, atas-ke-bawah)
  const io = new IntersectionObserver((entries) => {
    entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left))
      .forEach((e, i) => {
        reveal(e.target, Math.min(i, 5) * 110);
        io.unobserve(e.target);
      });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  $$('[data-reveal]').forEach((el) => io.observe(el));

  if (motionOK()) {
    const nums = ['balance-value', 'income-value', 'expense-value', 'chart-total']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const final = nums.map((n) => parseInt(n.textContent.replace(/\D/g, ''), 10));
    nums.forEach((n) => { n.textContent = idr.format(0); n._v = 0; });
    setTimeout(() => nums.forEach((n, i) => tween(n, final[i], 1200)), 550);
  }

  const links = $$('.primary-nav a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => {
        const active = a.getAttribute('href') === '#' + e.target.id;
        if (active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  $$('main section[id]').forEach((s) => spy.observe(s));

  const header = document.querySelector('.site-header');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (header) header.classList.toggle('is-scrolled', scrollY > 8);
      ticking = false;
    });
  };

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ===== Formulir kontak (membuka aplikasi email pengguna) ===== */
(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');

  const check = (f) => {
    const err = document.getElementById(f.id + '-err');
    let msg = '';
    if (!f.value.trim()) msg = 'Wajib diisi.';
    else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) msg = 'Format email belum benar.';
    f.setAttribute('aria-invalid', String(Boolean(msg)));
    if (err) err.textContent = msg;
    return !msg;
  };

  form.querySelectorAll('[required]').forEach((f) => {
    f.addEventListener('input', () => {
      if (f.getAttribute('aria-invalid') === 'true') check(f);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = Array.from(form.querySelectorAll('[required]'));
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      bad[0].focus();
      status.textContent = '';
      return;
    }
    const v = (n) => form.elements[n].value.trim();
    const subject = encodeURIComponent('[Finara] ' + v('topik'));
    const body = encodeURIComponent('Nama: ' + v('nama') + '\nEmail: ' + v('email') + '\n\n' + v('pesan'));
    status.textContent = 'Aplikasi emailmu akan terbuka dengan pesan ini. Jika tidak terbuka, kirim langsung ke ' + form.dataset.email + '.';
    location.href = 'mailto:' + form.dataset.email + '?subject=' + subject + '&body=' + body;
  });
})();

/* ===== FAQ: buka/tutup meluncur halus (tinggi dianimasikan, isi muncul bertahap) ===== */
(() => {
  const list = document.querySelector('.faq-list');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('details'));
  const EASE_OPEN = 'cubic-bezier(.22, 1, .36, 1)';
  const EASE_CLOSE = 'cubic-bezier(.65, 0, .35, 1)';

  list.classList.add('is-enhanced');
  items.forEach((d) => {
    d.removeAttribute('name');
    d.classList.toggle('is-open', d.open);
  });

  const closedHeight = (d) => {
    const cs = getComputedStyle(d);
    return d.querySelector('summary').offsetHeight +
      parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) +
      parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  };

  const cleanup = (d) => {
    d._anims = null;
    d.style.height = '';
    d.style.willChange = '';
  };

  const stop = (d) => {
    if (d._anims) d._anims.forEach((a) => a.cancel());
    cleanup(d);
  };

  function toggle(d, open) {
    const body = d.querySelector('p');
    const startH = d.getBoundingClientRect().height;
    stop(d);
    d.classList.toggle('is-open', open);

    if (!motionOK() || !d.animate) {
      d.open = open;
      d.classList.remove('is-closing');
      return;
    }

    d.style.willChange = 'height';

    if (open) {
      d.classList.remove('is-closing');
      d.open = true;
      const endH = d.getBoundingClientRect().height;
      const a1 = d.animate(
        { height: [startH + 'px', endH + 'px'] },
        { duration: 520, easing: EASE_OPEN }
      );
      const a2 = body.animate(
        [
          { opacity: 0, transform: 'translateY(-10px)', filter: 'blur(3px)' },
          { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
        ],
        { duration: 480, delay: 90, easing: EASE_OPEN, fill: 'backwards' }
      );
      d._anims = [a1, a2];
      a1.onfinish = () => {
        cleanup(d);
        const r = d.getBoundingClientRect();
        if (r.bottom > innerHeight - 12) {
          scrollBy({ top: r.bottom - innerHeight + 24, behavior: 'smooth' });
        }
      };
      a1.oncancel = () => {};
    } else {
      d.classList.add('is-closing');
      const endH = closedHeight(d);
      const a1 = d.animate(
        { height: [startH + 'px', endH + 'px'] },
        { duration: 400, easing: EASE_CLOSE }
      );
      const a2 = body.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-6px)' }
        ],
        { duration: 220, easing: 'ease-out', fill: 'forwards' }
      );
      d._anims = [a1, a2];
      a1.onfinish = () => {
        d.open = false;
        d.classList.remove('is-closing');
        a2.cancel();
        cleanup(d);
      };
    }
  }

  items.forEach((d) => {
    const summary = d.querySelector('summary');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !d.classList.contains('is-open');
      if (willOpen) {
        items.forEach((o) => {
          if (o !== d && o.classList.contains('is-open')) toggle(o, false);
        });
      }
      toggle(d, willOpen);
    });
  });
})();

/* ===== Polesan: scroll mulus antar-bagian, header cerdas, ripple sentuh, magnet, geser demo, tombol ke atas ===== */
(() => {
  const root = document.documentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const buzz = (ms = 8) => { if (motionOK() && navigator.vibrate) { try { navigator.vibrate(ms); } catch (_) {} } };

  let scrollToken = 0;
  const scrollToY = (y) => new Promise((resolve) => {
    const from = scrollY;
    const dist = y - from;
    const token = ++scrollToken;
    if (!motionOK() || Math.abs(dist) < 2) {
      scrollTo({ top: y, behavior: 'instant' });
      return resolve();
    }
    const dur = Math.min(1200, 480 + Math.abs(dist) * 0.16);
    const t0 = performance.now();
    const step = (now) => {
      if (token !== scrollToken) return resolve();
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      scrollTo({ top: from + dist * e, behavior: 'instant' });
      if (k < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  ['wheel', 'touchstart', 'keydown'].forEach((t) =>
    addEventListener(t, () => { scrollToken++; }, { passive: true }));

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    e.preventDefault();
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const y = id ? target.getBoundingClientRect().top + scrollY - margin : 0;
    scrollToY(Math.max(0, y)).then(() => {
      if (id) history.replaceState(null, '', '#' + id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      const h = target.querySelector('h1, h2');
      if (h && motionOK()) {
        h.classList.remove('is-pulse');
        void h.offsetWidth;
        h.classList.add('is-pulse');
        setTimeout(() => h.classList.remove('is-pulse'), 1000);
      }
    });
  });

  const rippleSel = '.btn, .menu-btn, .tab, .mobile-menu a, .to-top';
  document.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const card = e.target.closest('.card, .profile-card');
    if (card && e.pointerType !== 'mouse') {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      card.classList.add('is-touched');
      clearTimeout(card._tt);
      card._tt = setTimeout(() => card.classList.remove('is-touched'), 650);
    }
    const el = e.target.closest(rippleSel);
    if (!el || !motionOK()) return;
    const r = el.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.setProperty('--s', Math.max(r.width, r.height) * 2.4 + 'px');
    dot.style.setProperty('--x', (e.clientX - r.left) + 'px');
    dot.style.setProperty('--y', (e.clientY - r.top) + 'px');
    el.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
    if (e.pointerType === 'touch') buzz(6);
  }, { passive: true });

  if (fine && motionOK()) {
    document.querySelectorAll('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(1) + 'px');
        b.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => {
        b.style.setProperty('--tx', '0px');
        b.style.setProperty('--ty', '0px');
      });
    });
  }

  const panel = document.getElementById('demo-panel');
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  if (panel && tabs.length) {
    let sx = null, sy = 0;
    panel.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      sx = e.clientX; sy = e.clientY;
    }, { passive: true });
    panel.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) < 56 || Math.abs(dy) > 40) return;
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const next = tabs[i + (dx < 0 ? 1 : -1)];
      if (next) { next.click(); buzz(10); }
    });
    panel.addEventListener('pointercancel', () => { sx = null; });
  }

  document.querySelector('.theme-switch')?.addEventListener('click', () => buzz(10));

  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'to-top';
  top.setAttribute('aria-label', 'Kembali ke atas');
  top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  top.addEventListener('click', () => scrollToY(0));
  document.body.appendChild(top);

  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const stage = document.querySelector('.demo-stage');
  const narrow = matchMedia('(max-width: 900px)');
  let last = scrollY, tick = false;

  const frame = () => {
    tick = false;
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    top.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    top.classList.toggle('is-on', y > 640);

    if (header) {
      const menuOpen = menuBtn && menuBtn.getAttribute('aria-expanded') === 'true';
      const down = y - last > 6, up = last - y > 6;
      if (narrow.matches && !menuOpen && down && y > 240 && !header.contains(document.activeElement)) {
        header.classList.add('is-hidden');
      } else if (up || y < 120 || menuOpen || !narrow.matches) {
        header.classList.remove('is-hidden');
      }
    }
    if (Math.abs(y - last) > 6) last = y;

    if (stage && fine && motionOK() && !narrow.matches && y < innerHeight) {
      stage.style.translate = '0 ' + (-y * 0.045).toFixed(1) + 'px';
    }
  };

  addEventListener('scroll', () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(frame);
  }, { passive: true });
  frame();
})();

// Scroll track & thumb (custom scrollbar)
(() => {
if (window.innerWidth <= 900 || window.matchMedia('(pointer: coarse)').matches) return;

  const track = document.createElement('div');
  track.id = 'finara-scroll-track';
  track.setAttribute('aria-hidden', 'true');

  const thumb = document.createElement('div');
  thumb.id = 'finara-scroll-thumb';

  track.appendChild(thumb);
  document.body.appendChild(track);

  let timer;
  let rafId = 0;
  let dragging = false;
  let startY = 0;
  let startScroll = 0;
  let winHeight = 0;
  let maxScroll = 0;
  let maxTop = 0;

  function measure() {
    const docHeight = document.documentElement.scrollHeight;
    winHeight = window.innerHeight;
    maxScroll = docHeight - winHeight;

    if (maxScroll <= 0) {
      thumb.style.display = 'none';
      return;
    }

    thumb.style.display = 'block';
    const trackHeight = winHeight - 80;
    const thumbHeight = Math.max((winHeight / docHeight) * trackHeight, 48);
    maxTop = trackHeight - thumbHeight;
    thumb.style.height = thumbHeight + 'px';
    updatePosition();
  }

  function updatePosition() {
    if (maxScroll <= 0) return;
    const currentTop = (window.scrollY / maxScroll) * maxTop;
    thumb.style.transform = `translate3d(0, ${currentTop}px, 0)`;
  }

  function reveal() {
    if (maxScroll <= 0) return;
    track.classList.add('is-active');
    clearTimeout(timer);
    if (!dragging) {
      timer = setTimeout(() => {
        track.classList.remove('is-active');
      }, 1000);
    }
  }

  window.addEventListener('scroll', () => {
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        updatePosition();
        rafId = 0;
      });
    }
    reveal();
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    if (!dragging && winHeight && window.innerWidth - e.clientX <= 24) {
      reveal();
    }
  }, { passive: true });

  thumb.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    startY = e.clientY;
    startScroll = window.scrollY;
    thumb.setPointerCapture(e.pointerId);
    track.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
    clearTimeout(timer);
  });

  thumb.addEventListener('pointermove', (e) => {
    if (!dragging || maxTop <= 0) return;
    const delta = e.clientY - startY;
    window.scrollTo({
      top: startScroll + (delta / maxTop) * maxScroll,
      behavior: 'instant'
    });
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    thumb.releasePointerCapture(e.pointerId);
    track.classList.remove('is-dragging');
    document.body.style.userSelect = '';
    reveal();
  };

  thumb.addEventListener('pointerup', endDrag);
  thumb.addEventListener('pointercancel', endDrag);

  new ResizeObserver(measure).observe(document.body);
  window.addEventListener('resize', measure, { passive: true });

  measure();
  reveal();
})();