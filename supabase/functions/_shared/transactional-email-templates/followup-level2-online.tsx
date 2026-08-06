import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const PRICING_URL = 'https://alfasl.fr/tarifs'

interface FollowupLevel2OnlineProps {
  studentName?: string
  studentEmail?: string
}

const FollowupLevel2OnlineEmail = ({ studentName, studentEmail }: FollowupLevel2OnlineProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre progression en arabe avec ALFASL - Donnez-nous votre avis !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚀 Votre progression en arabe</Heading>
        
        <Text style={greeting}>
          As-salâmu 'alaykum {studentName || 'cher élève'},
        </Text>
        
        <Text style={text}>
          Vous avez récemment rejoint ALFASL pour perfectionner votre arabe (Niveau 2). Nous sommes ravis de vous compter parmi nos élèves !
        </Text>

        <Section style={feedbackBox}>
          <Heading style={h2}>💭 Votre retour nous est précieux !</Heading>
          <Text style={text}>
            Qu'avez-vous pensé de l'interface et de la méthodologie proposée dans la version découverte ? Répondez simplement à cet email pour me faire part de vos impressions.
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={benefitsBox}>
          <Heading style={h2}>⭐ Passez à la vitesse supérieure avec le plan Premium</Heading>
          <Text style={text}>
            Si vous souhaitez progresser rapidement, le <strong>plan Premium à 12€/mois</strong> est fait pour vous. En plus de tout le contenu du Niveau 2, il débloque <strong>مساري (Masari)</strong>, notre parcours ultra-personnalisé :
          </Text>
          
          <ul style={featureList}>
            <li style={featureItem}>✓ Flashcards intelligentes et exercices ciblés</li>
            <li style={featureItem}>✓ Devoirs avec correction automatique</li>
            <li style={featureItem}>✓ Plan de révision hebdomadaire sur mesure</li>
            <li style={featureItem}>✓ Rapport de progression par email</li>
            <li style={featureItem}>✓ Tuteur IA illimité</li>
          </ul>
        </Section>

        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button href={PRICING_URL} style={btn}>
            Activer le plan Premium
          </Button>
        </Section>

        <Text style={footer}>
          Dans l'attente de vous lire,<br />
          L'équipe {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FollowupLevel2OnlineEmail,
  subject: 'Votre progression en arabe avec ALFASL - Donnez-nous votre avis !',
  displayName: 'Relance Niveau 2 - En ligne',
  previewData: { 
    studentName: 'Fatima', 
    studentEmail: 'fatima@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#0f5132', margin: '0 0 16px' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: '#0f5132', margin: '0 0 12px' }
const greeting = { fontSize: '14px', color: '#444', fontWeight: 'bold', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const feedbackBox = { background: '#f0f7ff', border: '1px solid #b3d9ff', borderRadius: '8px', padding: '16px', margin: '16px 0' }
const benefitsBox = { background: '#f6f9f6', border: '1px solid #d6e6dc', borderRadius: '8px', padding: '16px', margin: '16px 0' }
const featureList = { margin: '12px 0', paddingLeft: '20px' }
const featureItem = { fontSize: '14px', color: '#222', margin: '8px 0', lineHeight: '1.5' }
const btn = { background: '#0f5132', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', display: 'inline-block' }
const divider = { borderColor: '#e0e0e0', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999', marginTop: '32px', textAlign: 'center' as const, lineHeight: '1.6' }
