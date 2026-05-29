import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  date?: string
  time?: string
  meetLink?: string
}

const HifzSessionConfirmedEmail = ({ studentName, date, time, meetLink }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre séance Hifd est confirmée</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d' }}>Séance Hifd confirmée ✅</Heading>
        <Text>As-salâmu ‘alaykum {studentName || ''},</Text>
        <Text>Votre séance de mémorisation est confirmée :</Text>
        <Text><strong>Date :</strong> {date}</Text>
        <Text><strong>Heure :</strong> {time}</Text>
        {meetLink ? (
          <Text>
            <strong>Lien Google Meet :</strong>{' '}
            <Link href={meetLink} style={{ color: '#15803d' }}>{meetLink}</Link>
          </Text>
        ) : null}
        <Text>Préparez bien vos hizb, qu'Allah facilite votre mémorisation.</Text>
        <Text style={{ color: '#b45309', marginTop: 24 }}>Professeur ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzSessionConfirmedEmail,
  subject: 'Votre séance Hifd est confirmée',
  displayName: 'Hifd — séance confirmée',
  previewData: { studentName: 'Yacine', date: '2026-06-01', time: '18:00', meetLink: 'https://meet.google.com/abc-defg-hij' },
} satisfies TemplateEntry
