import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const PRICING_URL = 'https://alfasl.fr/tarifs'

interface FollowupLevel1OnlineProps {
  studentName?: string
  studentEmail?: string
}

const FollowupLevel1OnlineEmail = ({ studentName, studentEmail }: FollowupLevel1OnlineProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre apprentissage de l'arabe avec ALFASL - Donnez-nous votre avis !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📚 Votre apprentissage de l'arabe</Heading>
        
        <Text style={greeting}>
          As-salâmu 'alaykum {studentName || 'cher élève'},
        </Text>
        
        <Text style={text}>
          Vous vous êtes inscrit(e) il y a quelques jours sur ALFASL pour débuter votre apprentissage de l'arabe (Niveau 1). J'espère que la découverte de la plateforme s'est bien passée !
        </Text>

        <Section style={feedbackBox}>
          <Heading style={h2}>💭 Votre avis nous intéresse !</Heading>
          <Text style={text}>
            Qu'avez-vous pensé des 3 premières leçons gratuites ? Y a-t-il des choses que nous pourrions améliorer pour vous aider à mieux apprendre ? N'hésitez pas à me répondre directement à cet email.
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={benefitsBox}>
          <Heading style={h2}>🎯 Débloquez votre potentiel avec le plan Essentiel</Heading>
          <Text style={text}>
            Pour aller plus loin et débloquer la suite de votre apprentissage, découvrez notre <strong>plan Essentiel à seulement 7€/mois</strong> :
          </Text>
          
          <ul style={featureList}>
            <li style={featureItem}>✓ L'intégralité des leçons du Niveau 1</li>
            <li style={featureItem}>✓ Tous nos exercices interactifs et dictées audio</li>
            <li style={featureItem}>✓ Notre tuteur IA (Musa'id) pour vous corriger en temps réel</li>
            <li style={featureItem}>✓ Suivi complet de votre progression</li>
          </ul>
        </Section>

        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button href={PRICING_URL} style={btn}>
            Débloquer mon accès Essentiel
          </Button>
        </Section>

        <Text style={footer}>
          Au plaisir d'échanger avec vous,<br />
          L'équipe {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FollowupLevel1OnlineEmail,
  subject: 'Votre apprentissage de l\'arabe avec ALFASL - Donnez-nous votre avis !',
  displayName: 'Relance Niveau 1 - En ligne',
  previewData: { 
    studentName: 'Ahmed', 
    studentEmail: 'ahmed@example.com',
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
