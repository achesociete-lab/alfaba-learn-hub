import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_URL = 'https://alfasl.fr'

interface Props {
  studentName?: string
  sessionDate?: string
  sessionTime?: string
  proposedDate?: string
  proposedTime?: string
  message?: string
}

const HifzRescheduleProposalEmail = ({ studentName, sessionDate, sessionTime, proposedDate, proposedTime, message }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>📅 Votre professeur propose de reporter votre séance du {sessionDate}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={headerIcon}>📅</Text>
          <Heading style={headerTitle}>Demande de report</Heading>
          <Text style={headerSubtitle}>Séance du {sessionDate} à {sessionTime}</Text>
        </Section>

        <Section style={body}>
          <Text style={text}>As-salâmu 'alaykum {studentName || ''},</Text>
          <Text style={text}>
            Votre professeur ne peut malheureusement pas maintenir la séance prévue le{' '}
            <strong>{sessionDate} à {sessionTime}</strong> et vous propose de la reporter.
          </Text>

          {proposedDate && (
            <Section style={proposalBox}>
              <Text style={proposalLabel}>📆 Nouveau créneau proposé :</Text>
              <Text style={proposalDate}>{proposedDate} à {proposedTime}</Text>
            </Section>
          )}

          {message && (
            <Section style={messageBox}>
              <Text style={messageLabel}>💬 Message du professeur :</Text>
              <Text style={messageText}>« {message} »</Text>
            </Section>
          )}

          <Text style={text}>
            Connectez-vous à votre espace pour accepter ou refuser ce report.
          </Text>

          <Section style={{ textAlign: 'center' as const, margin: '20px 0' }}>
            <Button href={`${APP_URL}/hifz`} style={btn}>Voir mes séances</Button>
          </Section>

          <Text style={footer}>Qu'Allah facilite votre mémorisation 🤲</Text>
          <Text style={brand}>Professeur ALFASL — الفصل</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzRescheduleProposalEmail,
  subject: (data: Record<string, any>) =>
    `📅 Report de séance — ${data.proposedDate ? `nouveau créneau : ${data.proposedDate}` : 'à confirmer'}`,
  displayName: 'Hifd — proposition de report (professeur → élève)',
  previewData: {
    studentName: 'Yacine',
    sessionDate: 'lundi 9 juin 2026',
    sessionTime: '18:00',
    proposedDate: 'mercredi 11 juin 2026',
    proposedTime: '19:00',
    message: 'Je ne serai pas disponible lundi soir, désolé pour ce changement.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1d4ed8', padding: '24px', textAlign: 'center' as const }
const headerIcon = { fontSize: '32px', margin: '0 0 6px', textAlign: 'center' as const, color: '#ffffff' }
const headerTitle = { fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px', textAlign: 'center' as const }
const headerSubtitle = { fontSize: '13px', color: '#ffffff', opacity: 0.85, margin: 0, textAlign: 'center' as const }
const body = { padding: '24px 28px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const proposalBox = { backgroundColor: '#eff6ff', border: '2px solid #1d4ed8', borderRadius: '8px', padding: '14px 18px', margin: '16px 0' }
const proposalLabel = { fontSize: '12px', fontWeight: 'bold' as const, color: '#1d4ed8', margin: '0 0 4px' }
const proposalDate = { fontSize: '18px', fontWeight: 'bold' as const, color: '#1e40af', margin: 0 }
const messageBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderLeft: '4px solid #1d4ed8', borderRadius: '6px', padding: '12px 16px', margin: '12px 0' }
const messageLabel = { fontSize: '12px', fontWeight: 'bold' as const, color: '#6b7280', margin: '0 0 4px' }
const messageText = { fontSize: '14px', color: '#374151', fontStyle: 'italic' as const, margin: 0 }
const btn = { backgroundColor: '#1d4ed8', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 8px' }
const brand = { fontSize: '12px', color: '#b45309', marginTop: '16px', letterSpacing: '1px' }
