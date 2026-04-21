import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const ADMIN_URL = 'https://alfasl.fr/admin'

interface AdminPendingSignupProps {
  studentName?: string
  studentEmail?: string
}

const AdminPendingSignupEmail = ({ studentName, studentEmail }: AdminPendingSignupProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle inscription en attente de validation sur {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nouvelle inscription Présentiel</Heading>
        <Text style={text}>
          Un nouvel élève vient de s'inscrire en présentiel et attend votre validation pour accéder à son espace.
        </Text>
        <Section style={infoBox}>
          <Text style={infoLine}><strong>Élève :</strong> {studentName || 'Non renseigné'}</Text>
          <Text style={infoLine}><strong>Email :</strong> {studentEmail || 'Non renseigné'}</Text>
        </Section>
        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button href={ADMIN_URL} style={btn}>Ouvrir l'espace admin</Button>
        </Section>
        <Text style={footer}>{SITE_NAME} — Notification automatique</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminPendingSignupEmail,
  subject: 'Nouvelle inscription Présentiel à valider',
  displayName: 'Inscription présentiel en attente',
  previewData: { studentName: 'Yacine Benali', studentEmail: 'yacine@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f5132', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const infoBox = { background: '#f6f9f6', border: '1px solid #d6e6dc', borderRadius: '8px', padding: '16px', margin: '12px 0' }
const infoLine = { fontSize: '14px', color: '#222', margin: '4px 0' }
const btn = { background: '#0f5132', color: '#ffffff', padding: '12px 22px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '12px', color: '#999', marginTop: '32px', textAlign: 'center' as const }
