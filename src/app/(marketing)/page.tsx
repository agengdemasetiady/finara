import React from 'react';
import LandingEffects from '@/components/landing/LandingEffects';

export default function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten utama
      </a>

      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', overflow: 'hidden' }}
      >
        <symbol id="i-wallet" viewBox="0 0 256 256">
          <path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm0,128H56a8,8,0,0,1-8-8V78.63A23.84,23.84,0,0,0,56,80H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,132Z" />
        </symbol>
        <symbol id="i-chart" viewBox="0 0 256 256">
          <path d="M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z" />
        </symbol>
        <symbol id="i-target" viewBox="0 0 256 256">
          <path d="M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 256 256">
          <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
        </symbol>
        <symbol id="i-bulb" viewBox="0 0 256 256">
          <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 256 256">
          <path d="M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.3,129.3,0,0,1,128,223.62a128.25,128.25,0,0,1-38.92-21.81C61.82,179.51,48,149.3,48,112l0-56,160,0ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z" />
        </symbol>
        <symbol id="i-download" viewBox="0 0 256 256">
          <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 256 256">
          <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
        </symbol>
        <symbol id="i-graduation" viewBox="0 0 256 256">
          <path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z" />
        </symbol>
        <symbol id="i-house" viewBox="0 0 256 256">
          <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z" />
        </symbol>
        <symbol id="i-storefront" viewBox="0 0 256 256">
          <path d="M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96h0v16a40,40,0,0,0,16,32v72a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V144a40,40,0,0,0,16-32V96ZM54,48H202l11.42,40H42.61Zm50,56h48v8a24,24,0,0,1-48,0Zm-16,0v8a24,24,0,0,1-35.12,21.26,7.88,7.88,0,0,0-1.82-1.06A24,24,0,0,1,40,112v-8ZM200,208H56V151.2a40.57,40.57,0,0,0,8,.8,40,40,0,0,0,32-16,40,40,0,0,0,64,0,40,40,0,0,0,32,16,40.57,40.57,0,0,0,8-.8Zm4.93-75.8a8.08,8.08,0,0,0-1.8,1.05A24,24,0,0,1,168,112v-8h48v8A24,24,0,0,1,204.93,132.2Z" />
        </symbol>
        <symbol id="i-list-bullets" viewBox="0 0 256 256">
          <path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z" />
        </symbol>
        <symbol id="i-list" viewBox="0 0 256 256">
          <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
        </symbol>
      </svg>

      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="#top" aria-label="Finara — kembali ke atas">
            <span className="wordmark">
              finara
              <span className="wm-dot" aria-hidden="true">
                .
              </span>
            </span>
          </a>

          <nav className="primary-nav" aria-label="Navigasi utama">
            <a href="#fitur">Fitur</a>
            <a href="#untuk-siapa">Untuk siapa</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#tentang">Tentang</a>
            <a href="#faq">Tanya jawab</a>
          </nav>

          <div className="header-actions">
            <button
              className="theme-switch"
              type="button"
              role="switch"
              aria-checked="false"
              aria-label="Ubah mode warna"
            >
              <span className="theme-track" aria-hidden="true">
                <span className="theme-thumb">
                  <svg className="i-sun" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
                  </svg>
                  <svg className="i-moon" viewBox="0 0 24 24">
                    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
                  </svg>
                </span>
              </span>
            </button>
            <a className="nav-login" href="/masuk">
              Masuk
            </a>
            <a className="btn btn-primary btn-sm" href="/daftar">
              Mulai gratis
            </a>
            <button
              className="menu-btn"
              type="button"
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label="Buka menu"
            >
              <svg className="icon" aria-hidden="true">
                <use href="#i-list" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mobile-menu" id="mobile-menu" hidden>
          <nav aria-label="Navigasi ponsel">
            <a href="#fitur">Fitur</a>
            <a href="#untuk-siapa">Untuk siapa</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#tentang">Tentang</a>
            <a href="#faq">Tanya jawab</a>
            <a href="/masuk">Masuk</a>
            <a href="/daftar">Mulai gratis</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span className="line">
                  <span>Uangmu jelas,</span>
                </span>
                <span className="line">
                  <span>
                    bulananmu{' '}
                    <span className="u">
                      aman.
                      <svg viewBox="0 0 132 12" preserveAspectRatio="none" aria-hidden="true">
                        <path pathLength="1" d="M3 8C40 2 90 2 129 6" />
                      </svg>
                    </span>
                  </span>
                </span>
              </h1>
              <p className="hero-sub">
                Finara membantu pelajar, anak kos, dan pelaku UMKM mencatat uang masuk dan keluar, menjaga anggaran,
                lalu menjelaskan ke mana uangmu pergi dengan bahasa yang mudah dipahami.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="/daftar">
                  Buat akun Finara
                </a>
                <a className="btn btn-ghost" href="#fitur">
                  Lihat fitur
                </a>
              </div>
              <p className="hero-note">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-check" />
                </svg>
                <span>Mencatat transaksi cukup 3 langkah. Tanpa menghubungkan rekening bank.</span>
              </p>
            </div>

            <div className="hero-demo">
              <div className="demo-stage">
                <article className="demo-card" aria-labelledby="demo-title">
                  <div className="demo-head">
                    <p className="demo-kicker" id="demo-title">
                      <span className="demo-dot" aria-hidden="true"></span>Ringkasan bulan ini
                    </p>
                    <div className="tabs" role="tablist" aria-label="Pilih profil contoh">
                      <button
                        className="tab"
                        type="button"
                        role="tab"
                        id="tab-pelajar"
                        aria-controls="demo-panel"
                        aria-selected="true"
                        tabIndex={0}
                        data-profile="pelajar"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-graduation" />
                        </svg>
                        Pelajar
                      </button>
                      <button
                        className="tab"
                        type="button"
                        role="tab"
                        id="tab-kos"
                        aria-controls="demo-panel"
                        aria-selected="false"
                        tabIndex={-1}
                        data-profile="kos"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-house" />
                        </svg>
                        Anak kos
                      </button>
                      <button
                        className="tab"
                        type="button"
                        role="tab"
                        id="tab-umkm"
                        aria-controls="demo-panel"
                        aria-selected="false"
                        tabIndex={-1}
                        data-profile="umkm"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-storefront" />
                        </svg>
                        UMKM
                      </button>
                    </div>
                  </div>

                  <div className="demo-body" aria-live="polite">
                    <div className="demo-panel" role="tabpanel" id="demo-panel" aria-labelledby="tab-pelajar" tabIndex={0}>
                      <div className="demo-summary">
                        <div>
                          <p className="balance-label" id="balance-label">
                            Sisa uang saku
                          </p>
                          <p className="balance" id="balance-value">
                            Rp285.000
                          </p>
                          <p className="balance-note" id="balance-note">
                            dari uang saku Rp500.000
                          </p>
                        </div>
                        <dl className="stats">
                          <div>
                            <dt>Pemasukan</dt>
                            <dd id="income-value">Rp500.000</dd>
                          </div>
                          <div>
                            <dt>Pengeluaran</dt>
                            <dd id="expense-value">Rp215.000</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="chart-block">
                        <div className="chart-head">
                          <p id="chart-label">Pengeluaran 7 hari</p>
                          <p className="chart-total" id="chart-total">
                            Rp215.000
                          </p>
                        </div>
                        <div className="chart" aria-hidden="true">
                          <div className="bar-col">
                            <span className="bar" style={{ '--h': '.48' } as React.CSSProperties}></span>
                            <span className="day">S</span>
                          </div>
                          <div className="bar-col">
                            <span className="bar" style={{ '--h': '.35' } as React.CSSProperties}></span>
                            <span className="day">S</span>
                          </div>
                          <div className="bar-col">
                            <span className="bar" style={{ '--h': '.81' } as React.CSSProperties}></span>
                            <span className="day">R</span>
                          </div>
                          <div className="bar-col">
                            <span className="bar" style={{ '--h': '.31' } as React.CSSProperties}></span>
                            <span className="day">K</span>
                          </div>
                          <div className="bar-col">
                            <span className="bar" style={{ '--h': '.65' } as React.CSSProperties}></span>
                            <span className="day">J</span>
                          </div>
                          <div className="bar-col">
                            <span className="bar" style={{ '--h': '.54' } as React.CSSProperties}></span>
                            <span className="day">S</span>
                          </div>
                          <div className="bar-col">
                            <span className="bar is-last" style={{ '--h': '1' } as React.CSSProperties}></span>
                            <span className="day">M</span>
                          </div>
                        </div>
                        <p className="sr-only" id="chart-summary">
                          Pengeluaran 7 hari terakhir: Senin Rp25.000, Selasa Rp18.000, Rabu Rp42.000, Kamis Rp16.000,
                          Jumat Rp34.000, Sabtu Rp28.000, Minggu Rp52.000.
                        </p>
                      </div>

                      <div className="demo-lower">
                        <div className="budget-mini">
                          <div className="budget-mini-head">
                            <span id="budget-label">Anggaran jajan</span>
                            <span id="budget-percent">80%</span>
                          </div>
                          <progress id="budget-progress" value={120000} max={150000}>
                            80%
                          </progress>
                          <p className="budget-note" id="budget-note">
                            Rp120.000 dari Rp150.000
                          </p>
                        </div>
                        <div className="demo-insight">
                          <svg className="icon" aria-hidden="true">
                            <use href="#i-bulb" />
                          </svg>
                          <p id="insight-text">Jajan bulan ini Rp120.000. Batas aman harianmu Rp19.000.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
                <p className="demo-caption">Contoh tampilan dengan angka ilustrasi.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="fitur" aria-labelledby="fitur-title">
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <h2 id="fitur-title">Semua kebutuhan catatan keuangan di satu tempat</h2>
              <p>Mulai dari mencatat sampai membaca laporan. Semuanya tersambung, tanpa pindah aplikasi.</p>
            </div>

            <div className="bento">
              <article data-reveal="up" className="card card-primary span-3">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-list-bullets" />
                </svg>
                <h3>Catat dalam 3 langkah</h3>
                <p>Pilih jenis, isi nominal dan kategori, lalu simpan. Riwayat bisa dicari dan difilter.</p>
                <div className="tx-demo" aria-hidden="true">
                  <div className="tx-toggle">
                    <span className="tx-pill is-on">Pengeluaran</span>
                    <span className="tx-pill">Pemasukan</span>
                  </div>
                  <p className="tx-amount">
                    <span>Rp</span>18.000
                  </p>
                  <div className="tx-chips">
                    <span className="tx-chip is-on">Jajan</span>
                    <span className="tx-chip">Makan</span>
                    <span className="tx-chip">Transport</span>
                  </div>
                  <div className="tx-steps">
                    <span>
                      <b>1</b>Pilih jenis
                    </span>
                    <span>
                      <b>2</b>Isi nominal &amp; kategori
                    </span>
                    <span>
                      <b>3</b>Simpan
                    </span>
                  </div>
                </div>
              </article>

              <article data-reveal="up" className="card span-3">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-chart" />
                </svg>
                <h3>Dashboard yang mudah dibaca</h3>
                <p>Total pemasukan, pengeluaran, sisa saldo, grafik per kategori dan tren bulanan.</p>
                <div className="cat-summary" aria-hidden="true">
                  <span>
                    Masuk <strong>Rp500.000</strong>
                  </span>
                  <span>
                    Keluar <strong>Rp215.000</strong>
                  </span>
                </div>
                <div className="cat-chart" aria-hidden="true">
                  <div className="cat-row">
                    <span>Makan</span>
                    <span className="cat-track">
                      <span className="cat-fill" style={{ width: '42%' }}></span>
                    </span>
                    <b>42%</b>
                  </div>
                  <div className="cat-row">
                    <span>Jajan</span>
                    <span className="cat-track">
                      <span className="cat-fill" style={{ width: '28%' }}></span>
                    </span>
                    <b>28%</b>
                  </div>
                  <div className="cat-row">
                    <span>Transport</span>
                    <span className="cat-track">
                      <span className="cat-fill" style={{ width: '18%' }}></span>
                    </span>
                    <b>18%</b>
                  </div>
                  <div className="cat-row">
                    <span>Lainnya</span>
                    <span className="cat-track">
                      <span className="cat-fill" style={{ width: '12%' }}></span>
                    </span>
                    <b>12%</b>
                  </div>
                </div>
              </article>

              <article data-reveal="up" className="card span-2">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-wallet" />
                </svg>
                <h3>Anggaran per kategori</h3>
                <p>Tetapkan batas bulanan dan pantau sisanya.</p>
                <div className="mini-budgets" aria-hidden="true">
                  <div className="mini-budget-row">
                    <div className="mini-budget-top">
                      <span>Makan</span>
                      <b>68%</b>
                    </div>
                    <div className="mini-track">
                      <span className="mini-fill" style={{ width: '68%' }}></span>
                    </div>
                  </div>
                  <div className="mini-budget-row">
                    <div className="mini-budget-top">
                      <span>Transport</span>
                      <b>41%</b>
                    </div>
                    <div className="mini-track">
                      <span className="mini-fill" style={{ width: '41%' }}></span>
                    </div>
                  </div>
                  <div className="mini-budget-row">
                    <div className="mini-budget-top">
                      <span>Jajan</span>
                      <b>80%</b>
                    </div>
                    <div className="mini-track">
                      <span className="mini-fill is-high" style={{ width: '80%' }}></span>
                    </div>
                  </div>
                </div>
              </article>

              <article data-reveal="up" className="card span-2">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-target" />
                </svg>
                <h3>Target tabungan</h3>
                <p>Catat setoran dan lihat progres.</p>
                <div className="saving" aria-hidden="true">
                  <p className="saving-label">Sepeda baru</p>
                  <p className="saving-value">
                    Rp1.360.000 <span>dari Rp2.000.000</span>
                  </p>
                  <div className="mini-track">
                    <span className="mini-fill" style={{ width: '68%' }}></span>
                  </div>
                  <p className="saving-meta">
                    <strong>68% terkumpul</strong>
                    <span>Rp640.000 lagi</span>
                  </p>
                </div>
              </article>

              <article data-reveal="up" className="card card-accent span-2">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-bell" />
                </svg>
                <h3>Peringatan dan pengingat</h3>
                <p>Diberi tahu saat pengeluaran mencapai 80% anggaran dan saat tagihan rutin hampir jatuh tempo.</p>
                <div className="alert-list" aria-hidden="true">
                  <div className="alert-item">
                    <span className="alert-mark">!</span>
                    <span>Jajan sudah 80% dari anggaran.</span>
                  </div>
                  <div className="alert-item">
                    <span className="alert-mark">!</span>
                    <span>Kos jatuh tempo 3 hari lagi.</span>
                  </div>
                </div>
              </article>

              <article data-reveal="up" className="card card-insight span-4">
                <div className="insight-copy">
                  <svg className="card-icon" aria-hidden="true">
                    <use href="#i-bulb" />
                  </svg>
                  <h3>Insight otomatis</h3>
                  <p>
                    Bandingkan dengan bulan lalu, lihat kategori terbesar, ketahui batas aman harian. Semua dihitung dari
                    data yang dicatat.
                  </p>
                </div>
                <div className="insight-media" aria-hidden="true">
                  <div className="compare">
                    <div className="compare-row">
                      <span>Bulan lalu</span>
                      <span className="compare-track">
                        <span className="compare-fill" style={{ width: '88%' }}></span>
                      </span>
                      <b>Rp105.000</b>
                    </div>
                    <div className="compare-row">
                      <span>Bulan ini</span>
                      <span className="compare-track">
                        <span className="compare-fill is-now" style={{ width: '100%' }}></span>
                      </span>
                      <b>Rp120.000</b>
                    </div>
                  </div>
                  <div className="insight-foot">
                    <span>
                      Kategori terbesar: <strong>Jajan 42%</strong>
                    </span>
                    <span>
                      Batas aman: <strong>Rp19.000/hari</strong>
                    </span>
                  </div>
                </div>
              </article>

              <article data-reveal="up" className="card card-reports span-2">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-download" />
                </svg>
                <h3>Laporan yang bisa diunduh</h3>
                <p>Ringkasan bulanan dalam PDF atau CSV.</p>
                <div className="file-list" aria-hidden="true">
                  <div className="file">
                    <span className="file-tag">PDF</span>
                    <span>Laporan Agustus</span>
                    <svg className="icon">
                      <use href="#i-download" />
                    </svg>
                  </div>
                  <div className="file">
                    <span className="file-tag">CSV</span>
                    <span>Transaksi Agustus</span>
                    <svg className="icon">
                      <use href="#i-download" />
                    </svg>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="profiles section" id="untuk-siapa" aria-labelledby="profile-title">
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <h2 id="profile-title">Kategori dan saran menyesuaikan profilmu</h2>
              <p>Satu aplikasi, tiga cara pakai. Kategori contoh sudah disiapkan untuk masing-masing profil.</p>
            </div>

            <div className="profile-grid">
              <article data-reveal="up" className="profile-card">
                <svg className="profile-icon" aria-hidden="true">
                  <use href="#i-graduation" />
                </svg>
                <h3>Pelajar dan remaja</h3>
                <p>Catat uang saku dan jajan; menabung untuk barang impian.</p>
                <div className="profile-visual">
                  <div className="mini-goal" aria-hidden="true">
                    <p className="mini-goal-label">Menabung untuk barang impian</p>
                    <div className="mini-goal-top">
                      <span>Sepatu baru</span>
                      <b>62%</b>
                    </div>
                    <div className="mini-track">
                      <span className="mini-fill" style={{ width: '62%' }}></span>
                    </div>
                  </div>
                  <ul className="profile-tags">
                    <li>Uang saku</li>
                    <li>Jajan</li>
                    <li>Tabungan</li>
                  </ul>
                </div>
              </article>

              <article data-reveal="up" className="profile-card">
                <svg className="profile-icon" aria-hidden="true">
                  <use href="#i-house" />
                </svg>
                <h3>Mahasiswa dan anak kos</h3>
                <p>Bagi uang bulanan sampai akhir bulan; pengingat kos, listrik, langganan.</p>
                <div className="profile-visual">
                  <ul className="reminder-list" aria-label="Contoh pengingat tagihan">
                    <li>
                      <span>Kos</span>
                      <span>3 hari lagi</span>
                    </li>
                    <li>
                      <span>Listrik</span>
                      <span>8 hari lagi</span>
                    </li>
                    <li>
                      <span>Langganan</span>
                      <span>12 hari lagi</span>
                    </li>
                  </ul>
                  <ul className="profile-tags">
                    <li>Uang bulanan</li>
                    <li>Tagihan rutin</li>
                    <li>Anggaran harian</li>
                  </ul>
                </div>
              </article>

              <article data-reveal="up" className="profile-card">
                <svg className="profile-icon" aria-hidden="true">
                  <use href="#i-storefront" />
                </svg>
                <h3>Pelaku UMKM</h3>
                <p>Pisahkan pemasukan dan biaya usaha; lihat laba sederhana tiap bulan.</p>
                <div className="profile-visual">
                  <div className="mini-ledger" aria-hidden="true">
                    <div>
                      <span>Pemasukan usaha</span>
                      <b>+</b>
                    </div>
                    <div>
                      <span>Biaya usaha</span>
                      <b>−</b>
                    </div>
                    <div>
                      <span>Laba sederhana</span>
                      <b>=</b>
                    </div>
                  </div>
                  <ul className="profile-tags">
                    <li>Pemasukan</li>
                    <li>Biaya usaha</li>
                    <li>Laba</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="cara-kerja" aria-labelledby="cara-title">
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <h2 id="cara-title">Cara kerja</h2>
              <p>Tiga langkah berurutan. Tidak perlu belajar istilah akuntansi.</p>
            </div>

            <ol data-reveal="in" className="how-panel">
              <li data-reveal="up" className="step">
                <span className="step-num" aria-hidden="true">
                  1
                </span>
                <h3>Daftar dan pilih profil</h3>
                <p>Pakai email dan kata sandi; kategori bawaan langsung siap.</p>
                <div className="step-chips" aria-hidden="true">
                  <span>Pelajar</span>
                  <span>Anak kos</span>
                  <span>UMKM</span>
                </div>
              </li>
              <li data-reveal="up" className="step">
                <span className="step-num" aria-hidden="true">
                  2
                </span>
                <h3>Catat dan atur anggaran</h3>
                <p>Masukkan transaksi, tetapkan batas bulanan per kategori.</p>
                <div className="step-chips" aria-hidden="true">
                  <span>Pemasukan</span>
                  <span>Pengeluaran</span>
                  <span>Anggaran</span>
                </div>
              </li>
              <li data-reveal="up" className="step">
                <span className="step-num" aria-hidden="true">
                  3
                </span>
                <h3>Baca insight, ambil keputusan</h3>
                <p>Lihat dashboard, terima peringatan, unduh laporan.</p>
                <div className="step-chips" aria-hidden="true">
                  <span>Dashboard</span>
                  <span>Peringatan</span>
                  <span>PDF / CSV</span>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="security-section" aria-labelledby="security-title">
          <div className="wrap">
            <div className="security" data-reveal="in">
              <div className="security-copy">
                <svg className="security-icon" aria-hidden="true">
                  <use href="#i-shield" />
                </svg>
                <h2 id="security-title">Datamu hanya bisa dilihat olehmu.</h2>
                <p>
                  Kata sandi disimpan terenkripsi, akses memakai HTTPS, dan data keuangan tiap akun terpisah dari akun
                  lain.
                </p>
              </div>
              <ul className="assurances">
                <li data-reveal="up" className="assurance">
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    <strong>Kata sandi terenkripsi</strong>
                    <span>Kata sandi disimpan dalam bentuk terenkripsi, bukan teks biasa.</span>
                  </span>
                </li>
                <li data-reveal="up" className="assurance">
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    <strong>Akses lewat HTTPS</strong>
                    <span>Data yang berpindah antara kamu dan Finara dilindungi.</span>
                  </span>
                </li>
                <li data-reveal="up" className="assurance">
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    <strong>Data tiap akun terpisah</strong>
                    <span>Catatan keuanganmu tidak bercampur dengan akun lain.</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section about-section" id="tentang" aria-labelledby="tentang-title">
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <h2 id="tentang-title">Tentang Finara dan Kelompok Nirmala</h2>
              <p>
                Finara merupakan singkatan dari Financial Insight, Notes, Analysis, and Reporting Assistant yang
                dirancang sebagai alat bantu edukasi dan perencanaan keuangan.
              </p>
            </div>

            <div className="bento about-bento">
              <article data-reveal="up" className="card span-3">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-bulb" />
                </svg>
                <h3>Cerita dan tujuan Finara</h3>
                <p>
                  Pelajar, anak kos, dan pelaku UMKM sering mencatat transaksi secara terpisah atau mengandalkan ingatan
                  sehingga anggaran bulanan mudah terlewat.
                </p>
                <p>
                  Finara menggabungkan pencatatan transaksi, batas anggaran per kategori, target tabungan, pengingat
                  tagihan, dan evaluasi otomatis dalam satu aplikasi web.
                </p>
              </article>

              <article data-reveal="up" className="card span-3">
                <svg className="card-icon" aria-hidden="true">
                  <use href="#i-shield" />
                </svg>
                <h3>Prinsip kerja sistem</h3>
                <ul className="about-principles">
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      Pencatatan dilakukan manual oleh pengguna tanpa menghubungkan rekening bank atau dompet digital.
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      Insight dihitung menggunakan aturan yang jelas dari data transaksi tanpa kecerdasan buatan.
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>Pencatatan UMKM berfokus pada pemasukan, biaya usaha, dan laba sederhana.</span>
                  </li>
                </ul>
              </article>

              <article data-reveal="up" className="card span-6 team-card">
                <div className="team-head">
                  <div>
                    <h3>Tim pengembang Kelompok Nirmala</h3>
                    <p>
                      Proyek mata kuliah Rekayasa Perangkat Lunak kelas IF26A, Program Studi Informatika, Fakultas Ilmu
                      Komputer, Universitas Amikom Purwokerto.
                    </p>
                  </div>
                  <span className="team-badge">Informatika IF26A</span>
                </div>

                <div className="team-grid">
                  <div className="team-member">
                    <span className="member-role">Ketua Kelompok</span>
                    <p className="member-name">Ageng Dema Setiady</p>
                    <span className="member-nim">26SA11A047</span>
                  </div>
                  <div className="team-member">
                    <span className="member-role">Anggota</span>
                    <p className="member-name">Arya Bima Putra</p>
                    <span className="member-nim">26SA11A160</span>
                  </div>
                  <div className="team-member">
                    <span className="member-role">Anggota</span>
                    <p className="member-name">Muhammad Naufal Nasrulloh</p>
                    <span className="member-nim">26SA11A009</span>
                  </div>
                  <div className="team-member">
                    <span className="member-role">Anggota</span>
                    <p className="member-name">Talitha Nur Isnaini</p>
                    <span className="member-nim">26SA11A137</span>
                  </div>
                  <div className="team-member">
                    <span className="member-role">Anggota</span>
                    <p className="member-name">Al Farel Rafa Prayoga</p>
                    <span className="member-nim">26SA11A161</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="faq" aria-labelledby="faq-title">
          <div className="wrap faq-grid">
            <div className="faq-intro" data-reveal="up">
              <h2 id="faq-title">Tanya jawab</h2>
              <p>Jawaban singkat untuk pertanyaan yang paling sering muncul.</p>
            </div>

            <div className="faq-list">
              <details data-reveal="up" name="faq" open>
                <summary>
                  Apakah Finara terhubung ke rekening bank atau dompet digital?
                  <span className="faq-plus" aria-hidden="true"></span>
                </summary>
                <p>
                  Tidak. Semua pencatatan dilakukan manual oleh pengguna, jadi tidak ada akses ke rekening atau dompet
                  digital.
                </p>
              </details>

              <details data-reveal="up" name="faq">
                <summary>
                  Apakah insight-nya memakai AI?
                  <span className="faq-plus" aria-hidden="true"></span>
                </summary>
                <p>Tidak. Insight dihitung dari aturan yang jelas berdasarkan transaksi yang kamu catat.</p>
              </details>

              <details data-reveal="up" name="faq">
                <summary>
                  Apakah cocok untuk pembukuan usaha lengkap?
                  <span className="faq-plus" aria-hidden="true"></span>
                </summary>
                <p>
                  Finara dibatasi pada pemasukan, biaya usaha, dan laba sederhana. Fitur ini bukan pembukuan lengkap
                  atau pengelolaan stok.
                </p>
              </details>

              <details data-reveal="up" name="faq">
                <summary>
                  Apakah ini pengganti penasihat keuangan?
                  <span className="faq-plus" aria-hidden="true"></span>
                </summary>
                <p>
                  Bukan. Finara adalah alat bantu edukasi dan perencanaan keuangan, bukan pengganti saran dari
                  profesional.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="section contact" id="kontak" aria-labelledby="kontak-title">
          <div className="wrap contact-grid">
            <div className="contact-intro" data-reveal="up">
              <h2 id="kontak-title">Ada pertanyaan atau masukan?</h2>
              <p>Tulis pesanmu di sini. Formulir akan membuka aplikasi email dengan pesan yang sudah terisi.</p>
              <ul className="contact-list">
                <li>
                  <span>Email</span>
                  <a href="mailto:halo@finara.id">halo@finara.id</a>
                </li>
                <li>
                  <span>Tim</span>
                  <span>Kelompok Nirmala, IF26A</span>
                </li>
                <li>
                  <span>Kampus</span>
                  <span>Universitas Amikom Purwokerto</span>
                </li>
              </ul>
            </div>
            <form className="contact-form" data-reveal="up" data-email="halo@finara.id" noValidate>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="nama">Nama</label>
                  <input
                    id="nama"
                    name="nama"
                    type="text"
                    autoComplete="name"
                    required
                    aria-describedby="nama-err"
                    placeholder="Nama lengkap"
                  />
                  <span className="field-err" id="nama-err"></span>
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-describedby="email-err"
                    placeholder="nama@email.com"
                  />
                  <span className="field-err" id="email-err"></span>
                </div>
              </div>
              <div className="field">
                <label htmlFor="topik">Topik</label>
                <select id="topik" name="topik" required aria-describedby="topik-err">
                  <option>Pertanyaan</option>
                  <option>Masukan</option>
                  <option>Laporan masalah</option>
                </select>
                <span className="field-err" id="topik-err"></span>
              </div>
              <div className="field">
                <label htmlFor="pesan">Pesan</label>
                <textarea
                  id="pesan"
                  name="pesan"
                  required
                  aria-describedby="pesan-err"
                  placeholder="Tulis pesanmu"
                ></textarea>
                <span className="field-err" id="pesan-err"></span>
              </div>
              <button className="btn btn-primary" type="submit">
                Kirim pesan
              </button>
              <p className="form-status" role="status" aria-live="polite"></p>
            </form>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <div className="wrap">
            <div className="cta-block" data-reveal="in">
              <div className="cta-copy">
                <h2 id="cta-title">Siap merapikan keuanganmu?</h2>
                <p>Buat akun, pilih profil, dan catat transaksi pertamamu hari ini.</p>
              </div>
              <div className="cta-actions">
                <a className="btn" href="/daftar">
                  Buat akun Finara
                </a>
              </div>
              <span className="cta-watermark wordmark" aria-hidden="true">
                finara
                <span className="wm-dot">.</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid" data-reveal="up">
            <div className="footer-about">
              <a className="footer-brand" href="#top" aria-label="Finara, kembali ke atas">
                <span className="wordmark">
                  finara
                  <span className="wm-dot" aria-hidden="true">
                    .
                  </span>
                </span>
              </a>
              <p className="footer-desc">
                Catatan keuangan harian untuk pelajar, anak kos, dan pelaku UMKM. Uangmu jelas, bulananmu aman.
              </p>
              <p className="footer-badge">
                <span className="badge-dot" aria-hidden="true"></span>
                <span>Pencatatan manual tanpa akses rekening</span>
              </p>
            </div>

            <nav className="footer-col" aria-label="Navigasi bagian halaman">
              <h3>Menu</h3>
              <ul>
                <li>
                  <a href="#fitur">Fitur</a>
                </li>
                <li>
                  <a href="#untuk-siapa">Untuk siapa</a>
                </li>
                <li>
                  <a href="#cara-kerja">Cara kerja</a>
                </li>
                <li>
                  <a href="#tentang">Tentang</a>
                </li>
                <li>
                  <a href="#faq">Tanya jawab</a>
                </li>
                <li>
                  <a href="#kontak">Kontak</a>
                </li>
              </ul>
            </nav>

            <div className="footer-col">
              <h3>Mulai</h3>
              <ul>
                <li>
                  <a href="/daftar">Buat akun Finara</a>
                </li>
                <li>
                  <a href="#kontak">Kirim masukan</a>
                </li>
                <li>
                  <a href="mailto:halo@finara.id">halo@finara.id</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-legal">
              <p>© 2026 Finara. Seluruh hak cipta dilindungi.</p>
              <p>Dikembangkan oleh Kelompok Nirmala, Informatika Universitas Amikom Purwokerto.</p>
            </div>
          </div>
        </div>
      </footer>

      <LandingEffects />
    </>
  );
}
