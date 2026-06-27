import clsx from 'clsx';

export default function Loader({ size = 'md', className = '', text }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <div className="relative">
        <div className={clsx(sizes[size], 'rounded-full border-[3px] border-emerald-100')} />
        <div className={clsx(sizes[size], 'absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-600 animate-spin')} />
      </div>
      {text && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-100 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        <div className="flex justify-between">
          <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-50">
      <div className="h-10 w-10 rounded-full skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
      </div>
      <div className="h-6 w-20 skeleton" />
    </div>
  );
}
