import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Loader2, Lock, Crown, Pencil, Trash2, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useFamilyProfile, FamilyProfile } from "@/contexts/FamilyProfileContext";
import { toast } from "sonner";

const MAX_CHILD_PROFILES = 4;

const AVATARS = ["🧒","👦","👧","🧑","👱","🧔","🧕","🧓","👴","👵","⭐","🌙","📚","✨","🦁","🐯"];

const PROFILE_COLORS = [
  "from-emerald-600 to-teal-600",
  "from-violet-600 to-purple-600",
  "from-amber-600 to-orange-600",
  "from-sky-600 to-blue-600",
  "from-rose-600 to-pink-600",
  "from-lime-600 to-green-600",
];

function profileColor(id: string) {
  const idx = id.charCodeAt(0) % PROFILE_COLORS.length;
  return PROFILE_COLORS[idx];
}

interface DBProfile {
  id: string;
  owner_id: string;
  display_name: string;
  avatar: string;
  level: "niveau_1" | "niveau_2";
  pin: string | null;
}

export default function Famille() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isFamille, loading: subLoading } = useSubscription();
  const { setActiveProfile } = useFamilyProfile();

  const [profiles, setProfiles] = useState<DBProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Create / edit dialog
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DBProfile | null>(null);
  const [formName, setFormName] = useState("");
  const [formAvatar, setFormAvatar] = useState("🧒");
  const [formLevel, setFormLevel] = useState<"niveau_1" | "niveau_2">("niveau_1");
  const [formPin, setFormPin] = useState("");
  const [formPinEnabled, setFormPinEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // PIN unlock dialog
  const [pinTarget, setPinTarget] = useState<DBProfile | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Deleting
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || subLoading) return;
    if (!isFamille) { setLoadingData(false); return; }
    fetchProfiles();
  }, [user, isFamille, subLoading]);

  const fetchProfiles = async () => {
    if (!user) return;
    setLoadingData(true);
    const { data } = await supabase
      .from("family_profiles")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at");
    setProfiles((data as DBProfile[]) ?? []);
    setLoadingData(false);
  };

  const openCreate = () => {
    setEditingProfile(null);
    setFormName("");
    setFormAvatar("🧒");
    setFormLevel("niveau_1");
    setFormPin("");
    setFormPinEnabled(false);
    setShowForm(true);
  };

  const openEdit = (p: DBProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProfile(p);
    setFormName(p.display_name);
    setFormAvatar(p.avatar);
    setFormLevel(p.level);
    setFormPin(p.pin ?? "");
    setFormPinEnabled(!!p.pin);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !user) return;
    if (formPinEnabled && formPin.length !== 4) {
      toast.error("Le code PIN doit contenir exactement 4 chiffres.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        display_name: formName.trim(),
        avatar: formAvatar,
        level: formLevel,
        pin: formPinEnabled ? formPin : null,
      };
      if (editingProfile) {
        const { error } = await supabase.from("family_profiles").update(payload).eq("id", editingProfile.id);
        if (error) throw error;
        toast.success("Profil mis à jour");
      } else {
        const { error } = await supabase.from("family_profiles").insert({ owner_id: user.id, ...payload });
        if (error) throw error;
        toast.success(`Profil "${formName.trim()}" créé`);
      }
      setShowForm(false);
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: DBProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer le profil "${p.display_name}" et toute sa progression ?`)) return;
    setDeleting(p.id);
    const { error } = await supabase.from("family_profiles").delete().eq("id", p.id);
    if (error) { toast.error("Erreur lors de la suppression"); }
    else { toast.success("Profil supprimé"); fetchProfiles(); }
    setDeleting(null);
  };

  const activateProfile = (p: DBProfile | null) => {
    if (!p) {
      // Owner profile
      setActiveProfile(null);
    } else {
      setActiveProfile({
        id: p.id,
        owner_id: p.owner_id,
        display_name: p.display_name,
        avatar: p.avatar,
        level: p.level,
      });
    }
    navigate("/dashboard");
  };

  const handleProfileClick = (p: DBProfile) => {
    if (p.pin) {
      setPinTarget(p);
      setPinInput("");
      setPinError(false);
    } else {
      activateProfile(p);
    }
  };

  const handlePinSubmit = () => {
    if (!pinTarget) return;
    if (pinInput === pinTarget.pin) {
      setPinTarget(null);
      activateProfile(pinTarget);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) return null;

  // ── Not famille plan ─────────────────────────────────────────────────────────
  if (!isFamille) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center mb-8 shadow-xl">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Plan Famille requis</h1>
          <p className="text-muted-foreground mb-6">Cette page est réservée aux abonnés du plan Famille.</p>
          <Button onClick={() => navigate("/tarifs")} className="bg-gradient-to-r from-emerald-700 to-amber-700 text-white border-0">
            <Crown className="h-4 w-4 mr-2" /> Voir les plans
          </Button>
        </div>
      </div>
    );
  }

  // ── Main — Netflix-style profile selector ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">

        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Qui apprend aujourd'hui ?</h1>
        <p className="text-white/50 text-sm mb-12">من سيتعلم اليوم؟</p>

        {loadingData ? (
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        ) : (
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl">

            {/* Owner profile */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => activateProfile(null)}>
              <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${profileColor(user.id)} flex items-center justify-center text-5xl sm:text-6xl shadow-lg group-hover:ring-4 group-hover:ring-white/60 transition-all`}>
                👑
              </div>
              <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate max-w-[128px] text-center">
                Moi
              </span>
            </div>

            {/* Child profiles */}
            {profiles.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-3 group cursor-pointer relative"
                onClick={() => handleProfileClick(p)}>
                <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${profileColor(p.id)} flex items-center justify-center text-5xl sm:text-6xl shadow-lg group-hover:ring-4 group-hover:ring-white/60 transition-all`}>
                  <span>{p.avatar}</span>
                  {p.pin && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                      <Lock className="h-3 w-3 text-white/70" />
                    </div>
                  )}
                  {/* Edit / delete on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => openEdit(p, e)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button onClick={(e) => handleDelete(p, e)}
                      disabled={deleting === p.id}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500/60 flex items-center justify-center transition-colors">
                      {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> : <Trash2 className="h-3.5 w-3.5 text-white" />}
                    </button>
                  </div>
                </div>
                <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate max-w-[128px] text-center">
                  {p.display_name}
                </span>
              </div>
            ))}

            {/* Add profile button */}
            {profiles.length < MAX_CHILD_PROFILES && (
              <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={openCreate}>
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-white/20 group-hover:border-white/50 flex items-center justify-center transition-all">
                  <Plus className="h-10 w-10 text-white/30 group-hover:text-white/70 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-white/40 group-hover:text-white/70 transition-colors">
                  Ajouter
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create / Edit profile dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProfile ? "Modifier le profil" : "Créer un profil"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {/* Preview */}
            <div className="flex justify-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${profileColor(editingProfile?.id ?? "new")} flex items-center justify-center text-4xl shadow-lg`}>
                {formAvatar}
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <p className="text-xs text-white/50 mb-2">Avatar</p>
              <div className="grid grid-cols-8 gap-1.5">
                {AVATARS.map((a) => (
                  <button key={a} type="button" onClick={() => setFormAvatar(a)}
                    className={`h-9 rounded-lg text-xl flex items-center justify-center transition-all ${formAvatar === a ? "bg-white/20 ring-2 ring-white/60" : "hover:bg-white/10"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-xs text-white/50 mb-1.5">Prénom</p>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ahmed, Fatima…"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/50"
              />
            </div>

            {/* Level */}
            <div>
              <p className="text-xs text-white/50 mb-1.5">Niveau de départ</p>
              <div className="grid grid-cols-2 gap-2">
                {(["niveau_1", "niveau_2"] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setFormLevel(l)}
                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${formLevel === l ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-white/20 text-white/50 hover:border-white/40"}`}>
                    {l === "niveau_1" ? "Niveau 1" : "Niveau 2"}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => { setFormPinEnabled(!formPinEnabled); setFormPin(""); }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${formPinEnabled ? "bg-emerald-500" : "bg-white/20"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formPinEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <p className="text-sm text-white/70">Code PIN <span className="text-white/30 text-xs">(optionnel)</span></p>
              </div>
              {formPinEnabled && (
                <Input
                  type="number"
                  maxLength={4}
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.slice(0, 4))}
                  placeholder="4 chiffres"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 tracking-widest text-center text-lg"
                />
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" className="flex-1 text-white/60 hover:text-white hover:bg-white/10" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button disabled={!formName.trim() || saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                onClick={handleSave}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                {editingProfile ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PIN dialog ── */}
      <Dialog open={!!pinTarget} onOpenChange={(o) => { if (!o) setPinTarget(null); }}>
        <DialogContent className="max-w-xs bg-[#1e293b] border-white/10 text-white text-center">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              {pinTarget?.avatar} {pinTarget?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-white/50 text-sm">Entrez le code PIN</p>
            <Input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.slice(0, 4)); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="• • • •"
              className={`bg-white/10 border-white/20 text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/20 ${pinError ? "border-red-400" : ""}`}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-xs">Code incorrect</p>}
            <Button onClick={handlePinSubmit} disabled={pinInput.length !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0">
              Entrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
