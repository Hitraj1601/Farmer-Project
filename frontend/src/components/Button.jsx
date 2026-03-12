import clsx from 'clsx';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizes = {
  sm: 'text-sm py-1.5 px-4',
  md: '',
  lg: 'text-lg py-3 px-8',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }) {
  return (
    <button
      className={clsx(variants[variant], sizes[size], className, loading && 'relative !text-transparent')}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
