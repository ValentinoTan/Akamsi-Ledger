import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Player, SkillLevel, Playstyle } from '../../types';
import { X, User, Phone, Check } from 'lucide-react';

interface PlayerModalProps {
  playerToEdit?: Player | null;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ playerToEdit, onClose }) => {
  const { addPlayer, updatePlayer } = useApp();

  const [name, setName] = useState(playerToEdit?.name || '');
  const [phone, setPhone] = useState(playerToEdit?.phone || '');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(playerToEdit?.skill_level || 'intermediate');
  const [playstyle, setPlaystyle] = useState<Playstyle>(playerToEdit?.playstyle || 'all-round');
  const [notes, setNotes] = useState(playerToEdit?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mohon masukkan nama pemain.');
      return;
    }

    if (playerToEdit) {
      updatePlayer({
        ...playerToEdit,
        name,
        phone,
        skill_level: skillLevel,
        playstyle,
        notes,
      });
    } else {
      addPlayer({
        name,
        phone,
        skill_level: skillLevel,
        playstyle,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-white/60 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-grainient-mint/60 via-grainient-teal/20 to-grainient-cyan/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-grainient-button text-white flex items-center justify-center shadow-grainient-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {playerToEdit ? 'Edit Profil Anggota' : 'Tambah Anggota Baru'}
              </h2>
              <p className="text-[11px] text-slate-600">Database member & data matchmaking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Lengkap / Panggilan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kevin Sanjaya"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 text-xs font-semibold"
            />
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nomor WhatsApp (Untuk Reminder Iuran)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 text-xs"
              />
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Tingkat Kemahiran (Skill Level)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'beginner', label: 'Beginner', desc: 'Pemula' },
                  { id: 'intermediate', label: 'Intermediate', desc: 'Menengah' },
                  { id: 'advanced', label: 'Advanced', desc: 'Mahir / Pro' },
                ] as const
              ).map((lvl) => {
                const isSelected = skillLevel === lvl.id;
                return (
                  <button
                    type="button"
                    key={lvl.id}
                    onClick={() => setSkillLevel(lvl.id)}
                    className={`p-2.5 rounded-xl text-center border transition ${
                      isSelected
                        ? 'bg-grainient-mint/70 border-grainient-teal text-grainient-darkTeal font-extrabold shadow-sm ring-1 ring-grainient-teal/50'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs">{lvl.label}</p>
                    <span className="text-[10px] opacity-75 font-normal">{lvl.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playstyle */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Gaya Bermain Dominan (Playstyle)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'front-court', label: 'Front-court', desc: 'Netting & Servis' },
                  { id: 'rear-court', label: 'Rear-court', desc: 'Smash & Lob' },
                  { id: 'all-round', label: 'All-Round', desc: 'Fleksibel' },
                ] as const
              ).map((pst) => {
                const isSelected = playstyle === pst.id;
                return (
                  <button
                    type="button"
                    key={pst.id}
                    onClick={() => setPlaystyle(pst.id)}
                    className={`p-2.5 rounded-xl text-center border transition ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-800 font-extrabold shadow-sm ring-1 ring-sky-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs">{pst.label}</p>
                    <span className="text-[10px] opacity-75 font-normal">{pst.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Raket Astrox 88D, biasa main malam"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-grainient-teal/40 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 rounded-2xl bg-grainient-button text-white font-extrabold shadow-grainient-glow hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{playerToEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
