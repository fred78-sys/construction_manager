import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { CrewTradeCount, IssueSeverity, DailyLogPhoto } from '../../lib/types';
import {
  X,
  Camera,
  Trash2,
  HardHat,
  Truck,
  Plus,
} from 'lucide-react';

interface NewDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KENYAN_PHOTO_PRESETS: { title: string; url: string; trade: string }[] = [
  {
    title: 'Suspended RCC slab casting with Bamburi ready-mix & poker vibrators',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
    trade: 'Concrete / Zege',
  },
  {
    title: 'Devki Y16/Y20 rebar tying for elevator shaft core & shear walls',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
    trade: 'Steel / Nondo',
  },
  {
    title: 'Thika machine-cut 9-inch stone walling with hoop iron bonding',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    trade: 'Masonry / Mawe',
  },
  {
    title: 'Formwork shuttering propped with heavy steel acrow props',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
    trade: 'Shuttering / Mbao',
  },
  {
    title: 'Davis & Shirtliff solar booster piping & PPR sleeve pressure test',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80',
    trade: 'Plumbing / Mabomba',
  },
];

export function NewDailyLogModal({ isOpen, onClose }: NewDailyLogModalProps) {
  const { currentUser, visibleProjects, selectedProjectId, createDailyLog } = useApp();

  const [projectId, setProjectId] = useState(selectedProjectId || visibleProjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Sunny & Warm (Kiangazi)');
  const [tempC, setTempC] = useState(24);
  const [weatherNotes, setWeatherNotes] = useState('Good dry conditions; no rain stoppages recorded today.');
  const [materialDeliveries, setMaterialDeliveries] = useState('450 bags Bamburi Tembo Cement (50kg), 1 tipper 25-tonne Machakos River Sand.');
  const [workDone, setWorkDone] = useState('');
  const [issues, setIssues] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<IssueSeverity>('none');
  const [crewBreakdown, setCrewBreakdown] = useState<CrewTradeCount[]>([
    { trade: 'Masons (Wafundi wa Mawe)', count: 6 },
    { trade: 'Steel Fixers (Wafundi wa Chuma / Nondo)', count: 5 },
    { trade: 'Carpenters / Shuttering (Wafundi wa Mbao)', count: 4 },
    { trade: 'Plumbing / Electrical', count: 3 },
    { trade: 'Casual Helpers (Vibarua)', count: 6 },
    { trade: 'Site Clerk & Askaris (Security)', count: 2 },
  ]);
  const [selectedPhotos, setSelectedPhotos] = useState<DailyLogPhoto[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [customPhotoCaption, setCustomPhotoCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalCrew = crewBreakdown.reduce((sum, c) => sum + (c.count || 0), 0);

  const handleUpdateCrewCount = (index: number, delta: number) => {
    setCrewBreakdown((prev) =>
      prev.map((c, idx) =>
        idx === index ? { ...c, count: Math.max(0, c.count + delta) } : c
      )
    );
  };

  const handleAddTradeRow = () => {
    setCrewBreakdown((prev) => [...prev, { trade: 'Specialty Subcontractor', count: 2 }]);
  };

  const handleRemoveTradeRow = (index: number) => {
    setCrewBreakdown((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddPresetPhoto = (preset: typeof KENYAN_PHOTO_PRESETS[0]) => {
    setSelectedPhotos((prev) => [
      ...prev,
      {
        id: 'p-' + Date.now() + Math.random().toString(36).substring(2, 5),
        url: preset.url,
        caption: preset.title,
        tradeTag: preset.trade,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl) return;
    setSelectedPhotos((prev) => [
      ...prev,
      {
        id: 'p-' + Date.now(),
        url: customPhotoUrl,
        caption: customPhotoCaption || 'Site progress capture',
        tradeTag: 'Field Capture',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCustomPhotoUrl('');
    setCustomPhotoCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    setSelectedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) {
      alert('Please describe the work performed on site today.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDailyLog({
        projectId,
        date,
        weather: {
          condition,
          tempC: Number(tempC),
          notes: weatherNotes,
        },
        crew: {
          total: totalCrew,
          breakdown: crewBreakdown,
        },
        materialDeliveries,
        workDone,
        issues: issues || undefined,
        issueSeverity,
        photos: selectedPhotos,
        supervisorName: currentUser.name || 'Brian Otieno',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Submit Kenyan Daily Site Report</h3>
              <p className="text-xs text-slate-400">Log fundis, vibarua, material deliveries, progress & photos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Select Jobsite *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {visibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Date of Report *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Weather Details in °C */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Site Weather Observation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Weather Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                >
                  <option value="Sunny & Warm (Kiangazi)">Sunny & Warm (Kiangazi)</option>
                  <option value="Light Drizzle / Morning Shower">Light Drizzle / Morning Shower</option>
                  <option value="Heavy Rain / Masika (Wet Site)">Heavy Rain / Masika (Wet Site)</option>
                  <option value="Overcast & Windy">Overcast & Windy</option>
                  <option value="Hot Coastal Humid (Mombasa)">Hot Coastal Humid (Mombasa)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Avg Temperature (°C)</label>
                <input
                  type="number"
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Weather Ground Impact</label>
                <input
                  type="text"
                  placeholder="e.g. Ground dry, concrete curing ideal"
                  value={weatherNotes}
                  onChange={(e) => setWeatherNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Crew Headcount with Fundis & Vibarua */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Fundi & Vibarua Headcount (Total: {totalCrew} on Site)
              </span>
              <button
                type="button"
                onClick={handleAddTradeRow}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Trade</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {crewBreakdown.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <input
                    type="text"
                    value={row.trade}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCrewBreakdown((prev) =>
                        prev.map((c, i) => (i === idx ? { ...c, trade: val } : c))
                      );
                    }}
                    className="bg-transparent border-none text-slate-200 text-xs focus:outline-none flex-1 truncate"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateCrewCount(idx, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-amber-400">{row.count}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateCrewCount(idx, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTradeRow(idx)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Material Deliveries */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Material Deliveries to Site Today</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 500 bags Bamburi Tembo Cement, 2 tippers Machakos River Sand, 4 tonnes Devki Y16 rebars"
              value={materialDeliveries}
              onChange={(e) => setMaterialDeliveries(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Work Done Narrative */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Work Performed & Trade Milestones (Narrative) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Poured 4th floor suspended concrete slab, east wing; electrical conduits passed NCC clerk inspection..."
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>

          {/* Issues and Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Site Issues / Interruptions / Delays (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Concrete mixer #2 had belt drive slippage; repaired on-site in 1.5 hrs"
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Severity Tag</label>
              <select
                value={issueSeverity}
                onChange={(e) => setIssueSeverity(e.target.value as IssueSeverity)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="none">None (Smooth Day)</option>
                <option value="minor">Minor Issue</option>
                <option value="moderate">Moderate Delay</option>
                <option value="critical">Critical / Stop-Work Alert</option>
              </select>
            </div>
          </div>

          {/* Photo Documentation with Presets & Custom URL */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Attach Jobsite Verified Photos ({selectedPhotos.length})</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                1-Click Kenyan Construction Photo Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KENYAN_PHOTO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetPhoto(preset)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition"
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-white truncate">{preset.title}</div>
                      <span className="text-[10px] text-amber-400 font-semibold">{preset.trade}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or paste external image URL..."
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shrink-0"
              >
                + Add
              </button>
            </div>

            {selectedPhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {selectedPhotos.map((photo) => (
                  <div key={photo.id} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-amber-500/50">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-md"
            >
              {isSubmitting ? 'Submitting...' : 'Post Daily Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
