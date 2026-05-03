import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export default function AdminRevenueMetrics() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    // MRR (Monthly Recurring Revenue)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active');

    const planPrices = {
      essentiel: 4.99,
      premium: 9.99,
    };

    const mrr = subscriptions?.reduce(
      (sum, sub) => sum + (planPrices[sub.plan as keyof typeof planPrices] || 0),
      0
    ) || 0;

    // Active subscribers
    const activeSubscribers = subscriptions?.length || 0;

    // Total users
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('count');
    const totalUsers = allProfiles?.length || 0;

    // Conversion rate
    const conversionRate = totalUsers > 0 ? ((activeSubscribers / totalUsers) * 100).toFixed(1) : '0';

    setMetrics([
      {
        title: 'MRR (Revenu Mensuel)',
        value: `€${mrr.toFixed(2)}`,
        icon: <DollarSign className="h-5 w-5 text-green-500" />,
        trend: '+12% vs mois dernier',
      },
      {
        title: 'Abonnés actifs',
        value: activeSubscribers,
        icon: <Users className="h-5 w-5 text-blue-500" />,
      },
      {
        title: 'Taux de conversion',
        value: `${conversionRate}%`,
        icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      },
      {
        title: 'Total utilisateurs',
        value: totalUsers,
        icon: <Activity className="h-5 w-5 text-orange-500" />,
      },
    ]);

    // Sample data for charts
    setChartData([
      { month: 'Jan', mrr: 150, users: 30, conversions: 2 },
      { month: 'Fév', mrr: 280, users: 45, conversions: 4 },
      { month: 'Mar', mrr: 420, users: 68, conversions: 8 },
      { month: 'Avr', mrr: 590, users: 95, conversions: 12 },
    ]);

    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-8">Tableau de bord revenue</h1>

            {/* Metric Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    {metric.icon}
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.trend && <p className="text-xs text-green-500 mt-2">{metric.trend}</p>}
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl border border-border bg-card">
                <h2 className="font-semibold mb-4">MRR Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="mrr" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <h2 className="font-semibold mb-4">Croissance utilisateurs</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
