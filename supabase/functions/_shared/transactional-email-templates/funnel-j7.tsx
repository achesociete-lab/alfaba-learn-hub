import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const PRICING_URL = 'https://alfasl.fr/tarifs'
const PROMO_CODE = 'ALFASL20'

interface Props {
  studentName?: string
  studentEmail?: string
}

const FunnelJ7Email = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>-20% pendant 48h — une dernière invitation à rejoindre ALFASL</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>As-salâmu 'alaykum {studentName || 'cher élève'},</Text>

        <Text style={text}>
          Cela fait une semaine que vous avez rejoint ALFASL. Si vous n'avez pas encore
          franchi le pas vers un abonnement, je voulais vous faire une proposition
          avant de vous laisser tranquille.
        </Text>

        <Text style={text}>
          Pendant les <strong>48 prochaines heures</strong>, je vous offre{' '}
          <strong>-20% sur votre premier mois</strong> avec le code :
        </Text>

        <Text style={promoBox}>
          {PROMO_CODE}
        </Text>

        <Text style={text}>
          Entrez ce code sur la page des tarifs au moment du paiement.
        </Text>

        <Hr style={divider} />

        <Text style={text}>
          Ce que vous débloquez avec un abonnement :
        </Text>

        <Text style={text}>
          — <strong>Niveau 1 et Niveau 2 complets</strong> sans restriction<br />
          — <strong>مساري</strong>, le tuteur IA qui s'adapte à votre niveau<br />
          — Exercices interactifs, corrections automatiques, progression guidée<br />
          — Formule <strong>Famille</strong> disponible si vous apprenez à plusieurs (19€/mois)
        </Text>

        <Text style={cta}>
          <a href={PRICING_URL} style={ctaLink}>Utiliser mon code — {PROMO_CODE}</a>
        </Text>

        <Hr style={divider} />

        <Text style={text}>
          Si l'arabe n'est finalement pas une priorité pour vous en ce moment, pas de souci —
          vos leçons gratuites restent accessibles. Et si vous changez d'avis plus tard,
          je serai là.
        </Text>

        <Text style={text}>
          Barak Allahu fikum,<br />
          Abdelkarim<br />
          <span style={muted}>ALFASL — alfasl.fr</span>
        </Text>

        <Text style={finePrint}>
          Offre valable 48h à compter de la réception de cet email.
          Code {PROMO_CODE} applicable à tout premier abonnement mensuel.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FunnelJ7Email,
  subject: `Offre -20% valable 48h — code ${PROMO_CODE}`,
  displayName: 'Funnel J+7 — Offre limitée -20%',
  previewData: {
    studentName: 'Youssef',
    studentEmail: 'youssef@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 24px', maxWidth: '520px', margin: '0 auto' }
const text = { fontSize: '15px', color: '#222', lineHeight: '1.7', margin: '0 0 16px' }
const promoBox = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1a5c38',
  letterSpacing: '4px',
  textAlign: 'center' as const,
  backgroundColor: '#f0f7f3',
  padding: '16px',
  borderRadius: '8px',
  border: '2px dashed #1a5c38',
  margin: '16px 0',
}
const divider = { borderColor: '#e0e0e0', margin: '24px 0' }
const cta = { margin: '24px 0' }
const ctaLink = {
  backgroundColor: '#1a5c38',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  display: 'inline-block',
}
const muted = { fontSize: '13px', color: '#888' }
const finePrint = { fontSize: '12px', color: '#aaa', marginTop: '24px', lineHeight: '1.5' }
