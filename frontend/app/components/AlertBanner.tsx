/** @format */

type AlertBannerProps = {
  type: 'error' | 'success';
  message: string;
};

export default function AlertBanner({ type, message }: AlertBannerProps) {
  if (!message) return null;

  return (
    <div
      className={`alert-banner alert-${type}`}
      role={type === 'error' ? 'alert' : 'status'}>
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'>
        {type === 'error' ?
          <>
            <circle
              cx='12'
              cy='12'
              r='10'
            />
            <line
              x1='12'
              x2='12'
              y1='8'
              y2='12'
            />
            <line
              x1='12'
              x2='12.01'
              y1='16'
              y2='16'
            />
          </>
        : <>
            <circle
              cx='12'
              cy='12'
              r='10'
            />
            <path d='m9 12 2 2 4-4' />
          </>
        }
      </svg>
      <span>{message}</span>
    </div>
  );
}
