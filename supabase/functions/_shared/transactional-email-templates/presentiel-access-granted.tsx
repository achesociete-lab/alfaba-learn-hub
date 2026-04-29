import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const APP_URL = 'https://alfasl.fr/auth'

interface Props {
  studentName?: string
}

const PresentielAccessGrantedEmail = ({ studentName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre accès aux cours présentiel ALFASL est activé</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Accès accordé 🎉</Heading>
        <Text style={text}>
          As-salâmu ‘alaykum {studentName || ''},
        </Text>
        <Text style={text}>
          Votre compte présentiel sur <strong>{SITE_NAME}</strong> vient d'être validé par votre professeur.
          Vous pouvez désormais vous connecter et accéder à vos cours.
        </Text>
        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
          <Button href={APP_URL} style={btn}>Accéder à mes cours</Button>
        </Section>
        <Text style={footer}>{SITE_NAME} — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PresentielAccessGrantedEmail,
  subject: 'Votre accès ALFASL est activé',
  displayName: 'Accès présentiel accordé',
  previewData: { studentName: 'Yacine' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f5132', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const btn = { background: '#0f5132', color: '#ffffff', padding: '12px 22px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '12px', color: '#999', marginTop: '32px', textAlign: 'center' as const }
