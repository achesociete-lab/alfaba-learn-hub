import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const PRICING_URL = 'https://alfasl.fr/tarifs'

interface Props {
  studentName?: string
  studentEmail?: string
}

const FollowupLevel1OnlineEmail = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Comment s'est passée votre découverte d'ALFASL ?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>As-salâmu 'alaykum {studentName || 'cher élève'},</Text>

        <Text style={text}>
          Vous vous êtes inscrit(e) il y a quelques jours sur ALFASL pour débuter l'arabe au niveau 1.
          J'espère que les premières leçons vous ont plu !
        </Text>

        <Text style={text}>
          Qu'avez-vous pensé de la plateforme ? Si vous avez des questions ou des retours,
          répondez simplement à cet email — je lis tous les messages.
        </Text>

        <Hr style={divider} />

        <Text style={text}>
          Si vous souhaitez continuer au-delà des 3 leçons gratuites, le plan Essentiel
          (7€/mois) donne accès à l'intégralité du Niveau 1 et du Niveau 2, aux exercices
          interactifs et au tuteur IA Musa'id.
        </Text>

        <Text style={text}>
          <a href={PRICING_URL} style={link}>Voir les formules disponibles</a>
        </Text>

        <Text style={text}>
          Au plaisir d'échanger avec vous,<br />
          Abdelkarim<br />
          <span style={muted}>ALFASL — alfasl.fr</span>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FollowupLevel1OnlineEmail,
  subject: "Comment s'est passée votre découverte d'ALFASL ?",
  displayName: 'Relance Niveau 1 - En ligne',
  previewData: {
    studentName: 'Ahmed',
    studentEmail: 'ahmed@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 24px', maxWidth: '520px', margin: '0 auto' }
const text = { fontSize: '15px', color: '#222', lineHeight: '1.7', margin: '0 0 18px' }
const divider = { borderColor: '#e0e0e0', margin: '24px 0' }
const link = { color: '#0f5132', textDecoration: 'underline' }
const muted = { fontSize: '13px', color: '#888' }
