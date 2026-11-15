/** @format */

'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShowcase from '../components/AuthShowcase';
import AlertBanner from '../components/AlertBanner';
import { apiPost, ApiError } from '../lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (newPassword.length < 8 || newPassword.length > 20) {
      return 'Password harus 8 sampai 20 karakter.';
    }
    if (newPassword !== confirmPassword) {
      return 'Konfirmasi password tidak cocok.';
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
    setLoading(true);
    try {
      await apiPost('/auth/reset-password', { token, newPassword });
      setSuccess('Password berhasil diubah. Silakan login kembali.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401 ?
          'Token tidak valid atau sudah kedaluwarsa.'
        : err instanceof ApiError ? err.message
        : 'Terjadi kesalahan.',
      );
      setLoading(false);
    }
  };

  // Token kosong -> tampilkan notice, tanpa form
  if (!token) {
    return (
      <>
        <AlertBanner
          type='error'
          message='Link reset tidak valid atau sudah kedaluwarsa.'
        />
        <Link
          href='/forgot-password'
          className='btn-continue'
          style={{ textAlign: 'center', textDecoration: 'none' }}>
          Request a new link
        </Link>
      </>
    );
  }

  return (
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
        <label htmlFor='newPassword'>New password</label>
        <div className='input-wrapper'>
          <input
            type={showPassword ? 'text' : 'password'}
            id='newPassword'
            name='newPassword'
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError('');
            }}
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

      <div className='form-group'>
        <label htmlFor='confirmPassword'>Confirm password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id='confirmPassword'
          name='confirmPassword'
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          placeholder='Repeat your password'
          required
        />
      </div>

      <button
        type='submit'
        className='btn-continue'
        disabled={loading || !!success}>
        {loading ? 'Saving...' : 'Reset password'}
      </button>

      <p className='form-secondary-link'>
        <Link href='/login'>Back to sign in</Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              <h1>Set a new password</h1>
              <p>Choose a new password for your account.</p>
            </div>
          </header>

          {/* useSearchParams wajib dibungkus Suspense di Next.js */}
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
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
