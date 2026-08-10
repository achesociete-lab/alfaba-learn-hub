import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  ownerName?: string
  inviteUrl?: string
}

const FamilyInviteEmail = ({ ownerName, inviteUrl }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{ownerName} vous invite à rejoindre la famille ALFASL</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf8ef' }}>
      <Container style={{ padding: '32px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d', marginBottom: 4 }}>
          Invitation famille ALFASL — الفصل
        </Heading>
        <Text style={{ color: '#78350f', fontSize: 15 }}>
          <strong>{ownerName}</strong> vous invite à rejoindre son abonnement <strong>Famille</strong> sur ALFASL.
        </Text>
        <Text style={{ color: '#78350f', fontSize: 14 }}>
          Vous aurez accès à l'intégralité de la plateforme : Niveau 1 &amp; 2, le tuteur IA Musa'id
          et votre parcours personnalisé (مساري, « mon chemin » en arabe).
        </Text>
        <Hr style={{ borderColor: '#d1fae5', margin: '24px 0' }} />
        <Button
          href={inviteUrl}
          style={{
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: 15,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Rejoindre la famille →
        </Button>
        <Text style={{ color: '#999', fontSize: 12, marginTop: 24 }}>
          Ce lien est valable 7 jours. Si vous n'attendiez pas cette invitation, ignorez cet email.
        </Text>
        <Text style={{ color: '#999', fontSize: 12 }}>ALFASL — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FamilyInviteEmail,
  subject: (data: Record<string, any>) => `${data.ownerName || 'Quelqu\'un'} vous invite sur ALFASL`,
  displayName: 'Invitation famille',
  previewData: {
    ownerName: 'Ahmed B.',
    inviteUrl: 'https://alfasl.fr/famille/rejoindre?token=abc123',
  },
} satisfies TemplateEntry
