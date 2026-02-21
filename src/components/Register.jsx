import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  useEffect(() => {
    fetchDefaultOrganization();
  }, []);

  const fetchDefaultOrganization = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/organizations/default`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      } else {
        console.warn('Could not fetch default organization');
      }
    } catch (err) {
      console.error('Error fetching default organization:', err);
    } finally {
      setLoadingOrg(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');
    setLoading(true);

    // کلاینت ولیدیشن ساده
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('ایمیل معتبر نیست');
      setLoading(false);
      return;
    }
    if ((formData.password || '').length < 6) {
      setValidationError('حداقل طول رمز عبور 6 کاراکتر است');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setValidationError('رمز عبور و تکرار آن یکسان نیستند');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        organization_id: organization?.id || 'default-org-afagh-saram'
      };
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (response.ok) {
        onRegister(data.token, data.user);
      } else {
        const detail = data.error || data.message || (Array.isArray(data.errors) ? data.errors.join(', ') : '');
        setError(detail ? `ثبت‌نام ناموفق: ${detail}` : `ثبت‌نام ناموفق (کد ${response.status})`);
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-section">
      {validationError && <div className="error-message">{validationError}</div>}
      {error && <div className="error-message">{error}</div>}
      <div className="section-intro">
        <div className="intro-icon">👤</div>
        <div className="intro-text">
          <div className="intro-title">پیوستن به سازمان</div>
          <div className="intro-subtitle">
            {loadingOrg ? (
              'در حال بارگذاری...'
            ) : organization ? (
              `شما به سازمان ${organization.name} اضافه خواهید شد`
            ) : (
              'ثبت‌نام در سیستم'
            )}
          </div>
          <ul className="intro-list">
            <li>نام و ایمیل معتبر</li>
            <li>رمز عبور حداقل ۶ کاراکتر</li>
            {organization && <li>سازمان: {organization.name}</li>}
          </ul>
        </div>
      </div>
      
      <div className="form-group">
        <label>نام و نام خانوادگی</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          placeholder="علی احمدی"
        />
      </div>

      <div className="form-group">
        <label>ایمیل</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="ali@example.com"
        />
      </div>

      <div className="form-group">
        <label>رمز عبور</label>
        <div className="form-row">
          <div className="form-col">
            <input
              type={showPasswords ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="حداقل 6 کاراکتر"
            />
          </div>
          <div className="form-col">
            <input
              type={showPasswords ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              placeholder="تکرار رمز عبور"
            />
          </div>
        </div>
        <div className="toggle-row">
          <label style={{ fontSize: '13px', color: '#666' }}>
            <input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} style={{ marginLeft: '6px' }} />
            نمایش رمزها
          </label>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading || loadingOrg}>
        {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </button>
    </form>
  );
}

export default Register;
