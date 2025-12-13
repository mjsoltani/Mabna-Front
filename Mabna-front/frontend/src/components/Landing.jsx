import './Landing.css';

function Landing({ onGetStarted }) {
  return (
    <div className="landing">
      {/* Hero Section */}
      <header className="hero">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">◆</span>
              <span className="logo-text">مبنا</span>
            </div>
            <button className="btn-nav" onClick={onGetStarted}>
              ورود / ثبت‌نام
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">پلتفرم مدیریت برنامه‌ریزی</div>
          <h1 className="hero-title">
            برنامه‌ریزی هوشمند،
            <br />
            <span className="gradient-text">نتایج قابل اندازه‌گیری</span>
          </h1>
          <p className="hero-description">
            مبنا، پلتفرمی برای مدیریت اهداف و نتایج کلیدی (OKR) که در ۴ اسپرینت
            <br />
            به تیم شما کمک می‌کند تا برنامه‌ریزی دقیق‌تر و اجرای بهتری داشته باشید
          </p>
          <div className="hero-actions">
            <button className="btn-primary-large" onClick={onGetStarted}>
              شروع کنید
              <span className="btn-arrow">←</span>
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">۴</div>
              <div className="stat-label">اسپرینت توسعه</div>
            </div>
            <div className="stat">
              <div className="stat-number">۱۰۰٪</div>
              <div className="stat-label">شفافیت اهداف</div>
            </div>
            <div className="stat">
              <div className="stat-number">∞</div>
              <div className="stat-label">امکانات رشد</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">قابلیت‌های کلیدی مبنا</h2>
            <p className="section-subtitle">
              ابزارهای قدرتمند برای مدیریت حرفه‌ای اهداف و وظایف تیم شما
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">🎯</div>
              <h3>مدیریت اهداف (OKR)</h3>
              <p>
                تعریف اهداف استراتژیک و نتایج کلیدی قابل اندازه‌گیری برای تیم خود
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">✅</div>
              <h3>مدیریت وظایف</h3>
              <p>
                ایجاد و تخصیص وظایف به اعضای تیم با لینک مستقیم به نتایج کلیدی
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">📊</div>
              <h3>گزارش‌گیری پیشرفته</h3>
              <p>
                مشاهده پیشرفت اهداف و عملکرد تیم در یک نگاه با داشبورد تحلیلی
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">👥</div>
              <h3>همکاری تیمی</h3>
              <p>
                مدیریت چند سازمان، دعوت اعضا و تعیین نقش‌های مختلف برای کاربران
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon red">🔒</div>
              <h3>امنیت بالا</h3>
              <p>
                احراز هویت JWT، مجوزدهی سطح سازمانی و حفاظت کامل از داده‌ها
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon teal">⚡</div>
              <h3>عملیات تراکنشی</h3>
              <p>
                ایجاد وظایف با لینک به چند KR در یک تراکنش واحد و ایمن
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sprints Section */}
      <section className="sprints">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">نقشه راه توسعه مبنا</h2>
            <p className="section-subtitle">
              پلتفرم مبنا در ۴ اسپرینت به صورت تدریجی توسعه می‌یابد
            </p>
          </div>

          <div className="sprints-timeline">
            <div className="sprint-card completed">
              <div className="sprint-badge">✓ تکمیل شده</div>
              <h3>اسپرینت ۱</h3>
              <p className="sprint-title">پایه‌گذاری سیستم OKR</p>
              <ul className="sprint-features">
                <li>احراز هویت و مدیریت کاربران</li>
                <li>ایجاد و مدیریت اهداف</li>
                <li>تعریف نتایج کلیدی</li>
                <li>ایجاد وظایف با لینک به KR</li>
              </ul>
            </div>

            <div className="sprint-card upcoming">
              <div className="sprint-badge">در حال توسعه</div>
              <h3>اسپرینت ۲</h3>
              <p className="sprint-title">پیشرفت و گزارش‌گیری</p>
              <ul className="sprint-features">
                <li>ثبت پیشرفت وظایف</li>
                <li>محاسبه خودکار پیشرفت KR</li>
                <li>داشبورد تحلیلی</li>
                <li>نمودارهای پیشرفت</li>
              </ul>
            </div>

            <div className="sprint-card upcoming">
              <div className="sprint-badge">آینده</div>
              <h3>اسپرینت ۳</h3>
              <p className="sprint-title">همکاری و اعلان‌ها</p>
              <ul className="sprint-features">
                <li>سیستم نوتیفیکیشن</li>
                <li>کامنت و بحث روی وظایف</li>
                <li>تاریخچه تغییرات</li>
                <li>دعوت اعضای جدید</li>
              </ul>
            </div>

            <div className="sprint-card upcoming">
              <div className="sprint-badge">آینده</div>
              <h3>اسپرینت ۴</h3>
              <p className="sprint-title">یکپارچه‌سازی و گسترش</p>
              <ul className="sprint-features">
                <li>API عمومی</li>
                <li>اتصال به ابزارهای خارجی</li>
                <li>گزارش‌های سفارشی</li>
                <li>تنظیمات پیشرفته</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>آماده شروع هستید؟</h2>
          <p>همین حالا به مبنا بپیوندید و تجربه مدیریت حرفه‌ای را آغاز کنید</p>
          <button className="btn-cta" onClick={onGetStarted}>
            شروع کنید
            <span className="btn-arrow">←</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">◆</span>
              <span className="logo-text">مبنا</span>
            </div>
            <p>پلتفرم مدیریت برنامه‌ریزی</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>محصول</h4>
              <a href="#">قابلیت‌ها</a>
              <a href="#">قیمت‌گذاری</a>
              <a href="#">مستندات</a>
            </div>
            <div className="footer-column">
              <h4>شرکت</h4>
              <a href="#">درباره ما</a>
              <a href="#">تماس با ما</a>
              <a href="#">وبلاگ</a>
            </div>
            <div className="footer-column">
              <h4>پشتیبانی</h4>
              <a href="#">راهنما</a>
              <a href="#">سوالات متداول</a>
              <a href="#">پشتیبانی</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ۲۰۲۵ مبنا. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
