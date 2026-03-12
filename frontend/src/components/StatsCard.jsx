export default function StatsCard({ title, value, icon: Icon, color = 'green', trend, subtitle }) {
  const themes = {
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/10' },
    blue:   { bg: 'bg-blue-50 dark:bg-blue-950',    text: 'text-blue-600 dark:text-blue-400',    ring: 'ring-blue-500/10' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950',  text: 'text-purple-600 dark:text-purple-400',  ring: 'ring-purple-500/10' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950',  text: 'text-orange-600 dark:text-orange-400',  ring: 'ring-orange-500/10' },
    yellow: { bg: 'bg-amber-50 dark:bg-amber-950',   text: 'text-amber-600 dark:text-amber-400',   ring: 'ring-amber-500/10' },
    red:    { bg: 'bg-red-50 dark:bg-red-950',     text: 'text-red-600 dark:text-red-400',     ring: 'ring-red-500/10' },
  };

  const theme = themes[color] || themes.green;

  return (
    <div className="card p-5 group hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white tracking-tight">{value}</p>
          {trend && (
            <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {trend}
            </p>
          )}
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl ${theme.bg} ${theme.text} ring-4 ${theme.ring}
                         group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
