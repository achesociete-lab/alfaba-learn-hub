import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Student {
  name: string
  email: string
  level: string
}

interface Props {
  students?: Student[]
  successCount?: number
  date?: string
}

const AdminRelanceSummaryEmail = ({ students = [], successCount = 0, date = '' }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{successCount} email(s) de relance envoyés — {date}</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d', marginBottom: 4 }}>Récapitulatif des relances</Heading>
        <Text style={{ color: '#78350f', fontSize: 14, marginTop: 0 }}>
          {successCount} email(s) de relance envoyés le {date}.
        </Text>
        <Hr style={{ borderColor: '#d1fae5', margin: '16px 0' }} />
        {students.map((s, i) => (
          <Text key={i} style={{ fontSize: 14, margin: '4px 0' }}>
            • <strong>{s.name}</strong> ({s.email}) — {s.level === 'niveau_1' ? 'Niveau 1' : 'Niveau 2'}
          </Text>
        ))}
        <Hr style={{ borderColor: '#d1fae5', margin: '16px 0' }} />
        <Text style={{ color: '#999', fontSize: 12 }}>ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminRelanceSummaryEmail,
  subject: (data: Record<string, any>) => `Relances envoyées — ${data.successCount ?? 0} élève(s) le ${data.date ?? ''}`,
  to: 'ache.societe@gmail.com',
  displayName: 'Récapitulatif relances (admin)',
  previewData: {
    students: [
      { name: 'Fatima D.', email: 'fatima@example.com', level: 'niveau_1' },
      { name: 'Yacine M.', email: 'yacine@example.com', level: 'niveau_2' },
    ],
    successCount: 2,
    date: '2026-08-06',
  },
} satisfies TemplateEntry
