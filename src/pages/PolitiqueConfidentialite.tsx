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
        <div className="space-y-5 text-muted-foreground leading-relaxed">

          <div>
            <p className="font-medium text-foreground mb-1">Compte et profil</p>
            <p>Prénom, nom, adresse e-mail, mot de passe chiffré, niveau d'apprentissage (Niveau 1 / Niveau 2), type d'inscription (en ligne / présentiel).</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module Niveau 1 & Niveau 2 (cours en ligne)</p>
            <p>Progression dans les leçons, scores aux exercices et QCM, résultats du test de placement N1→N2, historique des sessions.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module مساري (tuteur IA)</p>
            <p>Transcription des sessions de questions-réponses (lettres arabes), scores par session, lettres faibles et maîtrisées, historique des devoirs générés et leurs corrections, score moyen et streak quotidien.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module Cours présentiel (en ligne)</p>
            <p>Cours assignés par le professeur, progression dans les exercices (QCM, écriture, dictée), soumissions de travaux (photos), corrections et commentaires du professeur.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module Hifd al-Qur'ān</p>
            <p>Formulaire de candidature (prénom, nom, contact, motivation), statut d'activation, enregistrements audio de récitations (stockés de façon sécurisée), notes et annotations du professeur sur chaque récitation, planning des séances, rappels automatiques par e-mail.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module Nouraniya (cours d'arabe en présentiel)</p>
            <p>Groupe(s) d'appartenance et planning des séances, présences / absences / retards par séance avec note éventuelle du professeur, notes et appréciations par évaluation (récitation, écriture, lecture, comportement, note globale), messages du professeur à destination des parents/tuteurs légaux, lien entre le compte parent et le profil de l'élève.</p>
            <p className="mt-1">Ces données sont accessibles uniquement au professeur et, pour les informations de leur enfant, aux parents/tuteurs légaux liés.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module Dessins animés</p>
            <p>Historique de visionnage (séries et épisodes consultés) pour personnaliser les recommandations. Aucun profil comportemental transmis à des tiers.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Module Famille</p>
            <p>Profils des membres rattachés (prénom, niveau), partage de l'abonnement, progression individuelle de chaque profil famille.</p>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Données de paiement</p>
            <p>Les paiements sont traités par un prestataire certifié PCI-DSS (Stripe). Aucune donnée bancaire n'est stockée sur nos serveurs.</p>
          </div>

        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Bases légales du traitement</h2>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p><span className="font-medium text-foreground">Exécution du contrat :</span> gestion du compte, accès aux cours, suivi de la progression, gestion des paiements et abonnements.</p>
          <p><span className="font-medium text-foreground">Intérêt légitime pédagogique :</span> suivi des présences, notes, progression et communication professeur–parents dans le cadre du suivi de l'élève (module Nouraniya), personnalisation du parcours pédagogique (مساري, Niveau 2).</p>
          <p><span className="font-medium text-foreground">Consentement :</span> enregistrements audio (module Hifd), rappels e-mail optionnels.</p>
          <p><span className="font-medium text-foreground">Obligation légale :</span> conservation des données de facturation conformément aux obligations comptables.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">4. Durée de conservation</h2>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
          <p><span className="font-medium text-foreground">Données de compte et de progression :</span> durée de l'abonnement actif, puis 3 ans après la dernière activité ou à la demande de suppression.</p>
          <p><span className="font-medium text-foreground">Module Nouraniya</span> (présences, notes, messages) : durée de la scolarité sur la plateforme, puis supprimées sous 12 mois après la fin de l'inscription, sauf demande anticipée.</p>
          <p><span className="font-medium text-foreground">Enregistrements audio (Hifd) :</span> durée du suivi pédagogique, supprimables à la demande.</p>
          <p><span className="font-medium text-foreground">Données de facturation :</span> 10 ans conformément aux obligations légales françaises.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">5. Partage des données</h2>
        <p className="text-muted-foreground leading-relaxed">
          Vos données ne sont pas vendues ni transmises à des tiers à des fins commerciales. Elles peuvent être partagées uniquement avec :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
          <li>Nos sous-traitants techniques (hébergement Supabase/AWS EU, paiement Stripe) liés par des garanties de confidentialité</li>
          <li>Le professeur ALFASL, dans le cadre du suivi pédagogique</li>
          <li>Les parents/tuteurs légaux liés, pour les données de leur enfant (module Nouraniya)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">6. Vos droits (RGPD)</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Conformément au RGPD (Règlement UE 2016/679), vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
          <li><span className="font-medium text-foreground">Accès :</span> obtenir une copie de vos données</li>
          <li><span className="font-medium text-foreground">Rectification :</span> corriger des informations inexactes</li>
          <li><span className="font-medium text-foreground">Effacement :</span> demander la suppression de vos données</li>
          <li><span className="font-medium text-foreground">Portabilité :</span> recevoir vos données dans un format structuré</li>
          <li><span className="font-medium text-foreground">Opposition :</span> vous opposer aux traitements fondés sur l'intérêt légitime</li>
          <li><span className="font-medium text-foreground">Limitation :</span> demander la suspension temporaire d'un traitement</li>
          <li><span className="font-medium text-foreground">Retrait du consentement :</span> à tout moment pour les traitements basés sur le consentement</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Pour exercer ces droits : <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a> — réponse sous 30 jours.
          Vous pouvez également introduire une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CNIL</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">7. Sécurité</h2>
        <p className="text-muted-foreground leading-relaxed">
          Les données sont hébergées en Europe (Supabase / AWS eu-west). Accès protégé par authentification, chiffrement TLS en transit, contrôles d'accès stricts (Row Level Security). Seules les personnes autorisées accèdent aux données qui les concernent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Cookies techniques uniquement (session, préférences d'affichage). Aucun cookie publicitaire ou de traçage tiers.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default PolitiqueConfidentialite;
