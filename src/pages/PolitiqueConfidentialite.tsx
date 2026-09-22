import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PolitiqueConfidentialite = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Politique de Confidentialité</h1>
      <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : septembre 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">1. Responsable du traitement</h2>
        <p className="text-muted-foreground leading-relaxed">
          ALFASL — <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a><br />
          Toute demande relative à vos données personnelles peut être adressée à cette adresse.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">2. Données collectées</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <div>
            <p className="font-medium text-foreground mb-1">Compte et profil</p>
            <p>Prénom, nom, adresse e-mail, mot de passe chiffré, niveau d'apprentissage, type d'inscription (en ligne / présentiel).</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Progression pédagogique (cours en ligne)</p>
            <p>Avancement dans les leçons, scores aux exercices et tests de placement, historique des sessions مساري, enregistrements audio (module Hifd uniquement, stockés de façon sécurisée).</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Module Nouraniya — cours en présentiel</p>
            <p>Les données suivantes sont collectées dans le cadre du suivi pédagogique des cours d'arabe en présentiel (méthode Nouraniya) :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Groupe(s) d'appartenance et planning des séances</li>
              <li>Présences, absences et retards par séance, avec éventuelle note du professeur</li>
              <li>Notes et appréciations par évaluation (récitation, écriture, lecture, comportement, note globale)</li>
              <li>Messages du professeur à destination des parents/tuteurs légaux</li>
              <li>Lien entre le compte d'un parent/tuteur légal et le profil de l'élève</li>
            </ul>
            <p className="mt-2">Ces données sont accessibles exclusivement au professeur et, pour ce qui concerne leur enfant, aux parents/tuteurs légaux liés.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Données de paiement</p>
            <p>Les paiements sont traités par un prestataire certifié PCI-DSS. Aucune donnée bancaire n'est stockée sur nos serveurs.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Bases légales du traitement</h2>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p><span className="font-medium text-foreground">Exécution du contrat :</span> gestion de votre compte, accès aux cours, suivi des paiements.</p>
          <p><span className="font-medium text-foreground">Intérêt légitime pédagogique :</span> suivi des présences, notes et progression dans le module Nouraniya, communication professeur–parents dans le cadre du suivi de l'élève.</p>
          <p><span className="font-medium text-foreground">Consentement :</span> enregistrements audio (module Hifd), cookies non essentiels si applicables.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">4. Durée de conservation</h2>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p><span className="font-medium text-foreground">Données de compte :</span> conservées pendant la durée de l'abonnement actif, puis 3 ans après la dernière activité ou à la demande de suppression.</p>
          <p><span className="font-medium text-foreground">Données du module Nouraniya</span> (présences, notes, messages) : conservées pendant la durée de la scolarité de l'élève sur la plateforme, puis supprimées dans un délai de 12 mois après la fin de l'inscription, sauf demande de suppression anticipée.</p>
          <p><span className="font-medium text-foreground">Enregistrements audio :</span> conservés le temps du suivi pédagogique, supprimables à la demande.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">5. Vos droits (RGPD)</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants sur vos données personnelles :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li><span className="font-medium text-foreground">Droit d'accès :</span> obtenir une copie de vos données</li>
          <li><span className="font-medium text-foreground">Droit de rectification :</span> corriger des données inexactes</li>
          <li><span className="font-medium text-foreground">Droit à l'effacement :</span> demander la suppression de vos données</li>
          <li><span className="font-medium text-foreground">Droit à la portabilité :</span> recevoir vos données dans un format structuré</li>
          <li><span className="font-medium text-foreground">Droit d'opposition :</span> vous opposer à certains traitements fondés sur l'intérêt légitime</li>
          <li><span className="font-medium text-foreground">Droit à la limitation :</span> demander la suspension temporaire d'un traitement</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Pour exercer ces droits, contactez-nous à{" "}
          <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a>.
          Nous répondrons dans un délai maximum de 30 jours. En cas de désaccord, vous pouvez introduire une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CNIL</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">6. Sécurité des données</h2>
        <p className="text-muted-foreground leading-relaxed">
          Les données sont hébergées en Europe (Supabase / AWS eu-west). L'accès est protégé par authentification, chiffrement TLS en transit et des politiques de contrôle d'accès strictes (RLS). Seules les personnes autorisées ont accès aux données.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Cookies techniques uniquement (session, préférences d'affichage). Aucun cookie publicitaire ou de traçage tiers.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default PolitiqueConfidentialite;
