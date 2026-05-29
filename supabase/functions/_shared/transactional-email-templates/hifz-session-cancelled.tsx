import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  date?: string
  time?: string
  reason?: string
}

const HifzSessionCancelledEmail = ({ studentName, date, time, reason }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre séance Hifd a été annulée</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#b45309' }}>Séance Hifd annulée</Heading>
        <Text>As-salâmu ‘alaykum {studentName || ''},</Text>
        <Text>Votre séance prévue le <strong>{date}</strong> à <strong>{time}</strong> a été annulée.</Text>
        {reason ? <Text><strong>Motif :</strong> {reason}</Text> : null}
        <Text>N'hésitez pas à réserver un autre créneau depuis votre espace Hifd.</Text>
        <Text style={{ color: '#b45309', marginTop: 24 }}>Professeur ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzSessionCancelledEmail,
  subject: 'Votre séance Hifd a été annulée',
  displayName: 'Hifd — séance annulée',
  previewData: { studentName: 'Yacine', date: '2026-06-01', time: '18:00' },
} satisfies TemplateEntry
