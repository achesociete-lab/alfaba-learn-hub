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
        <h2 className="text-xl font-semibold text-foreground mb-3">Hébergement</h2>
        <p className="text-muted-foreground leading-relaxed">
          Le site est hébergé via Lovable (frontend) et Supabase (base de données), avec des serveurs situés en Europe (région EU).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">Propriété intellectuelle</h2>
        <p className="text-muted-foreground leading-relaxed">
          L'ensemble des contenus présents sur alfasl.fr (textes, images, exercices, enregistrements audio) sont la propriété exclusive d'ALFASL et protégés par le droit d'auteur français. Toute reproduction sans autorisation écrite préalable est interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">Protection des données personnelles (RGPD)</h2>
        <p className="text-muted-foreground leading-relaxed mb-2">
          ALFASL traite des données à caractère personnel dans le cadre de la gestion des comptes utilisateurs, du suivi pédagogique en ligne et du module de gestion des cours en présentiel (méthode Nouraniya).
        </p>
        <p className="text-muted-foreground leading-relaxed mb-2">
          Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés modifiée, vous disposez de droits sur vos données (accès, rectification, effacement, portabilité, opposition).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Pour toute demande ou réclamation, contactez :{" "}
          <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a>.{" "}
          Consultez notre{" "}
          <a href="/politique-de-confidentialite" className="text-primary hover:underline">Politique de Confidentialité</a>{" "}
          pour le détail complet des traitements, bases légales et durées de conservation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">Droit applicable</h2>
        <p className="text-muted-foreground leading-relaxed">
          Le présent site est soumis au droit français. En cas de litige, les tribunaux français sont seuls compétents.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default MentionsLegales;
