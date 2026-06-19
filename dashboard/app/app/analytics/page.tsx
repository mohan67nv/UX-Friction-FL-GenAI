'use client';
import { useTranslations } from '../../i18n/client';

export default function AnalyticsPage() {
  const { t } = useTranslations();
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('dashAnaTitle')}</h1>
        <p className="text-text-secondary">
          {t('dashAnaSub')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-background-panel border border-border rounded-lg p-6">
          <div className="text-text-tertiary text-sm font-medium mb-2">{t('dashTotalEvents')}</div>
          <div className="text-text-primary text-3xl font-bold">12,453</div>
          <div className="text-brand text-sm mt-2">+15.3% {t('dashFromLastWeek')}</div>
        </div>

        <div className="bg-background-panel border border-border rounded-lg p-6">
          <div className="text-text-tertiary text-sm font-medium mb-2">{t('dashRageClicks')}</div>
          <div className="text-text-primary text-3xl font-bold">342</div>
          <div className="text-error text-sm mt-2">+8.2% {t('dashFromLastWeek')}</div>
        </div>

        <div className="bg-background-panel border border-border rounded-lg p-6">
          <div className="text-text-tertiary text-sm font-medium mb-2">{t('dashFormStruggles')}</div>
          <div className="text-text-primary text-3xl font-bold">189</div>
          <div className="text-warning text-sm mt-2">+3.1% {t('dashFromLastWeek')}</div>
        </div>

        <div className="bg-background-panel border border-border rounded-lg p-6">
          <div className="text-text-tertiary text-sm font-medium mb-2">{t('dashAvgIntensity')}</div>
          <div className="text-text-primary text-3xl font-bold">6.8</div>
          <div className="text-text-tertiary text-sm mt-2">{t('dashOutOf10')}</div>
        </div>
      </div>

      {/* Friction Events Table */}
      <div className="bg-background-panel border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">{t('dashRecentTitle')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-elevated">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  {t('dashColType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  {t('dashColPage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  {t('dashColCount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  {t('dashColIntensity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  {t('dashColTime')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { type: 'Rage Click', page: '/checkout', count: 45, intensity: 8.5, time: '2 hours ago' },
                { type: 'Form Struggle', page: '/signup', count: 32, intensity: 7.2, time: '3 hours ago' },
                { type: 'Hesitation', page: '/pricing', count: 28, intensity: 6.8, time: '5 hours ago' },
                { type: 'Rapid Back', page: '/products', count: 21, intensity: 5.5, time: '8 hours ago' },
                { type: 'Dead Click', page: '/contact', count: 15, intensity: 4.2, time: '12 hours ago' },
              ].map((event, idx) => (
                <tr key={idx} className="hover:bg-background-hover transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.type === 'Rage Click' ? 'bg-error/20 text-error' :
                      event.type === 'Form Struggle' ? 'bg-warning/20 text-warning' :
                      'bg-info/20 text-info'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">
                    {event.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">
                    {event.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-background-elevated rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand"
                          style={{ width: `${(event.intensity / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary">{event.intensity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                    {event.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State Message */}
      <div className="mt-8 bg-background-panel border border-border rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('dashDemoTitle')}
        </h3>
        <p className="text-text-secondary mb-4">
          {t('dashDemoSub')}
        </p>
        <button className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-md font-medium transition-colors">
          {t('dashDemoBtn')}
        </button>
      </div>
    </div>
  );
}
