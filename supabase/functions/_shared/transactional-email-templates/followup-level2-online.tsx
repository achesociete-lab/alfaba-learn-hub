import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const PRICING_URL = 'https://alfasl.fr/tarifs'

interface Props {
  studentName?: string
  studentEmail?: string
}

const FollowupLevel2OnlineEmail = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Comment s'est passée votre découverte d'ALFASL ?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>As-salâmu 'alaykum {studentName || 'cher élève'},</Text>

        <Text style={text}>
          Vous vous êtes inscrit(e) il y a quelques jours sur ALFASL pour approfondir votre arabe au niveau 2.
          J'espère que la plateforme vous a plu !
        </Text>

        <Text style={text}>
          Qu'avez-vous pensé de la méthode et des exercices proposés ?
          Répondez directement à cet email — je lis tous les messages.
        </Text>

        <Hr style={divider} />

        <Text style={text}>
          Si vous souhaitez continuer au-delà de la version découverte, le plan Premium
          (12€/mois) donne accès à l'intégralité du Niveau 2, à مساري (votre parcours
          personnalisé), aux corrections automatiques et au tuteur IA Musa'id.
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
  component: FollowupLevel2OnlineEmail,
  subject: "Comment s'est passée votre découverte d'ALFASL ?",
  displayName: 'Relance Niveau 2 - En ligne',
  previewData: {
    studentName: 'Fatima',
    studentEmail: 'fatima@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '32px 24px', maxWidth: '520px', margin: '0 auto' }
const text = { fontSize: '15px', color: '#222', lineHeight: '1.7', margin: '0 0 18px' }
const divider = { borderColor: '#e0e0e0', margin: '24px 0' }
const link = { color: '#0f5132', textDecoration: 'underline' }
const muted = { fontSize: '13px', color: '#888' }
