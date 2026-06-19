/**
 * Supabase-Style Sidebar Navigation
 * Matches the design from Supabase dashboard with sections and clean icons
 */

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { useTranslations } from '../i18n/client';
import Topbar from './Topbar';

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { t } = useTranslations();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navSections = [
    {
      title: t('sideManage'),
      items: [
        { label: t('sideOverview'), href: '/app', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )},
        { label: t('sideAnalytics'), href: '/app/analytics', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )},
        { label: t('sideAuditor'), href: '/app/auditor', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )},
        { label: t('sideProjects'), href: '/app/projects', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )},
      ],
    },
    {
      title: t('sideTeam'),
      items: [
        { label: t('sideMembers'), href: '/app/members', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )},
      ],
    },
    {
      title: t('sideConfig'),
      items: [
        { label: t('sideApiKeys'), href: '/app/keys', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        )},
        { label: t('sideSettings'), href: '/app/settings', icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )},
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-background border-r border-border flex flex-col shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[64px]' : 'w-[220px]'}`}>
          {/* Toggle Button */}
          <div className="px-3 pt-3 flex justify-end">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-background-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              {!isCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-semibold text-text-tertiary tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                        isActive
                          ? 'bg-background-hover text-text-primary font-medium'
                          : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {item.icon}
                      {!isCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Menu */}
        <div className="p-2 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background-hover transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white font-semibold text-[11px] shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[13px] font-medium text-text-primary truncate">
                      {user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate">
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                  <svg className="w-3.5 h-3.5 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/app/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-background-hover hover:text-text-primary transition-colors"
                >
                  {t('sideAccountSettings')}
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/login');
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-background-hover transition-colors"
                >
                  {t('sideSignOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-background">
        <div className="main">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}
