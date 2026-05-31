import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  date?: string
  time?: string
  sessionTypeLabel?: string
  sessionType?: string
  meetLink?: string | null
  juzNumber?: number | null
  pageRange?: string | null
}

const TYPE_META: Record<string, { color: string; icon: string; tip: string }> = {
  sabaq:         { color: '#15803d', icon: '📗', tip: 'Préparez votre nouvelle portion mémorisée — récitez-la 5× ce soir.' },
  sabaq_para:    { color: '#b45309', icon: '📙', tip: 'Révisez vos hizb des dernières semaines sans regarder le mushaf.' },
  dhor:          { color: '#7c3aed', icon: '📘', tip: 'Le professeur tirera un ancien hizb au hasard — préparez-vous sur l'ensemble.' },
  rattrapage:    { color: '#dc2626', icon: '🔴', tip: 'Retravaillez les hizb notés Médiocre ou À retravailler.' },
  test_surprise: { color: '#ea580c', icon: '⚡', tip: 'Session test — le professeur choisira. Préparez-vous sur tout !' },
  khatm_partiel: { color: '#1e3a8a', icon: '🏁', tip: 'Préparez votre fluidité pour réciter le Juz en intégralité sans interruption.' },
}

const HifzSessionReminderEmail = ({ studentName, date, time, sessionType, sessionTypeLabel, meetLink, juzNumber, pageRange }: Props) => {
  const meta = (sessionType && TYPE_META[sessionType]) || { color: '#15803d', icon: '🌙', tip: 'Préparez-vous pour votre séance.' }
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Rappel — Votre séance Hifd est demain · {date} à {time}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: meta.color }}>
            <Text style={headerIcon}>{meta.icon}</Text>
            <Heading style={headerTitle}>Séance demain</Heading>
            <Text style={headerSubtitle}>{sessionTypeLabel || 'Séance Hifd'}</Text>
          </Section>

          <Section style={body}>
            <Text style={text}>As-salâmu 'alaykum {studentName || ''},</Text>
            <Text style={text}>Votre séance Hifd est <strong>demain</strong>. Voici un rappel :</Text>

            <Section style={{ ...card, borderLeft: `4px solid ${meta.color}` }}>
              <Text style={cardRow}><strong>📅 Date :</strong> {date}</Text>
              <Text style={cardRow}><strong>🕐 Heure :</strong> {time}</Text>
              {juzNumber ? <Text style={cardRow}><strong>📖 Juz :</strong> {juzNumber}</Text> : null}
              {pageRange ? <Text style={cardRow}><strong>📄 Pages prévues :</strong> {pageRange}</Text> : null}
            </Section>

            <Section style={{ ...tipBox, backgroundColor: `${meta.color}15`, borderLeft: `3px solid ${meta.color}` }}>
              <Text style={{ ...tipText, color: meta.color }}>💡 {meta.tip}</Text>
            </Section>

            {meetLink ? (
              <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
                <Text style={text}>Le lien de votre séance Google Meet :</Text>
                <a href={meetLink} style={button}>
                  🎥 Rejoindre la séance
                </a>
              </Section>
            ) : (
              <Text style={{ ...text, color: '#b45309', fontStyle: 'italic' }}>Le lien Meet vous sera communiqué avant la séance.</Text>
            )}

            <Hr style={hr} />
            <Text style={signature}>Qu'Allah facilite ton hifd 🤲</Text>
            <Text style={brand}>ALFASL — الفصل</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: HifzSessionReminderEmail,
  subject: (data: Record<string, any>) =>
    `Rappel — Votre séance Hifd demain ${data.date ? '· ' + data.date : ''}`,
  displayName: 'Rappel séance Hifd J-1',
  previewData: {
    studentName: 'Yacine',
    date: 'lundi 1 juin',
    time: '18:00',
    sessionType: 'dhor',
    sessionTypeLabel: 'Révision ancienne',
    meetLink: null,
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
const button = { display: 'inline-block', backgroundColor: '#15803d', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const signature = { fontSize: '14px', color: '#15803d', fontWeight: 'bold' as const, margin: '8px 0' }
const brand = { fontSize: '12px', color: '#b45309', marginTop: '16px', letterSpacing: '1px' }
