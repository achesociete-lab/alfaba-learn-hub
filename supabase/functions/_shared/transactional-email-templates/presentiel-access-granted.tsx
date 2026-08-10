import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const APP_URL = 'https://alfasl.fr/cours-presentiel'

interface Props {
  studentName?: string
}

const PresentielAccessGrantedEmail = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre espace cours présentiel ALFASL est maintenant accessible</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={arabicTitle}>الفصل</Text>
          <Text style={logo}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Votre accès est activé !</Heading>

        <Text style={text}>
          As-salâmu 'alaykum {studentName || ''},
        </Text>
        <Text style={text}>
          Votre professeur vient de valider votre compte sur <strong>{SITE_NAME}</strong>.
          Vous pouvez maintenant accéder à vos cours en présentiel depuis la plateforme.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Comment ça fonctionne :</Text>
          <Text style={infoItem}>✏️ <strong>Écriture</strong> — Recopiez la leçon à la main et envoyez une photo</Text>
          <Text style={infoItem}>📝 <strong>Vocabulaire</strong> — Testez vos connaissances avec des QCM</Text>
          <Text style={infoItem}>🎧 <strong>Dictée</strong> — Écoutez et écrivez les mots dictés</Text>
          <Text style={infoItem}>💬 <strong>Correction</strong> — Votre professeur corrige et vous laisse ses commentaires</Text>
        </Section>

        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button href={APP_URL} style={btn}>Accéder à mes cours</Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerText}>
          Des questions ? Répondez directement à cet email.
        </Text>
        <Text style={footer}>{SITE_NAME} — الفصل · alfasl.fr</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PresentielAccessGrantedEmail,
  subject: 'Votre espace cours ALFASL est prêt',
  displayName: 'Accès présentiel accordé',
  previewData: { studentName: 'Yacine' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f9fafb', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '0', maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' }
const header = { backgroundColor: '#0f5132', padding: '28px 24px', textAlign: 'center' as const }
const arabicTitle = { fontSize: '28px', color: '#a7f3d0', margin: '0', fontWeight: 'bold', letterSpacing: '2px' }
const logo = { fontSize: '16px', color: '#d1fae5', margin: '4px 0 0', letterSpacing: '4px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#111', margin: '28px 24px 8px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.7', margin: '0 24px 16px' }
const infoBox = { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '20px 24px', margin: '0 24px 28px' }
const infoTitle = { fontSize: '14px', fontWeight: 'bold', color: '#166534', margin: '0 0 12px' }
const infoItem = { fontSize: '14px', color: '#374151', margin: '6px 0', lineHeight: '1.5' }
const btn = { background: '#0f5132', color: '#ffffff', padding: '13px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const divider = { borderColor: '#e5e7eb', margin: '24px 24px 16px' }
const footerText = { fontSize: '13px', color: '#6b7280', margin: '0 24px 8px', textAlign: 'center' as const }
const footer = { fontSize: '12px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' as const, padding: '0 24px 24px' }
