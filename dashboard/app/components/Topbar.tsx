'use client';

import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background-panel h-11 shrink-0">
      <div className="flex items-center gap-2.5 text-[13px] text-text-secondary">
        <div className="w-5 h-5 rounded-[4px] bg-brand flex items-center justify-center text-background font-bold text-[11px]">
          P
        </div>
        
        <span className="text-text-primary font-medium hover:text-white cursor-pointer transition-colors">ZeroBanner</span>
        
        <span className="text-[10px] font-semibold bg-background-elevated border border-border px-1.5 py-0.5 rounded text-text-tertiary tracking-wider">
          FREE
        </span>

        <span className="text-text-tertiary">/</span>

        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-text-primary font-medium hover:text-white cursor-pointer transition-colors">ZeroBanner-FL-GenAI</span>
        </span>

        <span className="text-text-tertiary">/</span>

        <span className="flex items-center gap-1.5 text-text-primary hover:text-white cursor-pointer transition-colors">
          main
        </span>

        <span className="text-[10px] font-semibold border border-brand/40 text-brand bg-brand/10 px-1.5 py-0.5 rounded tracking-wider">
          PRODUCTION
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 px-2.5 py-1 bg-brand/10 text-brand border border-brand/20 rounded-md hover:bg-brand/20 transition-colors text-xs font-semibold">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Connect
        </button>

        <div className="h-4 w-px bg-border"></div>

        <div className="flex items-center gap-3 text-text-secondary">
          <button className="hover:text-text-primary transition-colors text-xs font-medium">Feedback</button>
          
          <button className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-md hover:border-text-tertiary transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[11px]">Search...</span>
            <span className="text-[9px] px-1 py-0.5 bg-background-elevated rounded border border-border text-text-tertiary ml-1.5">Ctrl K</span>
          </button>
        </div>
      </div>
    </header>
  );
}
