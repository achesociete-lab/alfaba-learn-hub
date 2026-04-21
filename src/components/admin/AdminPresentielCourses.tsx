import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Trash2, Loader2, Users, Save } from "lucide-react";
import { toast } from "sonner";

const AdminPresentielCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [qcmText, setQcmText] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [dictationText, setDictationText] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const fetchData = async () => {
    const { data: c } = await supabase.from("presentiel_courses").select("*").order("course_date", { ascending: false });
    const { data: s } = await supabase.from("profiles")
      .select("user_id, first_name, last_name, type_eleve")
      .eq("type_eleve", "presentiel" as any);
    setCourses(c || []);
    setStudents(s || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!title.trim() || !user) {
      toast.error("Titre requis");
      return;
    }
    setSaving(true);
    try {
      let photoUrl: string | null = null;

      // 1. Upload photo (optionnel)
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("presentiel-courses").upload(path, photo);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }

      // 2. Insert cours (contenu manuel stocké en texte brut dans le JSONB)
      const { data: course, error: insErr } = await supabase.from("presentiel_courses").insert({
        title,
        photo_url: photoUrl,
        ocr_text: "",
        qcm: qcmText.trim() ? { text: qcmText } as any : [],
        translation: translationText.trim() ? { text: translationText } : {},
        dictation: dictationText.trim() ? { text: dictationText } : {},
        created_by: user.id,
      }).select().single();
      if (insErr) throw insErr;

      // 3. Assignations
      if (selectedStudents.length > 0 && course) {
        const rows = selectedStudents.map((uid) => ({
          course_id: course.id,
          user_id: uid,
          assigned_by: user.id,
        }));
        await supabase.from("presentiel_course_assignments").insert(rows);
      }

      toast.success("Cours enregistré !");
      setTitle("");
      setPhoto(null);
      setQcmText("");
      setTranslationText("");
      setDictationText("");
      setSelectedStudents([]);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await supabase.from("presentiel_courses").delete().eq("id", id);
    toast.success("Cours supprimé");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-gold" />
        <h2 className="text-xl font-bold text-foreground">Cours en présentiel</h2>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Nouveau cours</h3>

          <div>
            <Label>Titre du cours</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Leçon du 21 avril – Le verbe" />
          </div>

          <div>
            <Label>Photo du cours (illustrative, optionnelle)</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </div>

          <div>
            <Label>QCM</Label>
            <Textarea
              value={qcmText}
              onChange={(e) => setQcmText(e.target.value)}
              placeholder="Saisis ici les questions du QCM (1 par ligne, indique la bonne réponse)…"
              className="min-h-[140px]"
            />
          </div>

          <div>
            <Label>Traduction</Label>
            <Textarea
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              placeholder="Texte arabe à traduire et sa traduction française…"
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label>Dictée</Label>
            <Textarea
              value={dictationText}
              onChange={(e) => setDictationText(e.target.value)}
              placeholder="Phrases à dicter (1 par ligne)…"
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2"><Users className="h-4 w-4" />Élèves présentiel ({students.length})</Label>
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
              {students.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">Aucun élève en présentiel pour l'instant.</p>
              )}
              {students.map((s) => (
                <label key={s.user_id} className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-pointer">
                  <Checkbox
                    checked={selectedStudents.includes(s.user_id)}
                    onCheckedChange={(checked) => {
                      setSelectedStudents((prev) =>
                        checked ? [...prev, s.user_id] : prev.filter((id) => id !== s.user_id)
                      );
                    }}
                  />
                  <span className="text-sm">{s.first_name} {s.last_name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || !title.trim()} className="w-full gradient-emerald border-0 text-primary-foreground">
            {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement…</>) : (<><Save className="h-4 w-4 mr-2" />Enregistrer le cours</>)}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Cours existants ({courses.length})</h3>
        {courses.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center gap-3">
              {c.photo_url && <img src={c.photo_url} alt="" className="h-14 w-14 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.course_date).toLocaleDateString("fr-FR")}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPresentielCourses;
