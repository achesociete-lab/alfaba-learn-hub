import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface EvalItem {
  hizb_number: number
  status: string
  niveau?: string | null
  notes?: string | null
  fluidity?: string | null
  without_mushaf?: boolean | null
}

interface Props {
  studentName?: string
  date?: string
  sessionType?: string
  sessionTypeLabel?: string
  evaluations?: EvalItem[]
}

const TYPE_META: Record<string, { color: string; icon: string; label: string }> = {
  sabaq:         { color: '#15803d', icon: '📗', label: 'Sabaq — Nouvelle mémorisation' },
  sabaq_para:    { color: '#b45309', icon: '📙', label: 'Sabaq Para — Révision récente' },
  dhor:          { color: '#7c3aed', icon: '📘', label: 'Dhor — Révision ancienne' },
  rattrapage:    { color: '#dc2626', icon: '🔴', label: 'Rattrapage' },
  test_surprise: { color: '#ea580c', icon: '⚡', label: 'Test Surprise' },
  khatm_partiel: { color: '#1e3a8a', icon: '🏁', label: 'Khatm Partiel' },
}

const NIVEAU: Record<string, { label: string; color: string }> = {
  mediocre:  { label: 'Médiocre',  color: '#dc2626' },
  moyen:     { label: 'Moyen',     color: '#ea580c' },
  bon:       { label: 'Bon',       color: '#15803d' },
  excellent: { label: 'Excellent', color: '#047857' },
}

const FLUIDITY: Record<string, string> = {
  hesitante: 'Hésitante',
  correcte: 'Correcte',
  fluide: 'Fluide',
}

const HifzSessionEvaluatedEmail = ({ studentName, date, sessionType, sessionTypeLabel, evaluations = [] }: Props) => {
  const meta = (sessionType && TYPE_META[sessionType]) || { color: '#15803d', icon: '📚', label: sessionTypeLabel || 'Séance Hifd' }
  const validated = evaluations.filter((e) => e.status === 'valide').length
  const total = evaluations.length

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Résultat de ta séance Hifd — {validated}/{total} validé(s)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: meta.color }}>
            <Text style={headerIcon}>{meta.icon}</Text>
            <Heading style={headerTitle}>Résultat de ta séance</Heading>
            <Text style={headerSubtitle}>{meta.label}</Text>
          </Section>

          <Section style={body}>
            <Text style={text}>As-salâmu ‘alaykum {studentName || ''},</Text>
            <Text style={text}>Voici l'évaluation de ta séance du <strong>{date}</strong> :</Text>

            <Section style={{ ...summary, borderLeft: `4px solid ${meta.color}` }}>
              <Text style={summaryText}>
                <strong style={{ color: meta.color, fontSize: '20px' }}>{validated}/{total}</strong>{' '}
                hizb validé{validated > 1 ? 's' : ''}
              </Text>
            </Section>

            {evaluations.map((e, i) => {
              const isValid = e.status === 'valide'
              const niveau = e.niveau ? NIVEAU[e.niveau] : null
              return (
                <Section
                  key={i}
                  style={{
                    ...evalCard,
                    borderLeft: `4px solid ${isValid ? (niveau?.color || '#15803d') : '#dc2626'}`,
                  }}
                >
                  <Text style={hizbTitle}>Hizb {e.hizb_number}</Text>
                  <Text style={resultLine}>
                    {isValid ? (
                      <>✅ <strong style={{ color: niveau?.color || '#15803d' }}>Validé</strong>
                        {niveau ? <> — <span style={{ color: niveau.color }}>{niveau.label}</span></> : null}</>
                    ) : (
                      <>❌ <strong style={{ color: '#dc2626' }}>À retravailler</strong></>
                    )}
                  </Text>
                  {e.fluidity ? (
                    <Text style={metaLine}>Fluidité : {FLUIDITY[e.fluidity] || e.fluidity}</Text>
                  ) : null}
                  {e.without_mushaf ? (
                    <Text style={metaLine}>📕 Sans mushaf</Text>
                  ) : null}
                  {e.notes ? (
                    <Section style={notesBox}>
                      <Text style={notesText}>« {e.notes} »</Text>
                    </Section>
                  ) : null}
                </Section>
              )
            })}

            <Hr style={hr} />
            <Text style={text}>Qu'Allah te récompense pour tes efforts et facilite la suite de ton hifd 🤲</Text>
            <Text style={brand}>Professeur ALFASL — الفصل</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: HifzSessionEvaluatedEmail,
  subject: (data: Record<string, any>) =>
    `Hifd — Résultat ${data.sessionTypeLabel ? data.sessionTypeLabel + ' ' : ''}du ${data.date || ''}`,
  displayName: 'Hifd — résultat de séance',
  previewData: {
    studentName: 'Yacine',
    date: '2026-06-01',
    sessionType: 'dhor',
    sessionTypeLabel: 'Dhor',
    evaluations: [
      { hizb_number: 30, status: 'valide', niveau: 'bon', fluidity: 'fluide', without_mushaf: true, notes: 'Bonne récitation, attention aux liaisons' },
      { hizb_number: 29, status: 'a_retravailler', notes: 'Revoir les ayât 5-10' },
    ],
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
const summary = { backgroundColor: '#fafafa', padding: '14px 16px', borderRadius: '6px', margin: '16px 0' }
const summaryText = { fontSize: '15px', color: '#374151', margin: 0 }
const evalCard = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px 16px', margin: '10px 0' }
const hizbTitle = { fontSize: '16px', fontWeight: 'bold' as const, color: '#111827', margin: '0 0 6px' }
const resultLine = { fontSize: '14px', color: '#374151', margin: '4px 0' }
const metaLine = { fontSize: '13px', color: '#6b7280', margin: '4px 0' }
const notesBox = { backgroundColor: '#f9fafb', padding: '8px 12px', borderRadius: '4px', marginTop: '8px' }
const notesText = { fontSize: '13px', color: '#4b5563', fontStyle: 'italic' as const, margin: 0 }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const brand = { fontSize: '12px', color: '#b45309', marginTop: '16px', letterSpacing: '1px' }
