import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const PRICING_URL = 'https://alfasl.fr/tarifs'

interface Props {
  studentName?: string
  studentEmail?: string
}

const FunnelJ1Email = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Voici ce qui vous attend avec un abonnement ALFASL</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>As-salâmu 'alaykum {studentName || 'cher élève'},</Text>

        <Text style={text}>
          Vous avez rejoint ALFASL hier — bienvenue dans cette aventure !
          J'espère que vos premières leçons vous ont donné envie d'aller plus loin.
        </Text>

        <Text style={text}>
          Je voulais vous montrer ce qui vous attend avec un plan payant,
          parce que cela peut vraiment transformer votre apprentissage :
        </Text>

        <Hr style={divider} />

        <Text style={featureTitle}>Ce que les abonnés ont en plus :</Text>

        <Text style={text}>
          <strong>Niveau 2 complet</strong> — Après le Niveau 1, continuez votre progression
          avec des textes authentiques, la grammaire avancée et la compréhension orale.
        </Text>

        <Text style={text}>
          <strong>مساري — Votre parcours personnalisé</strong> — Un tuteur IA qui
          s'adapte à votre rythme, vous pose des questions, vous corrige en temps réel
          et vous aide à progresser même quand vous n'avez que 10 minutes devant vous.
        </Text>

        <Text style={text}>
          <strong>Exercices interactifs illimités</strong> — Accédez à l'intégralité
          du programme, sans blocage sur les leçons gratuites, à votre rythme.
        </Text>

        <Hr style={divider} />

        <Text style={text}>
          Les formules commencent à <strong>7€/mois</strong> — moins qu'un café par semaine
          pour apprendre la langue du Coran.
        </Text>

        <Text style={cta}>
          <a href={PRICING_URL} style={ctaLink}>Découvrir les formules</a>
        </Text>

        <Text style={text}>
          Si vous avez des questions sur la plateforme ou sur la méthode,
          répondez simplement à cet email — je lis tout personnellement.
        </Text>

        <Text style={text}>
          À très vite,<br />
          Abdelkarim<br />
          <span style={muted}>ALFASL — alfasl.fr</span>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FunnelJ1Email,
  subject: 'Voici ce qui vous attend sur ALFASL',
  displayName: 'Funnel J+1 — Découverte fonctionnalités',
  previewData: {
    studentName: 'Ahmed',
    studentEmail: 'ahmed@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 24px', maxWidth: '520px', margin: '0 auto' }
const text = { fontSize: '15px', color: '#222', lineHeight: '1.7', margin: '0 0 16px' }
const featureTitle = { fontSize: '15px', color: '#444', fontWeight: 'bold' as const, margin: '0 0 12px' }
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
