'use client';

import { useEffect } from 'react';

type TrackedElement = HTMLElement & {
  _v?: number;
  _raf?: number;
  _t?: ReturnType<typeof setTimeout>;
  _tt?: ReturnType<typeof setTimeout>;
  _anims?: Animation[] | null;
};

export function initLanding(): () => void {
  const root = document.documentElement;
  if (root.dataset.finaraLandingActive === '1') {
    return () => {};
  }
  root.dataset.finaraLandingActive = '1';

  const controller = new AbortController();
  const { signal } = controller;

  const timers = new Set<ReturnType<typeof setTimeout>>();
  const rafs = new Set<number>();
  const observers: (IntersectionObserver | ResizeObserver)[] = [];
  let createdTopBtn: HTMLButtonElement | null = null;
  let createdScrollTrack: HTMLDivElement | null = null;

  const safeTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const safeRaf = (fn: FrameRequestCallback) => {
    const id = requestAnimationFrame((now) => {
      rafs.delete(id);
      fn(now);
    });
    rafs.add(id);
    return id;
  };

  /* Finara: utilitas angka dan animasi */
  const idr = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });

  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tween(el: TrackedElement | null, to: number, dur = 850) {
    if (!el) return;
    const from = el._v || 0;
    el._v = to;
    if (!motionOK() || from === to) {
      el.textContent = idr.format(to);
      return;
    }
    if (el._raf) {
      cancelAnimationFrame(el._raf);
      rafs.delete(el._raf);
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = idr.format(Math.round(from + (to - from) * e));
      if (k < 1) {
        el._raf = safeRaf(step);
      }
    };
    el._raf = safeRaf(step);
  }

  /* ===== Demo interaktif profil & menu ponsel ===== */
  (() => {
    const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panel = document.getElementById('demo-panel');
    const demoBody = document.querySelector<HTMLElement>('.demo-body');
    let shimmerTimer: ReturnType<typeof setTimeout> | null = null;

    const data: Record<
      string,
      {
        balanceLabel: string;
        balance: number;
        balanceNote: string;
        income: number;
        expense: number;
        chartLabel: string;
        chart: number[];
        budgetLabel: string;
        budgetValue: number;
        budgetMax: number;
        insight: string;
      }
    > = {
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
        insight: 'Jajan bulan ini Rp120.000. Batas aman harianmu Rp19.000.',
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
        insight: 'Batas aman Rp103.000 per hari. Tagihan kos jatuh tempo 3 hari lagi.',
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
        insight: 'Biaya bahan baku naik 14% dari bulan lalu.',
      },
    };

    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const els = {
      balanceLabel: document.getElementById('balance-label'),
      balance: document.getElementById('balance-value') as TrackedElement | null,
      balanceNote: document.getElementById('balance-note'),
      income: document.getElementById('income-value') as TrackedElement | null,
      expense: document.getElementById('expense-value') as TrackedElement | null,
      chartLabel: document.getElementById('chart-label'),
      chartTotal: document.getElementById('chart-total') as TrackedElement | null,
      chartSummary: document.getElementById('chart-summary'),
      budgetLabel: document.getElementById('budget-label'),
      budgetPercent: document.getElementById('budget-percent'),
      budgetProgress: document.getElementById('budget-progress') as HTMLProgressElement | null,
      budgetNote: document.getElementById('budget-note'),
      insight: document.getElementById('insight-text'),
    };
    const bars = Array.from(document.querySelectorAll<HTMLElement>('.chart .bar'));

    function selectTab(tab: HTMLButtonElement, moveFocus: boolean) {
      const profileKey = tab.dataset.profile || '';
      const profile = data[profileKey];
      if (!profile || !panel) return;

      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });

      panel.setAttribute('aria-labelledby', tab.id);

      if (demoBody && motionOK()) {
        if (shimmerTimer) {
          clearTimeout(shimmerTimer);
          timers.delete(shimmerTimer);
        }
        demoBody.classList.remove('is-loading');
        void demoBody.offsetWidth;
        demoBody.classList.add('is-loading');
        shimmerTimer = safeTimeout(() => demoBody.classList.remove('is-loading'), 360);
      }

      const chartSum = profile.chart.reduce((total, value) => total + value, 0);

      if (els.balanceLabel) els.balanceLabel.textContent = profile.balanceLabel;
      tween(els.balance, profile.balance);
      if (els.balanceNote) els.balanceNote.textContent = profile.balanceNote;
      tween(els.income, profile.income);
      tween(els.expense, profile.expense);
      if (els.chartLabel) els.chartLabel.textContent = profile.chartLabel;
      tween(els.chartTotal, chartSum);
      if (els.budgetLabel) els.budgetLabel.textContent = profile.budgetLabel;
      if (els.budgetPercent)
        els.budgetPercent.textContent = Math.round((profile.budgetValue / profile.budgetMax) * 100) + '%';
      if (els.budgetProgress) {
        els.budgetProgress.value = profile.budgetValue;
        els.budgetProgress.max = profile.budgetMax;
      }
      if (els.budgetNote)
        els.budgetNote.textContent = idr.format(profile.budgetValue) + ' dari ' + idr.format(profile.budgetMax);
      if (els.insight) els.insight.textContent = profile.insight;

      const max = Math.max(...profile.chart);
      bars.forEach((bar, index) => {
        bar.style.setProperty('--h', (profile.chart[index] / max).toFixed(3));
        bar.classList.toggle('is-last', index === bars.length - 1);
      });

      if (els.chartSummary) {
        els.chartSummary.textContent =
          profile.chartLabel +
          ': ' +
          profile.chart.map((value, index) => dayNames[index] + ' ' + idr.format(value)).join(', ') +
          '.';
      }

      if (moveFocus) tab.focus();

      if (motionOK() && panel.animate) {
        panel.animate(
          [
            { opacity: 0.65, transform: 'translateY(4px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)' }
        );
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab, false), { signal });

      tab.addEventListener(
        'keydown',
        (event) => {
          let target: HTMLButtonElement | null = null;
          if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
          if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
          if (event.key === 'Home') target = tabs[0];
          if (event.key === 'End') target = tabs[tabs.length - 1];
          if (!target) return;
          event.preventDefault();
          selectTab(target, true);
        },
        { signal }
      );
    });

    const menuButton = document.querySelector<HTMLButtonElement>('.menu-btn');
    const menu = document.getElementById('mobile-menu') as TrackedElement | null;

    if (menuButton && menu) {
      menu.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', String(i)));

      const setMenu = (open: boolean) => {
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        if (menu._t) {
          clearTimeout(menu._t);
          timers.delete(menu._t);
        }
        if (open) {
          menu.classList.remove('is-closing');
          menu.hidden = false;
          return;
        }
        if (menu.hidden) return;
        if (!motionOK()) {
          menu.hidden = true;
          return;
        }
        menu.classList.add('is-closing');
        menu._t = safeTimeout(() => {
          menu.hidden = true;
          menu.classList.remove('is-closing');
        }, 300);
      };

      menuButton.addEventListener(
        'click',
        () => {
          setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
        },
        { signal }
      );

      document.addEventListener(
        'click',
        (event) => {
          if (menuButton.getAttribute('aria-expanded') !== 'true') return;
          const target = event.target as Node | null;
          if ((target && menu.contains(target)) || (target && menuButton.contains(target))) return;
          setMenu(false);
        },
        { signal }
      );

      document.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
          setMenu(false);
          menuButton.focus();
        },
        { signal }
      );

      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenu(false), { signal });
      });

      window.addEventListener(
        'resize',
        () => {
          if (window.innerWidth > 900) setMenu(false);
        },
        { signal }
      );
    }
  })();

  /* ===== Tema terang/gelap ===== */
  (() => {
    const btn = document.querySelector<HTMLButtonElement>('.theme-switch');
    const meta = document.getElementById('meta-theme') as HTMLMetaElement | null;
    const KEY = 'finara-theme';
    if (!btn) return;

    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      btn.setAttribute('aria-checked', String(dark));
      if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
    };

    const apply = (theme: string) => {
      root.dataset.theme = theme;
      sync();
    };

    const set = (theme: string, x: number, y: number) => {
      try {
        localStorage.setItem(KEY, theme);
      } catch (_) {}
      if (!motionOK()) return apply(theme);
      const docWithVt = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      };
      if (!docWithVt.startViewTransition) {
        root.classList.add('theme-fade');
        apply(theme);
        safeTimeout(() => root.classList.remove('theme-fade'), 450);
        return;
      }
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = docWithVt.startViewTransition(() => apply(theme));
      vt.ready
        .then(() =>
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 750, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' }
          )
        )
        .catch(() => {});
    };

    btn.addEventListener(
      'click',
      () => {
        const b = btn.getBoundingClientRect();
        set(root.dataset.theme === 'dark' ? 'light' : 'dark', b.left + b.width / 2, b.top + b.height / 2);
      },
      { signal }
    );

    matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      (e) => {
        let saved: string | null = null;
        try {
          saved = localStorage.getItem(KEY);
        } catch (_) {}
        if (!saved) apply(e.matches ? 'dark' : 'light');
      },
      { signal }
    );

    sync();
  })();

  /* ===== Animasi, sorot kartu, tilt demo, scrollspy, dan header ===== */
  (() => {
    const $$ = <T extends HTMLElement = HTMLElement>(s: string, c: ParentNode = document) =>
      Array.from(c.querySelectorAll<T>(s));

    $$(
      '.alert-list,.file-list,.reminder-list,.mini-ledger,.cat-chart,.mini-budgets,.compare,.step-chips,.profile-tags,.tx-chips,.tx-steps,.team-grid,.about-principles,.contact-list'
    ).forEach((c) => Array.from(c.children).forEach((ch, i) => (ch as HTMLElement).style.setProperty('--k', String(i))));

    $$('.hero .bar').forEach((b, i) => b.style.setProperty('--n', String(i)));

    $$('.card, .profile-card').forEach((card) => {
      card.addEventListener(
        'pointermove',
        (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', e.clientX - rect.left + 'px');
          card.style.setProperty('--my', e.clientY - rect.top + 'px');
        },
        { signal }
      );
    });

    const demoStage = document.querySelector<HTMLElement>('.demo-stage');
    const demoCard = document.querySelector<HTMLElement>('.demo-card');
    if (demoStage && demoCard && motionOK()) {
      demoStage.addEventListener(
        'pointermove',
        (e) => {
          if (e.pointerType !== 'mouse') return;
          const rect = demoStage.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          demoCard.style.setProperty('--rx', (-ny * 4).toFixed(2) + 'deg');
          demoCard.style.setProperty('--ry', (nx * 5).toFixed(2) + 'deg');
        },
        { signal }
      );

      demoStage.addEventListener(
        'pointerleave',
        () => {
          demoCard.style.setProperty('--rx', '0deg');
          demoCard.style.setProperty('--ry', '0deg');
        },
        { signal }
      );
    }

    const SPRING = (() => {
      if (!(window.CSS && CSS.supports('animation-timing-function', 'linear(0, 1)')))
        return 'cubic-bezier(.34, 1.56, .64, 1)';
      const N = 56,
        pts = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        pts.push(i === N ? 1 : +(1 - Math.exp(-6.5 * t) * Math.cos(9.5 * t)).toFixed(4));
      }
      return 'linear(' + pts.join(', ') + ')';
    })();
    const SOFT = 'cubic-bezier(.22, 1, .36, 1)';

    const reveal = (el: HTMLElement, delay: number) => {
      el.style.setProperty('--d', delay + 'ms');
      el.classList.add('is-in');
      if (!el.animate) return;

      if (!motionOK()) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay, easing: 'ease-out', fill: 'backwards' });
        return;
      }

      let from = 'translateY(80px) scale(.93)',
        dur = 1200,
        ease = SPRING;
      if (el.matches('.section-head, .faq-intro, .contact-intro')) {
        from = 'translateY(36px)';
        dur = 950;
        ease = SOFT;
      } else if (el.getAttribute('data-reveal') === 'in') {
        from = 'translateY(46px) scale(.9)';
        dur = 1250;
      }

      el.animate(
        [
          { opacity: 0, transform: from, filter: 'blur(10px)' },
          { opacity: 1, filter: 'blur(0px)', offset: 0.3 },
          { opacity: 1, transform: 'none', filter: 'blur(0px)' },
        ],
        { duration: dur, delay, easing: ease, fill: 'backwards' }
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left
          )
          .forEach((e, i) => {
            reveal(e.target as HTMLElement, Math.min(i, 5) * 110);
            io.unobserve(e.target);
          });
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );
    observers.push(io);

    $$('[data-reveal]').forEach((el) => io.observe(el));

    if (motionOK()) {
      const nums = ['balance-value', 'income-value', 'expense-value', 'chart-total']
        .map((id) => document.getElementById(id) as TrackedElement | null)
        .filter((el): el is TrackedElement => Boolean(el));
      const final = nums.map((n) => parseInt((n.textContent || '0').replace(/\D/g, ''), 10));
      nums.forEach((n) => {
        n.textContent = idr.format(0);
        n._v = 0;
      });
      safeTimeout(() => nums.forEach((n, i) => tween(n, final[i], 1200)), 550);
    }

    const links = $$<HTMLAnchorElement>('.primary-nav a');
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => {
            const active = a.getAttribute('href') === '#' + e.target.id;
            if (active) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    observers.push(spy);

    $$('main section[id]').forEach((s) => spy.observe(s));

    const header = document.querySelector<HTMLElement>('.site-header');
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      safeRaf(() => {
        if (header) header.classList.toggle('is-scrolled', scrollY > 8);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true, signal });
    onScroll();
  })();

  /* ===== Formulir kontak (membuka aplikasi email pengguna) ===== */
  (() => {
    const form = document.querySelector<HTMLFormElement>('.contact-form');
    if (!form) return;
    const status = form.querySelector<HTMLElement>('.form-status');

    const check = (f: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      const err = document.getElementById(f.id + '-err');
      let msg = '';
      if (!f.value.trim()) msg = 'Wajib diisi.';
      else if (f instanceof HTMLInputElement && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value))
        msg = 'Format email belum benar.';
      f.setAttribute('aria-invalid', String(Boolean(msg)));
      if (err) err.textContent = msg;
      return !msg;
    };

    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]').forEach((f) => {
      f.addEventListener(
        'input',
        () => {
          if (f.getAttribute('aria-invalid') === 'true') check(f);
        },
        { signal }
      );
    });

    form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        const fields = Array.from(
          form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]')
        );
        const bad = fields.filter((f) => !check(f));
        if (bad.length) {
          bad[0].focus();
          if (status) status.textContent = '';
          return;
        }
        const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value.trim();
        const subject = encodeURIComponent('[Finara] ' + v('topik'));
        const body = encodeURIComponent('Nama: ' + v('nama') + '\nEmail: ' + v('email') + '\n\n' + v('pesan'));
        if (status) {
          status.textContent =
            'Aplikasi emailmu akan terbuka dengan pesan ini. Jika tidak terbuka, kirim langsung ke ' +
            form.dataset.email +
            '.';
        }
        location.href = 'mailto:' + form.dataset.email + '?subject=' + subject + '&body=' + body;
      },
      { signal }
    );
  })();

  /* ===== FAQ: buka/tutup meluncur halus ===== */
  (() => {
    const list = document.querySelector<HTMLElement>('.faq-list');
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLDetailsElement & TrackedElement>('details'));
    const EASE_OPEN = 'cubic-bezier(.22, 1, .36, 1)';
    const EASE_CLOSE = 'cubic-bezier(.65, 0, .35, 1)';

    list.classList.add('is-enhanced');
    items.forEach((d) => {
      d.removeAttribute('name');
      d.classList.toggle('is-open', d.open);
    });

    const closedHeight = (d: HTMLDetailsElement) => {
      const cs = getComputedStyle(d);
      const summary = d.querySelector('summary');
      return (
        (summary ? summary.offsetHeight : 0) +
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        parseFloat(cs.borderTopWidth) +
        parseFloat(cs.borderBottomWidth)
      );
    };

    const cleanup = (d: HTMLDetailsElement & TrackedElement) => {
      d._anims = null;
      d.style.height = '';
      d.style.willChange = '';
    };

    const stop = (d: HTMLDetailsElement & TrackedElement) => {
      if (d._anims) d._anims.forEach((a) => a.cancel());
      cleanup(d);
    };

    function toggle(d: HTMLDetailsElement & TrackedElement, open: boolean) {
      const body = d.querySelector('p');
      const startH = d.getBoundingClientRect().height;
      stop(d);
      d.classList.toggle('is-open', open);

      if (!motionOK() || !d.animate || !body) {
        d.open = open;
        d.classList.remove('is-closing');
        return;
      }

      d.style.willChange = 'height';

      if (open) {
        d.classList.remove('is-closing');
        d.open = true;
        const endH = d.getBoundingClientRect().height;
        const a1 = d.animate({ height: [startH + 'px', endH + 'px'] }, { duration: 520, easing: EASE_OPEN });
        const a2 = body.animate(
          [
            { opacity: 0, transform: 'translateY(-10px)', filter: 'blur(3px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
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
        const a1 = d.animate({ height: [startH + 'px', endH + 'px'] }, { duration: 400, easing: EASE_CLOSE });
        const a2 = body.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-6px)' },
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
      if (!summary) return;
      summary.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          const willOpen = !d.classList.contains('is-open');
          if (willOpen) {
            items.forEach((o) => {
              if (o !== d && o.classList.contains('is-open')) toggle(o, false);
            });
          }
          toggle(d, willOpen);
        },
        { signal }
      );
    });
  })();

  /* ===== Polesan: scroll mulus antar-bagian, header cerdas, ripple sentuh, magnet, geser demo, tombol ke atas ===== */
  (() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const buzz = (ms = 8) => {
      if (motionOK() && navigator.vibrate) {
        try {
          navigator.vibrate(ms);
        } catch (_) {}
      }
    };

    let scrollToken = 0;
    const scrollToY = (y: number) =>
      new Promise<void>((resolve) => {
        const from = scrollY;
        const dist = y - from;
        const token = ++scrollToken;
        if (!motionOK() || Math.abs(dist) < 2) {
          scrollTo({ top: y, behavior: 'instant' });
          return resolve();
        }
        const dur = Math.min(1200, 480 + Math.abs(dist) * 0.16);
        const t0 = performance.now();
        const step = (now: number) => {
          if (token !== scrollToken) return resolve();
          const k = Math.min(1, (now - t0) / dur);
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          scrollTo({ top: from + dist * e, behavior: 'instant' });
          if (k < 1) safeRaf(step);
          else resolve();
        };
        safeRaf(step);
      });

    ['wheel', 'touchstart', 'keydown'].forEach((t) =>
      window.addEventListener(
        t,
        () => {
          scrollToken++;
        },
        { passive: true, signal }
      )
    );

    document.addEventListener(
      'click',
      (e) => {
        const targetEl = e.target as Element | null;
        const a = targetEl?.closest<HTMLAnchorElement>('a[href^="#"]');
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        const href = a.getAttribute('href') || '';
        const id = decodeURIComponent(href.slice(1));
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
            void (h as HTMLElement).offsetWidth;
            h.classList.add('is-pulse');
            safeTimeout(() => h.classList.remove('is-pulse'), 1000);
          }
        });
      },
      { signal }
    );

    const rippleSel = '.btn, .menu-btn, .tab, .mobile-menu a, .to-top';
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (e.button > 0) return;
        const targetEl = e.target as Element | null;
        const card = targetEl?.closest<TrackedElement>('.card, .profile-card');
        if (card && e.pointerType !== 'mouse') {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', e.clientX - r.left + 'px');
          card.style.setProperty('--my', e.clientY - r.top + 'px');
          card.classList.add('is-touched');
          if (card._tt) {
            clearTimeout(card._tt);
            timers.delete(card._tt);
          }
          card._tt = safeTimeout(() => card.classList.remove('is-touched'), 650);
        }
        const el = targetEl?.closest<HTMLElement>(rippleSel);
        if (!el || !motionOK()) return;
        const r = el.getBoundingClientRect();
        const dot = document.createElement('span');
        dot.className = 'ripple';
        dot.setAttribute('aria-hidden', 'true');
        dot.style.setProperty('--s', Math.max(r.width, r.height) * 2.4 + 'px');
        dot.style.setProperty('--x', e.clientX - r.left + 'px');
        dot.style.setProperty('--y', e.clientY - r.top + 'px');
        el.appendChild(dot);
        dot.addEventListener('animationend', () => dot.remove(), { once: true, signal });
        if (e.pointerType === 'touch') buzz(6);
      },
      { passive: true, signal }
    );

    if (fine && motionOK()) {
      document.querySelectorAll<HTMLElement>('.btn').forEach((b) => {
        b.addEventListener(
          'pointermove',
          (e) => {
            const r = b.getBoundingClientRect();
            b.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(1) + 'px');
            b.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(1) + 'px');
          },
          { signal }
        );
        b.addEventListener(
          'pointerleave',
          () => {
            b.style.setProperty('--tx', '0px');
            b.style.setProperty('--ty', '0px');
          },
          { signal }
        );
      });
    }

    const panel = document.getElementById('demo-panel');
    const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    if (panel && tabs.length) {
      let sx: number | null = null,
        sy = 0;
      panel.addEventListener(
        'pointerdown',
        (e) => {
          if (e.pointerType === 'mouse') return;
          sx = e.clientX;
          sy = e.clientY;
        },
        { passive: true, signal }
      );
      panel.addEventListener(
        'pointerup',
        (e) => {
          if (sx === null) return;
          const dx = e.clientX - sx,
            dy = e.clientY - sy;
          sx = null;
          if (Math.abs(dx) < 56 || Math.abs(dy) > 40) return;
          const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
          const next = tabs[i + (dx < 0 ? 1 : -1)];
          if (next) {
            next.click();
            buzz(10);
          }
        },
        { signal }
      );
      panel.addEventListener(
        'pointercancel',
        () => {
          sx = null;
        },
        { signal }
      );
    }

    document.querySelector('.theme-switch')?.addEventListener('click', () => buzz(10), { signal });

    const top = document.createElement('button');
    top.type = 'button';
    top.className = 'to-top';
    top.setAttribute('aria-label', 'Kembali ke atas');
    top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    top.addEventListener('click', () => scrollToY(0), { signal });
    document.body.appendChild(top);
    createdTopBtn = top;

    const header = document.querySelector<HTMLElement>('.site-header');
    const menuBtn = document.querySelector<HTMLButtonElement>('.menu-btn');
    const stage = document.querySelector<HTMLElement>('.demo-stage');
    const narrow = matchMedia('(max-width: 900px)');
    let last = scrollY,
      tick = false;

    const frame = () => {
      tick = false;
      const y = scrollY;
      const max = root.scrollHeight - innerHeight;
      top.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
      top.classList.toggle('is-on', y > 640);

      if (header) {
        const menuOpen = menuBtn && menuBtn.getAttribute('aria-expanded') === 'true';
        const down = y - last > 6,
          up = last - y > 6;
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

    window.addEventListener(
      'scroll',
      () => {
        if (tick) return;
        tick = true;
        safeRaf(frame);
      },
      { passive: true, signal }
    );
    frame();
  })();

  /* ===== Custom Scrollbar Desktop Auto-Hide ===== */
  (() => {
    if (window.innerWidth <= 900 || window.matchMedia('(pointer: coarse)').matches) return;

    const track = document.createElement('div');
    track.id = 'finara-scroll-track';
    track.setAttribute('aria-hidden', 'true');

    const thumb = document.createElement('div');
    thumb.id = 'finara-scroll-thumb';

    track.appendChild(thumb);
    document.body.appendChild(track);
    createdScrollTrack = track;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let rafId = 0;
    let dragging = false;
    let startY = 0;
    let startScroll = 0;
    let winHeight = 0;
    let maxScroll = 0;
    let maxTop = 0;

    function updatePosition() {
      if (maxScroll <= 0) return;
      const currentTop = (window.scrollY / maxScroll) * maxTop;
      thumb.style.transform = `translate3d(0, ${currentTop}px, 0)`;
    }

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

    function reveal() {
      if (maxScroll <= 0) return;
      track.classList.add('is-active');
      if (timer) {
        clearTimeout(timer);
        timers.delete(timer);
      }
      if (!dragging) {
        timer = safeTimeout(() => {
          track.classList.remove('is-active');
        }, 1000);
      }
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!rafId) {
          rafId = safeRaf(() => {
            updatePosition();
            rafId = 0;
          });
        }
        reveal();
      },
      { passive: true, signal }
    );

    window.addEventListener(
      'mousemove',
      (e) => {
        if (!dragging && winHeight && window.innerWidth - e.clientX <= 24) {
          reveal();
        }
      },
      { passive: true, signal }
    );

    thumb.addEventListener(
      'pointerdown',
      (e) => {
        e.preventDefault();
        dragging = true;
        startY = e.clientY;
        startScroll = window.scrollY;
        thumb.setPointerCapture(e.pointerId);
        track.classList.add('is-dragging');
        document.body.style.userSelect = 'none';
        if (timer) {
          clearTimeout(timer);
          timers.delete(timer);
        }
      },
      { signal }
    );

    thumb.addEventListener(
      'pointermove',
      (e) => {
        if (!dragging || maxTop <= 0) return;
        const delta = e.clientY - startY;
        window.scrollTo({
          top: startScroll + (delta / maxTop) * maxScroll,
          behavior: 'instant',
        });
      },
      { signal }
    );

    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      thumb.releasePointerCapture(e.pointerId);
      track.classList.remove('is-dragging');
      document.body.style.userSelect = '';
      reveal();
    };

    thumb.addEventListener('pointerup', endDrag, { signal });
    thumb.addEventListener('pointercancel', endDrag, { signal });

    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    observers.push(ro);

    window.addEventListener('resize', measure, { passive: true, signal });

    measure();
    reveal();
  })();

  return () => {
    controller.abort();
    observers.forEach((obs) => obs.disconnect());
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    rafs.forEach((id) => cancelAnimationFrame(id));
    rafs.clear();
    if (createdTopBtn) {
      createdTopBtn.remove();
      createdTopBtn = null;
    }
    if (createdScrollTrack) {
      createdScrollTrack.remove();
      createdScrollTrack = null;
    }
    delete root.dataset.finaraLandingActive;
  };
}

export default function LandingEffects() {
  useEffect(() => {
    return initLanding();
  }, []);

  return null;
}
