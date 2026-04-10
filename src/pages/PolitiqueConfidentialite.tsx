import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PolitiqueConfidentialite = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Politique de Confidentialité</h1>
      <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : avril 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">1. Données collectées</h2>
        <p className="text-muted-foreground leading-relaxed">
          Prénom, nom, email, mot de passe chiffré, progression dans les leçons, enregistrements audio (module Coran uniquement).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">2. Utilisation des données</h2>
        <p className="text-muted-foreground leading-relaxed">
          Gestion de votre compte, suivi pédagogique et amélioration de la plateforme.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Vos droits (RGPD)</h2>
        <p className="text-muted-foreground leading-relaxed">
          Vous disposez des droits d'accès, rectification, suppression et portabilité de vos données.
          <br />Contact :{" "}
          <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">4. Paiements</h2>
        <p className="text-muted-foreground leading-relaxed">
          Les paiements sont traités par un prestataire sécurisé certifié. Aucune donnée bancaire n'est stockée sur nos serveurs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Cookies techniques uniquement, aucun cookie publicitaire.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default PolitiqueConfidentialite;
