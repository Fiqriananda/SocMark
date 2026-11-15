/** @format */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthShowcase from '../components/AuthShowcase';
import AlertBanner from '../components/AlertBanner';
import { apiPost, ApiError } from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (form.displayName.trim().length < 3) {
      return 'Nama lengkap minimal 3 karakter.';
    }
    if (form.username.trim().length < 3) {
      return 'Username minimal 3 karakter.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Format email tidak valid.';
    }
    if (form.password.length < 8 || form.password.length > 20) {
      return 'Password harus 8 sampai 20 karakter.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiPost('/auth/register', {
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      // 409: "Username atau Email sudah terdaftar" ikut tampil dari backend
      setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan.');
      setLoading(false);
    }
  };

  return (
    <main className='auth-page'>
      <article className='auth-left'>
        <div className='auth-form-wrapper'>
          <header className='auth-brand-wrapper'>
            <Link
              href='/'
              className='brand-icon-box'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <rect
                  width='18'
                  height='18'
                  x='3'
                  y='3'
                  rx='5'
                />
                <circle
                  cx='8.5'
                  cy='9.5'
                  r='1.5'
                  fill='currentColor'
                />
                <circle
                  cx='15.5'
                  cy='9.5'
                  r='1.5'
                  fill='currentColor'
                />
                <path d='M8.5 14.5c1 1.5 2.5 2 3.5 2s2.5-.5 3.5-2' />
              </svg>
            </Link>
            <div className='auth-header'>
              <h1>Create your account</h1>
              <p>Join SocMark by filling in the details below.</p>
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            noValidate>
            <AlertBanner
              type='error'
              message={error}
            />
            <AlertBanner
              type='success'
              message={success}
            />

            <div className='form-group'>
              <label htmlFor='displayName'>Full name</label>
              <input
                type='text'
                id='displayName'
                name='displayName'
                value={form.displayName}
                onChange={handleChange}
                placeholder='Grace Hopper'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='username'>Username</label>
              <input
                type='text'
                id='username'
                name='username'
                value={form.username}
                onChange={handleChange}
                placeholder='gracehopper'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                placeholder='grace@org.com'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='password'>Password</label>
              <div className='input-wrapper'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  name='password'
                  value={form.password}
                  onChange={handleChange}
                  placeholder='8-20 characters'
                  required
                />
                <button
                  type='button'
                  className='input-icon-btn'
                  aria-label='Toggle password visibility'
                  onClick={() => setShowPassword(!showPassword)}>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    {showPassword ?
                      <>
                        <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                        <circle
                          cx='12'
                          cy='12'
                          r='3'
                        />
                      </>
                    : <>
                        <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' />
                        <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' />
                        <path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' />
                        <line
                          x1='2'
                          x2='22'
                          y1='2'
                          y2='22'
                        />
                      </>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='btn-continue'
              disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className='form-secondary-link'>
              Already have an account? <Link href='/login'>Sign in</Link>
            </p>
          </form>
        </div>

        <footer className='auth-bottom-terms'>
          <p>
            By continuing, you agree to our <a href='#'>Terms of Service</a> and{' '}
            <a href='#'>Privacy Policy</a>.
          </p>
        </footer>
      </article>

      <AuthShowcase />
    </main>
  );
}
