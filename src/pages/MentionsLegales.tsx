import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Mentions Légales</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">Éditeur du site</h2>
        <ul className="space-y-1 text-muted-foreground">
          <li><span className="font-medium text-foreground">Nom du site :</span> ALFASL</li>
          <li><span className="font-medium text-foreground">URL :</span>{" "}
            <a href="https://alfasl.fr" className="text-primary hover:underline">https://alfasl.fr</a>
          </li>
          <li><span className="font-medium text-foreground">Responsable de publication :</span> ALFASL</li>
          <li><span className="font-medium text-foreground">Email :</span>{" "}
            <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">Propriété intellectuelle</h2>
        <p className="text-muted-foreground leading-relaxed">
          L'ensemble des contenus présents sur alfasl.fr sont la propriété exclusive d'ALFASL et protégés
          par le droit d'auteur français. Toute reproduction sans autorisation est interdite.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default MentionsLegales;
