import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface EvalItem {
  hizb_number: number
  status: string
  niveau?: string | null
  notes?: string | null
}

interface Props {
  studentName?: string
  date?: string
  evaluations?: EvalItem[]
}

const NIVEAU: Record<string, string> = {
  mediocre: 'Médiocre',
  moyen: 'Moyen',
  bon: 'Bon',
  excellent: 'Excellent',
}

const HifzSessionEvaluatedEmail = ({ studentName, date, evaluations = [] }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Résultat de votre séance Hifd</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d' }}>Résultat de votre séance Hifd</Heading>
        <Text>As-salâmu ‘alaykum {studentName || ''},</Text>
        <Text>Voici l'évaluation de votre séance du <strong>{date}</strong> :</Text>
        <Section>
          {evaluations.map((e, i) => (
            <Section
              key={i}
              style={{
                border: '1px solid #d6e7d8',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                backgroundColor: '#ffffff',
              }}
            >
              <Text style={{ margin: 0, fontWeight: 'bold', color: '#15803d' }}>
                Hizb {e.hizb_number}
              </Text>
              <Text style={{ margin: '4px 0' }}>
                <strong>Résultat :</strong>{' '}
                {e.status === 'valide'
                  ? `✅ Validé${e.niveau ? ` — ${NIVEAU[e.niveau] || e.niveau}` : ''}`
                  : '❌ À retravailler'}
              </Text>
              {e.notes ? (
                <Text style={{ margin: '4px 0', color: '#555' }}>
                  <em>{e.notes}</em>
                </Text>
              ) : null}
            </Section>
          ))}
        </Section>
        <Text>Qu'Allah vous récompense pour vos efforts.</Text>
        <Text style={{ color: '#b45309', marginTop: 24 }}>Professeur ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzSessionEvaluatedEmail,
  subject: (data: Record<string, any>) => `Résultat de ta session Hifd du ${data.date || ''}`,
  displayName: 'Hifd — résultat de séance',
  previewData: {
    studentName: 'Yacine',
    date: '2026-06-01',
    evaluations: [
      { hizb_number: 30, status: 'valide', niveau: 'bon', notes: 'Bonne récitation' },
      { hizb_number: 29, status: 'a_retravailler', notes: 'Revoir les ayât 5-10' },
    ],
  },
} satisfies TemplateEntry
