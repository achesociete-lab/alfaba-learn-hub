import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-emerald-dark text-cream/80 py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-gold" />
            <span className="font-display text-lg font-bold text-cream">
              ALFASL <span className="font-arabic">الفصل</span>
            </span>
          </div>
          <p className="text-sm text-cream/60">
            Apprenez l'arabe avec une méthode éprouvée et progressive.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-gold mb-4">Navigation</h4>
          <div className="flex flex-col gap-2">
            <Link to="/niveau-1" className="text-sm hover:text-gold transition-colors">Niveau 1</Link>
            <Link to="/niveau-2" className="text-sm hover:text-gold transition-colors">Niveau 2</Link>
            <Link to="/dashboard" className="text-sm hover:text-gold transition-colors">Espace Élève</Link>
            <Link to="/tarifs" className="text-sm hover:text-gold transition-colors">Tarifs</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-gold mb-4">Contact</h4>
          <p className="text-sm">contact@alfasl.fr</p>
          <p className="text-sm mt-1">© {new Date().getFullYear()} ALFASL</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
