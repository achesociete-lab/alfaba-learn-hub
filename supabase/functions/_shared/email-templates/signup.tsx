/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre inscription sur ALFASL الفصل</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={logo}>ALFASL <span style={arabicLogo}>الفصل</span></Text>
        <Heading style={h1}>Bienvenue sur ALFASL !</Heading>
        <Text style={text}>
          Merci de vous être inscrit(e) sur{' '}
          <Link href={siteUrl} style={link}>
            <strong>ALFASL</strong>
          </Link>
          , votre plateforme d'apprentissage de la langue arabe.
        </Text>
        <Text style={text}>
          Veuillez confirmer votre adresse email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) en cliquant sur le bouton ci-dessous :
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmer mon email
        </Button>
        <Text style={footer}>
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const logo = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(166, 82%, 27%)',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
const arabicLogo = {
  fontFamily: "'Amiri', serif",
  color: 'hsl(40, 60%, 55%)',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(160, 40%, 10%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(160, 15%, 40%)',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'hsl(166, 82%, 27%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(166, 82%, 27%)',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '0.75rem',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
