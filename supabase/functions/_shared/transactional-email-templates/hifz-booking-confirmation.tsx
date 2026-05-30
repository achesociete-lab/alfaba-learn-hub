import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  date?: string
  time?: string
  message?: string
  sessionType?: string
  sessionTypeLabel?: string
  juzNumber?: number | null
}

const TYPE_META: Record<string, { color: string; icon: string; label: string; tip?: string }> = {
  sabaq:         { color: '#15803d', icon: '📗', label: 'Sabaq — Nouvelle mémorisation' },
  sabaq_para:    { color: '#b45309', icon: '📙', label: 'Sabaq Para — Révision récente', tip: 'Récitation sans mushaf des hizb des 30 derniers jours.' },
  dhor:          { color: '#7c3aed', icon: '📘', label: 'Dhor — Révision ancienne', tip: 'Le professeur tirera un ancien hizb au hasard parmi tes acquis.' },
  rattrapage:    { color: '#dc2626', icon: '🔴', label: 'Rattrapage', tip: 'Retour sur les hizb précédemment notés à retravailler.' },
  test_surprise: { color: '#ea580c', icon: '⚡', label: 'Test Surprise — 15 min', tip: 'Le professeur choisira les hizb le jour J — prépare-toi sur tout !' },
  khatm_partiel: { color: '#1e3a8a', icon: '🏁', label: 'Khatm Partiel — Juz complet' },
}

const HifzBookingConfirmationEmail = ({ studentName, date, time, message, sessionType, sessionTypeLabel, juzNumber }: Props) => {
  const meta = (sessionType && TYPE_META[sessionType]) || { color: '#15803d', icon: '🌙', label: sessionTypeLabel || 'Séance Hifd' }
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Réservation Hifd confirmée — {date} {time}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: meta.color }}>
            <Text style={headerIcon}>{meta.icon}</Text>
            <Heading style={headerTitle}>Réservation reçue</Heading>
            <Text style={headerSubtitle}>{meta.label}</Text>
          </Section>

          <Section style={body}>
            <Text style={text}>As-salâmu ‘alaykum {studentName || ''},</Text>
            <Text style={text}>Votre demande de séance Hifd a bien été enregistrée.</Text>

            <Section style={{ ...card, borderLeft: `4px solid ${meta.color}` }}>
              <Text style={cardRow}><strong>📅 Date :</strong> {date}</Text>
              <Text style={cardRow}><strong>🕐 Heure :</strong> {time}</Text>
              {juzNumber ? <Text style={cardRow}><strong>📖 Juz :</strong> {juzNumber}</Text> : null}
            </Section>

            {meta.tip ? (
              <Section style={{ ...tipBox, backgroundColor: `${meta.color}15`, borderLeft: `3px solid ${meta.color}` }}>
                <Text style={{ ...tipText, color: meta.color }}>💡 {meta.tip}</Text>
              </Section>
            ) : null}

            {sessionType === 'khatm_partiel' && juzNumber ? (
              <Section style={{ ...tipBox, backgroundColor: '#1e3a8a15', borderLeft: '3px solid #1e3a8a' }}>
                <Text style={{ ...tipText, color: '#1e3a8a' }}>🏁 Tu réciteras le Juz {juzNumber} en intégralité — prépare ta fluidité !</Text>
              </Section>
            ) : null}

            {message ? (
              <Section style={messageBox}>
                <Text style={messageLabel}>Votre message :</Text>
                <Text style={messageContent}>{message}</Text>
              </Section>
            ) : null}

            <Hr style={hr} />
            <Text style={text}>Votre professeur vous confirmera la séance très prochainement, in shâ'a Llâh.</Text>
            <Text style={signature}>Qu'Allah facilite ton hifd 🤲</Text>
            <Text style={brand}>ALFASL — الفصل</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: HifzBookingConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Hifd — Réservation ${data.sessionTypeLabel ? data.sessionTypeLabel + ' ' : ''}confirmée le ${data.date || ''}`,
  displayName: 'Confirmation réservation Hifd',
  previewData: {
    studentName: 'Yacine',
    date: '2026-06-01',
    time: '18:00',
    sessionType: 'dhor',
    sessionTypeLabel: 'Dhor',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }
const header = { padding: '32px 24px', textAlign: 'center' as const, color: '#ffffff' }
const headerIcon = { fontSize: '40px', margin: '0 0 8px', textAlign: 'center' as const, color: '#ffffff' }
const headerTitle = { fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px', textAlign: 'center' as const }
const headerSubtitle = { fontSize: '14px', color: '#ffffff', opacity: 0.9, margin: 0, textAlign: 'center' as const }
const body = { padding: '24px 28px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const card = { backgroundColor: '#fafafa', padding: '14px 16px', borderRadius: '6px', margin: '16px 0' }
const cardRow = { fontSize: '14px', color: '#374151', margin: '4px 0' }
const tipBox = { padding: '12px 14px', borderRadius: '4px', margin: '12px 0' }
const tipText = { fontSize: '13px', margin: 0, lineHeight: '1.5' }
const messageBox = { backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '6px', margin: '12px 0' }
const messageLabel = { fontSize: '12px', color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase' as const }
const messageContent = { fontSize: '14px', color: '#374151', fontStyle: 'italic' as const, margin: 0 }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const signature = { fontSize: '14px', color: '#15803d', fontWeight: 'bold' as const, margin: '8px 0' }
const brand = { fontSize: '12px', color: '#b45309', marginTop: '16px', letterSpacing: '1px' }
