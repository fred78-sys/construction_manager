import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { UserRole } from '../lib/types';
import { DEMO_USERS } from '../lib/seed-data';
import { Shield, UserCheck, HardHat, Building2, ChevronDown, Check, RefreshCw, Sparkles } from 'lucide-react';

export function RoleSwitcher() {
  const { currentUser, switchUserRole, resetToSampleData } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const rolesConfig: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'admin',
      label: 'Admin / Owner & MD',
      icon: Shield,
      color: 'bg-indigo-600 text-white',
      desc: 'Full visibility: all Kenyan projects, BQ financials, M-Pesa payroll, team & statutory filings',
    },
    {
      role: 'pm',
      label: 'Project Manager (PM)',
      icon: UserCheck,
      color: 'bg-blue-600 text-white',
      desc: 'Manages assigned projects, BQ rates, schedules, contractor claims, logs & permits',
    },
    {
      role: 'supervisor',
      label: 'Site Supervisor / Agent',
      icon: HardHat,
      color: 'bg-amber-600 text-white',
      desc: 'Jobsite phone view: 1-touch daily logs, fundi & vibarua crew breakdown, site deliveries & photos',
    },
    {
      role: 'client',
      label: 'Client (Simba Ridge)',
      icon: Building2,
      color: 'bg-emerald-600 text-white',
      desc: 'Read-only portal: milestone timeline, % complete, site photos & progress reports',
    },
  ];

  const handleReset = async () => {
    setIsResetting(true);
    await resetToSampleData();
    setTimeout(() => setIsResetting(false), 600);
  };

  const currentConfig = rolesConfig.find((r) => r.role === currentUser.role) || rolesConfig[0];
  const IconComponent = currentConfig.icon;

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs sm:text-sm font-medium transition shadow-sm"
        >
          <span className={`p-1 rounded ${currentConfig.color}`}>
            <IconComponent className="w-3.5 h-3.5" />
          </span>
          <div className="text-left hidden sm:block">
            <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-slate-700">
                {currentConfig.label}
              </span>
            </div>
          </div>
          <div className="text-left sm:hidden">
            <span className="font-semibold text-xs text-slate-100">{currentConfig.label}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Reset sample Kenyan construction data"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Reset Demo</span>
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3 bg-slate-950/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch Active Persona
                </span>
                <span className="text-[11px] text-amber-400 font-medium">Kenyan Construction RBAC</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Experience SiteFlow from each Kenyan jobsite stakeholder's perspective:
              </p>
            </div>

            <div className="p-2 space-y-1">
              {rolesConfig.map((item) => {
                const isSelected = currentUser.role === item.role;
                const ItemIcon = item.icon;
                const demoUser = DEMO_USERS.find((u) => u.role === item.role);

                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      switchUserRole(item.role);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition ${
                      isSelected
                        ? 'bg-amber-500/10 border border-amber-500/30 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className={`p-2 rounded-lg shrink-0 mt-0.5 ${item.color}`}>
                      <ItemIcon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-xs text-amber-300/90 font-medium">
                        {demoUser?.name} — {demoUser?.companyTitle}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-950/60 text-center">
              <span className="text-[11px] text-slate-400">
                NCA, NEMA & County Permitted Kenya System • Real-Time Firestore
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
