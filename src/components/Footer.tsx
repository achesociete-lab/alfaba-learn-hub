import { BookOpen, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-emerald-dark text-cream/80">
    {/* Top CTA band */}
    <div className="border-b border-white/10 py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-cream text-lg">Une question avant de vous inscrire ?</p>
          <p className="text-sm text-cream/50">Nous répondons sous 24h, généralement bien plus vite.</p>
        </div>
        <a
          href="mailto:contact@alfasl.fr"
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 transition-colors text-emerald-950 font-bold text-sm px-5 py-2.5 rounded-xl shrink-0"
        >
          <Mail className="h-4 w-4" />
          contact@alfasl.fr
        </a>
      </div>
    </div>

    {/* Main footer */}
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-gold" />
              <span className="font-display text-lg font-bold text-cream">
                ALFASL <span className="font-arabic">الفصل</span>
              </span>
            </div>
            <p className="text-sm text-cream/60 leading-relaxed max-w-xs mb-5">
              Programme de hifd et d'apprentissage de l'arabe pour les francophones. Cours individuels avec professeur dédié, 2 séances/semaine.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:contact@alfasl.fr"
                className="flex items-center gap-1.5 text-xs text-cream/50 hover:text-gold transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> contact@alfasl.fr
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gold mb-4">Programme</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/hifz" className="text-sm hover:text-gold transition-colors">Hifd al-Qur'ān</Link>
              <Link to="/niveau-1" className="text-sm hover:text-gold transition-colors">Arabe — Niveau 1</Link>
              <Link to="/niveau-2" className="text-sm hover:text-gold transition-colors">Arabe — Niveau 2</Link>
              <Link to="/tarifs" className="text-sm hover:text-gold transition-colors">Tarifs</Link>
              <Link to="/dashboard" className="text-sm hover:text-gold transition-colors">Espace élève</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gold mb-4">Légal</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/mentions-legales" className="text-sm hover:text-gold transition-colors">Mentions légales</Link>
              <Link to="/politique-de-confidentialite" className="text-sm hover:text-gold transition-colors">Politique de confidentialité</Link>
            </div>

            <h4 className="font-display text-sm font-semibold text-gold mt-6 mb-4">Promesse</h4>
            <ul className="flex flex-col gap-1.5 text-xs text-cream/50">
              <li>✓ Sans engagement</li>
              <li>✓ Résiliable à tout moment</li>
              <li>✓ Données privées et sécurisées</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} ALFASL · Tous droits réservés
          </p>
          <p className="font-arabic text-sm text-cream/25 select-none">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
