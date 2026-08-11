import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  sessionDate?: string
  sessionTime?: string
  rescheduleType?: 'retard' | 'reporter'
  message?: string
  proposedDate?: string
  proposedTime?: string
}

const HifzRescheduleRequestEmail = ({
  studentName, sessionDate, sessionTime,
  rescheduleType, message, proposedDate, proposedTime,
}: Props) => {
  const isRetard = rescheduleType === 'retard'
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>
        {isRetard
          ? `⚠️ ${studentName} signale un retard — séance du ${sessionDate}`
          : `📅 ${studentName} demande un report — séance du ${sessionDate}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: isRetard ? '#d97706' : '#1d4ed8' }}>
            <Text style={headerIcon}>{isRetard ? '⚠️' : '📅'}</Text>
            <Heading style={headerTitle}>
              {isRetard ? 'Retard signalé' : 'Demande de report'}
            </Heading>
            <Text style={headerSubtitle}>
              {studentName} · Séance du {sessionDate} à {sessionTime}
            </Text>
          </Section>

          <Section style={body}>
            <Text style={text}>
              <strong>{studentName}</strong> vous a envoyé une notification concernant la séance prévue le{' '}
              <strong>{sessionDate} à {sessionTime}</strong>.
            </Text>

            <Section style={{ ...infoBox, borderLeft: `4px solid ${isRetard ? '#d97706' : '#1d4ed8'}` }}>
              <Text style={infoLabel}>{isRetard ? '⚠️ Type : Retard' : '📅 Type : Demande de report'}</Text>
              {message && <Text style={infoText}>Message : « {message} »</Text>}
              {!isRetard && proposedDate && (
                <Text style={infoText}>
                  Nouveau créneau proposé : <strong>{proposedDate} à {proposedTime}</strong>
                </Text>
              )}
            </Section>

            <Text style={text}>
              Connectez-vous à votre tableau de bord admin pour traiter cette demande.
            </Text>
            <Text style={footer}>ALFASL — الفصل</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: HifzRescheduleRequestEmail,
  subject: (data: Record<string, any>) =>
    data.rescheduleType === 'retard'
      ? `⚠️ Retard signalé — ${data.studentName} · ${data.sessionDate}`
      : `📅 Demande de report — ${data.studentName} · ${data.sessionDate}`,
  to: 'contact@alfasl.fr',
  displayName: 'Hifd — demande de report/retard',
  previewData: {
    studentName: 'Yacine',
    sessionDate: 'lundi 9 juin 2026',
    sessionTime: '18:00',
    rescheduleType: 'reporter',
    message: 'Je ne pourrai pas être disponible ce soir.',
    proposedDate: 'mercredi 11 juin 2026',
    proposedTime: '19:00',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }
const header = { padding: '24px', textAlign: 'center' as const, color: '#ffffff' }
const headerIcon = { fontSize: '32px', margin: '0 0 6px', textAlign: 'center' as const, color: '#ffffff' }
const headerTitle = { fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px', textAlign: 'center' as const }
const headerSubtitle = { fontSize: '13px', color: '#ffffff', opacity: 0.9, margin: 0, textAlign: 'center' as const }
const body = { padding: '24px 28px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const infoBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px 16px', margin: '16px 0' }
const infoLabel = { fontSize: '13px', fontWeight: 'bold' as const, color: '#374151', margin: '0 0 6px' }
const infoText = { fontSize: '14px', color: '#374151', margin: '4px 0' }
const footer = { fontSize: '12px', color: '#b45309', marginTop: '24px', letterSpacing: '1px' }
