import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, User } from "lucide-react";
import { toast } from "sonner";

const CompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"homme" | "femme" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !age || !gender) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      toast.error("Veuillez entrer un âge valide (5-120)");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          age: ageNum,
          gender,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profil complété !");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">
              ALFASL <span className="text-gradient-gold font-arabic">الفصل</span>
            </span>
          </div>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Complétez votre profil
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Ces informations sont nécessaires pour personnaliser votre expérience.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Nom"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="age">Âge</Label>
              <Input
                id="age"
                type="number"
                min={5}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                placeholder="Ex: 25"
              />
            </div>

            <div>
              <Label>Genre</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <Button
                  type="button"
                  variant={gender === "homme" ? "default" : "outline"}
                  className={gender === "homme" ? "gradient-emerald border-0 text-primary-foreground" : ""}
                  onClick={() => setGender("homme")}
                >
                  Homme
                </Button>
                <Button
                  type="button"
                  variant={gender === "femme" ? "default" : "outline"}
                  className={gender === "femme" ? "gradient-emerald border-0 text-primary-foreground" : ""}
                  onClick={() => setGender("femme")}
                >
                  Femme
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-emerald border-0 text-primary-foreground mt-2"
            >
              {loading ? "Enregistrement..." : "Continuer"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
