import React from 'react';
import { useApp } from '../lib/context';
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Camera,
  Phone,
  Mail,
  HardHat,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { ProjectStatusBadge } from './StatusBadge';

export function ClientPortalView() {
  const {
    visibleProjects,
    dailyLogs,
    tasks,
  } = useApp();

  const project = visibleProjects[0];

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        No active project assigned to this client account.
      </div>
    );
  }

  const projectLogs = dailyLogs.filter((l) => l.projectId === project.id);

  const milestones = [
    { title: 'Phase 1: Substructure, Excavation & Basement Retaining Walls', status: 'completed', date: 'April - May 2026', desc: 'Basement raft foundation poured (Bamburi Powercrete 42.5N, passed 28-day cube crushing tests).' },
    { title: 'Phase 2: RCC Superstructure & Suspended Slabs (1st to 4th Floor)', status: 'completed', date: 'June - August 2026', desc: 'Devki Y16/Y20 high-yield rebars tied and cast-in-situ columns completed.' },
    { title: 'Phase 3: Masonry Walling & MEP Rough-In', status: 'in_progress', date: 'Sept - Oct 2026', desc: 'Thika machine-cut 9" stones, electrical conduits & Davis & Shirtliff plumbing lines underway (68% complete).' },
    { title: 'Phase 4: Roofing Trusses (MRM) & Exterior Plaster', status: 'upcoming', date: 'Oct - Nov 2026', desc: 'MRM Ultra-Span galvanized steel trusses, wall plastering and floor screeding.' },
    { title: 'Phase 5: Interior Finishes, Lifts & Handover', status: 'upcoming', date: 'Nov - Dec 2026', desc: 'Otis dual elevator installation, Crown paints, NCC final inspection & certificate of occupation.' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Client Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                🔒 Client Stakeholder Portal
              </span>
              <span className="text-xs text-slate-400">Simba Ridge Real Estate & Safaricom Investment SACCO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {project.address}, {project.county} County
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Target Handover: <strong>{project.endDate}</strong>
              </span>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 text-center sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Verified Overall Handover Progress</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-0.5">
              {project.percentComplete}%
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">● On Track for December 2026</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 shadow-lg"
              style={{ width: `${project.percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Groundbreaking: {project.startDate}</span>
            <span>Handover Date: {project.endDate}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Milestones & Jobsite Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Project Construction Milestones</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current execution across scheduled development phases in Nairobi.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative space-y-1">
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    m.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : m.status === 'in_progress'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  {m.status === 'completed' ? '✓' : idx + 1}
                </div>

                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-bold ${
                      m.status === 'completed'
                        ? 'text-white'
                        : m.status === 'in_progress'
                        ? 'text-amber-300 font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{m.date}</span>
                </div>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <span>Your General Contractor Team</span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct contacts for site queries, inspections & architect updates.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{project.pmName}</div>
                  <div className="text-[11px] text-slate-400">Senior Project Manager & Architect (BORAQS)</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+254733410822"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Call PM"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="mailto:wanjiku.kamau@siteflow.ke"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Email PM"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Eng. Haron Mwangi</div>
                  <div className="text-[11px] text-slate-400">Managing Director / Lead Engineer (EBK)</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+254722550199"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Call MD"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="mailto:admin@siteflow.ke"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Email MD"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Brian Otieno</div>
                  <div className="text-[11px] text-slate-400">Lead Site Agent (NCA Certified)</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+254712884901"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Call Site Agent"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Kenyan Statutory Approvals & Compliance</span>
            </h2>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block">NCA Project Registration</span>
                  <span className="text-[10px] text-slate-400">#NCA/PR/2026/0842 (Category NCA 1)</span>
                </div>
                <span className="text-emerald-400 font-bold">Active & Certified</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block">Nairobi City County (NCC) Permit</span>
                  <span className="text-[10px] text-slate-400">#NCC/DP/2026/04128 (Stamped Drawings)</span>
                </div>
                <span className="text-emerald-400 font-bold">Approved</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-semibold block">NEMA EIA License</span>
                  <span className="text-[10px] text-slate-400">#NEMA/EIA/PSPR/28419</span>
                </div>
                <span className="text-emerald-400 font-bold">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Verified Jobsite Photos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>Live Jobsite Photo Documentation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verified progress captures directly from the site agent in Nairobi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectLogs.flatMap((l) => l.photos || []).slice(0, 6).map((photo) => (
            <div
              key={photo.id}
              className="group relative h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              {photo.tradeTag && (
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-800">
                  {photo.tradeTag}
                </span>
              )}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-semibold leading-snug">{photo.caption}</p>
                {photo.timestamp && (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Logged at {photo.timestamp}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
