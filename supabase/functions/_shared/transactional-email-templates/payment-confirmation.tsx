import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button, Hr, Column, Row,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'
const APP_URL = 'https://alfasl.fr'
const LESSONS_URL = 'https://alfasl.fr/apprendre'
const MANAGE_URL = 'https://alfasl.fr/abonnement'

interface PaymentConfirmationProps {
  userName?: string
  userEmail?: string
  planName?: string
  amount?: string
  currency?: string
  periodEnd?: string
  invoiceUrl?: string
  subscriptionId?: string
}

const PaymentConfirmationEmail = ({
  userName,
  userEmail,
  planName = 'Essentiel',
  amount = '9.99',
  currency = 'EUR',
  periodEnd,
  invoiceUrl,
  subscriptionId,
}: PaymentConfirmationProps) => {
  const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase()
  const isPremium = planName.toLowerCase() === 'premium'

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Confirmation de paiement — Abonnement {planLabel} ALFASL activé</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={arabicTitle}>الفصل</Text>
            <Text style={logo}>{SITE_NAME}</Text>
          </Section>

          <Section style={successBanner}>
            <Text style={successIcon}>✅</Text>
            <Text style={successText}>Paiement confirmé</Text>
          </Section>

          <Heading style={h1}>Votre abonnement {planLabel} est actif</Heading>

          <Text style={text}>
            As-salâmu 'alaykum {userName || ''},
          </Text>
          <Text style={text}>
            Merci pour votre confiance ! Votre paiement a été accepté et votre abonnement{' '}
            <strong>{planLabel}</strong> est maintenant actif sur le compte <strong>{userEmail || ''}</strong>.
          </Text>

          <Section style={receiptBox}>
            <Text style={receiptTitle}>Récapitulatif</Text>
            <Row style={receiptRow}>
              <Column style={receiptLabel}>Plan</Column>
              <Column style={receiptValue}>{planLabel}</Column>
            </Row>
            <Row style={receiptRow}>
              <Column style={receiptLabel}>Montant</Column>
              <Column style={receiptValue}>{amount} {currency}</Column>
            </Row>
            {periodEnd && (
              <Row style={receiptRow}>
                <Column style={receiptLabel}>Prochain renouvellement</Column>
                <Column style={receiptValue}>{periodEnd}</Column>
              </Row>
            )}
            {subscriptionId && (
              <Row style={receiptRow}>
                <Column style={receiptLabel}>Référence</Column>
                <Column style={{ ...receiptValue, fontSize: '11px', color: '#9ca3af' }}>{subscriptionId.slice(0, 20)}…</Column>
              </Row>
            )}
          </Section>

          <Section style={featureBox}>
            <Text style={featureTitle}>
              {isPremium ? '🌟 Accès Premium — tout est déverrouillé :' : '✨ Accès Essentiel activé :'}
            </Text>
            {isPremium ? (
              <>
                <Text style={featureItem}>✅ Toutes les leçons d'arabe (niveaux 1 à 5)</Text>
                <Text style={featureItem}>✅ Application Coran complète avec audio</Text>
                <Text style={featureItem}>✅ Tuteur IA illimité (ElevenLabs)</Text>
                <Text style={featureItem}>✅ Téléchargement des fiches de révision</Text>
                <Text style={featureItem}>✅ Support prioritaire</Text>
              </>
            ) : (
              <>
                <Text style={featureItem}>✅ Leçons d'arabe niveau 1 & 2</Text>
                <Text style={featureItem}>✅ Application Coran (sourates choisies)</Text>
                <Text style={featureItem}>✅ Tuteur IA (30 interactions/mois)</Text>
              </>
            )}
          </Section>

          <Section style={{ textAlign: 'center', margin: '28px 0 16px' }}>
            <Button href={LESSONS_URL} style={btnPrimary}>Accéder à mes cours</Button>
          </Section>

          {invoiceUrl && (
            <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
              <Button href={invoiceUrl} style={btnSecondary}>Télécharger la facture</Button>
            </Section>
          )}

          <Hr style={divider} />

          <Text style={footerNote}>
            Vous pouvez gérer votre abonnement (modifier, annuler) à tout moment depuis{' '}
            <a href={MANAGE_URL} style={link}>votre espace abonnement</a>.
          </Text>
          <Text style={footer}>{SITE_NAME} — الفصل · <a href={APP_URL} style={link}>alfasl.fr</a></Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PaymentConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Confirmation de paiement — Abonnement ${data.planName || 'Essentiel'} ALFASL`,
  displayName: 'Confirmation de paiement (abonnement)',
  previewData: {
    userName: 'Yacine',
    userEmail: 'yacine@example.com',
    planName: 'premium',
    amount: '19.99',
    currency: 'EUR',
    periodEnd: '3 juin 2026',
    subscriptionId: 'sub_1TLAA8KXotpKdlTPXckHIYZl',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f9fafb', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '0', maxWidth: '560px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' }
const header = { backgroundColor: '#0f5132', padding: '28px 24px', textAlign: 'center' as const }
const arabicTitle = { fontSize: '28px', color: '#a7f3d0', margin: '0', fontWeight: 'bold', letterSpacing: '2px' }
const logo = { fontSize: '16px', color: '#d1fae5', margin: '4px 0 0', letterSpacing: '4px', textTransform: 'uppercase' as const }
const successBanner = { backgroundColor: '#f0fdf4', padding: '16px 24px', textAlign: 'center' as const, borderBottom: '1px solid #bbf7d0' }
const successIcon = { fontSize: '28px', margin: '0', lineHeight: '1' }
const successText = { fontSize: '15px', fontWeight: 'bold', color: '#166534', margin: '4px 0 0' }
const h1 = { fontSize: '20px', fontWeight: 'bold', color: '#111', margin: '24px 24px 8px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.7', margin: '0 24px 12px' }
const receiptBox = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', margin: '16px 24px 24px' }
const receiptTitle = { fontSize: '13px', fontWeight: 'bold', color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const receiptRow = { borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }
const receiptLabel = { fontSize: '13px', color: '#64748b', width: '50%' }
const receiptValue = { fontSize: '13px', color: '#1e293b', fontWeight: 'bold', textAlign: 'right' as const, width: '50%' }
const featureBox = { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '20px 24px', margin: '0 24px 28px' }
const featureTitle = { fontSize: '14px', fontWeight: 'bold', color: '#166534', margin: '0 0 12px' }
const featureItem = { fontSize: '13px', color: '#374151', margin: '5px 0', lineHeight: '1.5' }
const btnPrimary = { background: '#0f5132', color: '#ffffff', padding: '13px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', display: 'inline-block' }
const btnSecondary = { background: '#ffffff', color: '#0f5132', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', border: '2px solid #0f5132', display: 'inline-block' }
const divider = { borderColor: '#e5e7eb', margin: '24px 24px 16px' }
const footerNote = { fontSize: '12px', color: '#6b7280', margin: '0 24px 8px', textAlign: 'center' as const, lineHeight: '1.6' }
const footer = { fontSize: '12px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' as const, padding: '0 24px 24px' }
const link = { color: '#0f5132', textDecoration: 'none' }
