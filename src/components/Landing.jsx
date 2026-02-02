import './Landing.css';
import { Hero } from '@/components/ui/animated-hero';
import { FeaturesBento } from '@/components/ui/features-bento';
import { HighlightsDisplay } from '@/components/ui/highlights-display';

function Landing({ onGetStarted }) {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="nav-content flex justify-between items-center py-4">
            <div className="logo flex items-center gap-2">
              <span className="logo-icon text-2xl">◆</span>
              <span className="logo-text text-xl font-bold">مبنا</span>
            </div>
            <button className="btn-nav px-4 py-2 rounded-md hover:bg-accent transition-colors" onClick={onGetStarted}>
              ورود / ثبت‌نام
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with new animated component */}
      <div className="pt-16">
        <Hero onGetStarted={onGetStarted} />
      </div>

      {/* Features Section */}
      <section className="features">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">قابلیت‌های کلیدی مبنا</h2>
            <p className="section-subtitle">
              ابزارهای قدرتمند برای مدیریت حرفه‌ای اهداف و وظایف تیم شما
            </p>
          </div>

          <FeaturesBento />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="sprints">
        <div className="section-container">
          <div className="section-header-center">
            <h2 className="section-title">چرا مبنا؟</h2>
            <p className="section-subtitle">
              ارزش‌های اصلی که مبنا را متمایز می‌کند
            </p>
          </div>

          <HighlightsDisplay />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="logo-icon text-2xl">◆</span>
              <span className="logo-text text-xl font-bold">مبنا</span>
              <span className="text-muted-foreground mr-4">© ۲۰۲۵ تمامی حقوق محفوظ است</span>
            </div>
            
            <div className="flex flex-wrap gap-8 text-sm">
              <a href="#" className="hover:text-primary transition-colors">قابلیت‌ها</a>
              <a href="#" className="hover:text-primary transition-colors">درباره ما</a>
              <a href="#" className="hover:text-primary transition-colors">تماس با ما</a>
              <a href="#" className="hover:text-primary transition-colors">راهنما</a>
              <a href="#" className="hover:text-primary transition-colors">پشتیبانی</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
