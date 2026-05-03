import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const APP_URL = 'https://alfasl.fr'
const LESSONS_URL = 'https://alfasl.fr/apprendre'
const QURAN_URL = 'https://alfasl.fr/coran'

interface WelcomeNewUserProps {
  userName?: string
  userEmail?: string
}

const WelcomeNewUserEmail = ({ userName, userEmail }: WelcomeNewUserProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Bienvenue sur ALFASL — commencez à apprendre l'arabe dès maintenant</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={arabicTitle}>الفصل</Text>
          <Text style={logo}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>As-salâmu 'alaykum {userName || ''} 👋</Heading>

        <Text style={text}>
          Bienvenue sur <strong>{SITE_NAME}</strong> — votre plateforme d'apprentissage de l'arabe et du Coran.
          Votre compte a été créé avec succès pour l'adresse <strong>{userEmail || ''}</strong>.
        </Text>

        <Section style={featureBox}>
          <Text style={featureTitle}>Ce que vous pouvez faire dès maintenant :</Text>
          <Text style={featureItem}>📖 <strong>Leçons structurées</strong> — Apprenez l'alphabet arabe pas à pas</Text>
          <Text style={featureItem}>🕌 <strong>Application Coran</strong> — Lisez et écoutez le Coran avec tajwid</Text>
          <Text style={featureItem}>🤖 <strong>Tuteur IA</strong> — Pratiquez avec notre assistant ElevenLabs</Text>
          <Text style={featureItem}>📊 <strong>Progression suivie</strong> — Visualisez vos avancées au quotidien</Text>
        </Section>

        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href={LESSONS_URL} style={btnPrimary}>Commencer les leçons</Button>
        </Section>

        <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
          <Button href={QURAN_URL} style={btnSecondary}>Ouvrir l'application Coran</Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerText}>
          Des questions ? Répondez directement à cet email, nous sommes là pour vous aider.
        </Text>
        <Text style={footer}>{SITE_NAME} — الفصل · <a href={APP_URL} style={link}>alfasl.fr</a></Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeNewUserEmail,
  subject: 'Bienvenue sur ALFASL — commencez votre apprentissage',
  displayName: 'Email de bienvenue (nouvel utilisateur)',
  previewData: {
    userName: 'Yacine',
    userEmail: 'yacine@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f9fafb', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '0', maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' }
const header = { backgroundColor: '#0f5132', padding: '28px 24px', textAlign: 'center' as const }
const arabicTitle = { fontSize: '28px', color: '#a7f3d0', margin: '0', fontWeight: 'bold', letterSpacing: '2px' }
const logo = { fontSize: '16px', color: '#d1fae5', margin: '4px 0 0', letterSpacing: '4px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#111', margin: '28px 24px 8px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.7', margin: '0 24px 20px' }
const featureBox = { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '20px 24px', margin: '0 24px 28px' }
const featureTitle = { fontSize: '14px', fontWeight: 'bold', color: '#166534', margin: '0 0 12px' }
const featureItem = { fontSize: '14px', color: '#374151', margin: '6px 0', lineHeight: '1.5' }
const btnPrimary = { background: '#0f5132', color: '#ffffff', padding: '13px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', display: 'inline-block' }
const btnSecondary = { background: '#ffffff', color: '#0f5132', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', border: '2px solid #0f5132', display: 'inline-block' }
const divider = { borderColor: '#e5e7eb', margin: '24px 24px 16px' }
const footerText = { fontSize: '13px', color: '#6b7280', margin: '0 24px 8px', textAlign: 'center' as const }
const footer = { fontSize: '12px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' as const, padding: '0 24px 24px' }
const link = { color: '#0f5132', textDecoration: 'none' }
