/** @format */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthShowcase from '../components/AuthShowcase';
import AlertBanner from '../components/AlertBanner';
import { apiPost, ApiError } from '../lib/api';

const SUCCESS_MESSAGE =
  'Jika email terdaftar, instruksi reset akan dikirimkan.';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiPost('/auth/forgot-password', { email });
      setSuccess(SUCCESS_MESSAGE);
    } catch (err) {
      // Backend bisa membalas 401 untuk email yang tidak terdaftar.
      // Tampilkan pesan netral yang sama supaya tidak membocorkan
      // apakah email tersebut terdaftar atau tidak.
      if (err instanceof ApiError && err.status === 401) {
        setSuccess(SUCCESS_MESSAGE);
      } else {
        setError(err instanceof ApiError ? err.message : 'Terjadi kesalahan.');
      }
    } finally {
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
              <h1>Forgot your password?</h1>
              <p>Enter your email and we will send you reset instructions.</p>
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
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                placeholder='grace@org.com'
                required
              />
            </div>

            <button
              type='submit'
              className='btn-continue'
              disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>

            <p className='form-secondary-link'>
              Remember your password? <Link href='/login'>Back to sign in</Link>
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
