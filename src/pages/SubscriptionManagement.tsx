import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { CreditCard, Download, RotateCcw, LogOut } from 'lucide-react';
import { createPortalSession } from '@/services/stripe';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  stripe_customer_id: string | null;
}

export default function SubscriptionManagement() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingPortal, setManagingPortal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSubscription();
  }, [user, navigate]);

  const fetchSubscription = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    setSubscription(data);
    setLoading(false);
  };

  const handleManagePayment = async () => {
    if (!subscription?.stripe_customer_id) return;
    setManagingPortal(true);
    try {
      const url = await createPortalSession(subscription.stripe_customer_id);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open portal:', error);
    } finally {
      setManagingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Gérer mon abonnement</h1>
            <p className="text-muted-foreground mb-8">Consultez et gérez vos informations d'abonnement</p>

            {subscription ? (
              <div className="space-y-4">
                <div className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Plan actuel</h2>
                  </div>
                  <p className="text-2xl font-bold capitalize text-primary mb-4">{subscription.plan}</p>
                  <p className="text-sm text-muted-foreground">
                    Renouvellement: {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <Button
                  onClick={handleManagePayment}
                  disabled={managingPortal}
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {managingPortal ? 'Redirection...' : 'Gérer le paiement'}
                </Button>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-border bg-card text-center">
                <p className="text-muted-foreground mb-4">Aucun abonnement actif</p>
                <Button asChild>
                  <a href="/tarifs">Voir les tarifs</a>
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full mt-6 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
