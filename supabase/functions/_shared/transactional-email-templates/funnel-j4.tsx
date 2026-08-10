import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const PRICING_URL = 'https://alfasl.fr/tarifs'

interface Props {
  studentName?: string
  studentEmail?: string
}

const FunnelJ4Email = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Comment progressent vos premiers pas en arabe ?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>As-salâmu 'alaykum {studentName || 'cher élève'},</Text>

        <Text style={text}>
          Vous êtes sur ALFASL depuis quelques jours maintenant.
          J'espère que vous avez pu consacrer un peu de temps à votre apprentissage,
          même 10 minutes par jour font une vraie différence sur le long terme.
        </Text>

        <Text style={text}>
          Je voulais vous partager quelque chose qui revient souvent chez nos élèves :
          au début, on se demande si on va y arriver. L'arabe semble complexe,
          les lettres nouvelles, les sons différents. Et puis, peu à peu, ça se met en place.
          On reconnaît une racine, on comprend un mot qu'on avait entendu à la mosquée.
          C'est ce moment-là qui change tout.
        </Text>

        <Hr style={divider} />

        <Text style={text}>
          <strong>Ce que disent nos abonnés :</strong>
        </Text>

        <Text style={quote}>
          "Je n'aurais jamais pensé progresser aussi vite. Le tuteur IA مساري m'explique
          chaque point de grammaire avec patience, sans jugement. Je m'entraîne le soir
          après le travail et je sens vraiment la différence."
        </Text>

        <Text style={quoteAuthor}>— Karim, abonné depuis 3 mois</Text>

        <Hr style={divider} />

        <Text style={text}>
          Si vous souhaitez continuer sur cette lancée, les formules commencent
          à <strong>7€/mois</strong> — Essentiel pour le Niveau 1 et 2,
          Premium pour aller encore plus loin avec مساري et les corrections avancées.
        </Text>

        <Text style={cta}>
          <a href={PRICING_URL} style={ctaLink}>Voir les formules</a>
        </Text>

        <Text style={text}>
          N'hésitez pas à me répondre si vous avez des questions ou si quelque chose
          vous bloque dans votre progression. Je suis là.
        </Text>

        <Text style={text}>
          Bonne continuation,<br />
          Abdelkarim<br />
          <span style={muted}>ALFASL — alfasl.fr</span>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FunnelJ4Email,
  subject: 'Comment progressent vos premiers pas en arabe ?',
  displayName: 'Funnel J+4 — Motivation & social proof',
  previewData: {
    studentName: 'Fatima',
    studentEmail: 'fatima@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 24px', maxWidth: '520px', margin: '0 auto' }
const text = { fontSize: '15px', color: '#222', lineHeight: '1.7', margin: '0 0 16px' }
const divider = { borderColor: '#e0e0e0', margin: '24px 0' }
const quote = {
  fontSize: '15px',
  color: '#444',
  lineHeight: '1.7',
  fontStyle: 'italic' as const,
  borderLeft: '3px solid #1a5c38',
  paddingLeft: '16px',
  margin: '0 0 8px',
}
const quoteAuthor = { fontSize: '13px', color: '#888', margin: '0 0 16px' }
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
