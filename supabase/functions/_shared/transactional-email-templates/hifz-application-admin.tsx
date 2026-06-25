import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  prenom?: string
  niveauArabe?: string
  disponibilites?: string
  emailOuTelephone?: string
  message?: string
}

const HifzApplicationAdminEmail = ({ prenom, niveauArabe, disponibilites, emailOuTelephone, message }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle demande Hifd — {prenom}</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d', marginBottom: 4 }}>Nouvelle demande Hifd al-Qur'ān</Heading>
        <Text style={{ color: '#78350f', fontSize: 14, marginTop: 0 }}>Un candidat souhaite rejoindre le programme.</Text>
        <Hr style={{ borderColor: '#d1fae5', margin: '16px 0' }} />
        <Text><strong>Prénom :</strong> {prenom}</Text>
        <Text><strong>Niveau en arabe :</strong> {niveauArabe}</Text>
        <Text><strong>Disponibilités :</strong> {disponibilites}</Text>
        <Text><strong>Email / Téléphone :</strong> {emailOuTelephone}</Text>
        {message ? <Text><strong>Message :</strong> {message}</Text> : null}
        <Hr style={{ borderColor: '#d1fae5', margin: '16px 0' }} />
        <Text style={{ color: '#999', fontSize: 12 }}>
          Répondez directement à ce message ou contactez le candidat via ses coordonnées ci-dessus.
        </Text>
        <Text style={{ color: '#999', fontSize: 12 }}>ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzApplicationAdminEmail,
  subject: (data: Record<string, any>) => `Demande Hifd — ${data.prenom || 'Candidat'}`,
  to: 'abdelkarim7@gmail.com',
  displayName: 'Demande programme Hifd (admin)',
  previewData: {
    prenom: 'Yacine',
    niveauArabe: 'Sait lire l\'arabe',
    disponibilites: 'Lundi et jeudi soir, week-end matin',
    emailOuTelephone: 'yacine@example.com / 06 12 34 56 78',
    message: 'Je souhaite commencer dès que possible.',
  },
} satisfies TemplateEntry
