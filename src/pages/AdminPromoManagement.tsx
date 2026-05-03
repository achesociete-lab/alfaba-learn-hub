import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  usage_limit: number;
  usage_count: number;
  expiry_date: string;
  active: boolean;
}

export default function AdminPromoManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [discount, setDiscount] = useState(10);
  const [limit, setLimit] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPromoCodes(data || []);
    setLoading(false);
  };

  const createPromoCode = async () => {
    if (!newCode.trim() || !expiryDate) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const { error } = await supabase
      .from('promo_codes')
      .insert({
        code: newCode.toUpperCase(),
        discount_percentage: discount,
        usage_limit: limit,
        expiry_date: expiryDate,
      });

    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Code promo créé !');
      setNewCode('');
      setDiscount(10);
      setLimit(100);
      setExpiryDate('');
      fetchPromoCodes();
    }
  };

  const togglePromoCode = async (id: string, active: boolean) => {
    await supabase.from('promo_codes').update({ active: !active }).eq('id', id);
    fetchPromoCodes();
  };

  const deletePromoCode = async (id: string) => {
    await supabase.from('promo_codes').delete().eq('id', id);
    toast.success('Code supprimé');
    fetchPromoCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-8">Gestion des codes promo</h1>

            <div className="p-6 rounded-xl border border-border bg-card mb-8 space-y-4">
              <h2 className="font-semibold">Créer un nouveau code</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Code (ex: SUMMER50)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                />
                <Input
                  type="number"
                  placeholder="Réduction %"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Limite d'utilisation"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  min="1"
                />
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <Button onClick={createPromoCode} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Créer
              </Button>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold">Codes actifs</h2>
              {promoCodes.map((promo) => (
                <div key={promo.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold">{promo.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {promo.discount_percentage}% de réduction • {promo.usage_count}/{promo.usage_limit} utilisations
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expire le {new Date(promo.expiry_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(promo.code)}
                      className="gap-1"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={promo.active ? 'default' : 'outline'}
                      onClick={() => togglePromoCode(promo.id, promo.active)}
                    >
                      {promo.active ? 'Actif' : 'Inactif'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePromoCode(promo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
