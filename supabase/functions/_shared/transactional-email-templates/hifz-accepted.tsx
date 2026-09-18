import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  prenom?: string
}

const HifzAcceptedEmail = ({ prenom }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre candidature Hifd al-Qur'ān est acceptée</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d' }}>Candidature acceptée ✅</Heading>
        <Text>As-salâmu 'alaykum {prenom || ''},</Text>
        <Text>
          Nous avons le plaisir de vous informer que votre candidature au programme{' '}
          <strong>Hifd al-Qur'ān</strong> a été acceptée.
        </Text>
        <Hr style={{ borderColor: '#d1fae5', margin: '16px 0' }} />
        <Text>
          Le professeur va vous contacter très prochainement pour convenir des modalités de votre
          première séance (horaires, tarif, lien de connexion).
        </Text>
        <Text>
          En attendant, nous vous conseillons de vous assurer d'avoir une connexion internet stable
          et un espace calme pour vos séances.
        </Text>
        <Hr style={{ borderColor: '#d1fae5', margin: '16px 0' }} />
        <Text>
          Qu'Allah vous facilite la mémorisation de Son Livre et vous accorde la sincérité dans
          cette noble entreprise.
        </Text>
        <Text style={{ color: '#b45309', marginTop: 24 }}>Professeur ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HifzAcceptedEmail,
  subject: 'Votre candidature Hifd al-Qur\'ān est acceptée',
  displayName: 'Hifd — candidature acceptée (élève)',
  previewData: { prenom: 'Yacine' },
} satisfies TemplateEntry
