import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  childName?: string
  siteUrl?: string
}

const ParentInviteEmail = ({ childName, siteUrl = 'https://alfasl.fr' }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre espace parent pour {childName} est prêt — accédez en un clic</Preview>
    <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0fdf4' }}>
      <Container style={{ padding: '40px 32px', maxWidth: '560px', margin: '0 auto' }}>
        <Heading style={{ color: '#15803d', marginBottom: 4, fontSize: 22 }}>
          Espace Parent — ALFASL الفصل
        </Heading>
        <Text style={{ color: '#166534', fontSize: 16, marginBottom: 8 }}>
          Assalamu alaykum,
        </Text>
        <Text style={{ color: '#374151', fontSize: 15, lineHeight: '1.6' }}>
          Votre enfant <strong>{childName}</strong> suit les cours sur <strong>alfasl.fr</strong>.
          Votre professeur vous invite à accéder à son espace parent pour suivre sa progression,
          consulter ses présences et lire les messages du professeur.
        </Text>
        <Hr style={{ borderColor: '#bbf7d0', margin: '28px 0' }} />
        <Text style={{ color: '#374151', fontSize: 14, marginBottom: 8 }}>
          Cliquez sur le bouton ci-dessous pour accéder à la plateforme :
        </Text>
        <Button
          href={siteUrl}
          style={{
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '16px 32px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: 16,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Accéder à mon espace parent →
        </Button>
        <Hr style={{ borderColor: '#bbf7d0', margin: '28px 0' }} />
        <Text style={{ color: '#6b7280', fontSize: 13, lineHeight: '1.6' }}>
          Connectez-vous avec cette adresse email (<strong>{'{parentEmail}'}</strong>) sur alfasl.fr.
          Si vous n'avez pas encore de compte, créez-en un gratuitement — votre espace parent
          s'activera automatiquement.
        </Text>
        <Text style={{ color: '#9ca3af', fontSize: 12 }}>ALFASL — الفصل · alfasl.fr</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ParentInviteEmail,
  subject: (data: Record<string, any>) => `Votre espace parent pour ${data.childName || 'votre enfant'} — ALFASL`,
  displayName: 'Invitation parent',
  previewData: {
    childName: 'Ibrahim D.',
    siteUrl: 'https://alfasl.fr',
  },
} satisfies TemplateEntry
