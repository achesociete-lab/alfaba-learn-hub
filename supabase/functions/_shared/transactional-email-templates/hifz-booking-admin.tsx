import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  studentEmail?: string
  date?: string
  time?: string
  message?: string
}

const HifzBookingAdminEmail = ({ studentName, studentEmail, date, time, message }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle réservation Hifd</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d' }}>Nouvelle réservation Hifd</Heading>
        <Text><strong>Élève :</strong> {studentName} ({studentEmail})</Text>
        <Text><strong>Date :</strong> {date}</Text>
        <Text><strong>Heure :</strong> {time}</Text>
        {message ? <Text><strong>Message :</strong> {message}</Text> : null}
        <Text style={{ color: '#999', marginTop: 24, fontSize: 12 }}>ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzBookingAdminEmail,
  subject: (data: Record<string, any>) => `Nouvelle réservation Hifd — ${data.studentName || ''}`,
  to: 'ache.societe@gmail.com',
  displayName: 'Réservation Hifd (admin)',
  previewData: { studentName: 'Yacine', studentEmail: 'y@example.com', date: '2026-06-01', time: '18:00', message: 'Hizb 30' },
} satisfies TemplateEntry
