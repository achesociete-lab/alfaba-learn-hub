import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  date?: string
  time?: string
  message?: string
}

const HifzBookingConfirmationEmail = ({ studentName, date, time, message }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmation de votre réservation Hifd</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d' }}>Réservation reçue 🌙</Heading>
        <Text>As-salâmu ‘alaykum {studentName || ''},</Text>
        <Text>Votre demande de séance Hifd a bien été enregistrée :</Text>
        <Text><strong>Date :</strong> {date}</Text>
        <Text><strong>Heure :</strong> {time}</Text>
        {message ? <Text><strong>Votre message :</strong> {message}</Text> : null}
        <Text>Votre professeur vous confirmera la séance très prochainement, in shâ'a Llâh.</Text>
        <Text style={{ color: '#b45309', marginTop: 24 }}>ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzBookingConfirmationEmail,
  subject: 'Votre demande de séance Hifd a bien été reçue',
  displayName: 'Confirmation réservation Hifd',
  previewData: { studentName: 'Yacine', date: '2026-06-01', time: '18:00' },
} satisfies TemplateEntry
