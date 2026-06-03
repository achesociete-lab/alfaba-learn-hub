import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_URL = 'https://alfasl.fr'

interface Props {
  studentName?: string
  courseName?: string
  stepType?: string
  status?: 'validee' | 'a_corriger'
  feedback?: string
}

const STEP_LABEL: Record<string, string> = {
  lecture: 'Lecture',
  ecriture: 'Écriture',
  dictee: 'Dictée',
}

const PresentielCorrectionEmail = ({ studentName, courseName, stepType, status, feedback }: Props) => {
  const isValid = status === 'validee'
  const stepLabel = (stepType && STEP_LABEL[stepType]) || stepType || 'Exercice'

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>
        {isValid
          ? `✅ Ton travail de ${stepLabel} a été validé !`
          : `📝 Ton travail de ${stepLabel} nécessite des corrections`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: isValid ? '#15803d' : '#b45309' }}>
            <Text style={headerIcon}>{isValid ? '✅' : '📝'}</Text>
            <Heading style={headerTitle}>
              {isValid ? 'Travail validé !' : 'À corriger'}
            </Heading>
            <Text style={headerSubtitle}>{courseName || 'Cours présentiel'} · {stepLabel}</Text>
          </Section>

          <Section style={body}>
            <Text style={text}>As-salâmu 'alaykum {studentName || ''},</Text>
            {isValid ? (
              <Text style={text}>
                Ton professeur a <strong style={{ color: '#15803d' }}>validé</strong> ton travail de <strong>{stepLabel}</strong>.
                Bonne continuation !
              </Text>
            ) : (
              <Text style={text}>
                Ton professeur a examiné ton travail de <strong>{stepLabel}</strong> et te demande de le <strong style={{ color: '#b45309' }}>corriger</strong>.
              </Text>
            )}

            {feedback && (
              <Section style={feedbackBox}>
                <Text style={feedbackLabel}>💬 Commentaire du professeur :</Text>
                <Text style={feedbackText}>« {feedback} »</Text>
              </Section>
            )}

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button href={APP_URL} style={{ ...btn, backgroundColor: isValid ? '#15803d' : '#b45309' }}>
                Voir mes cours
              </Button>
            </Section>

            <Text style={footer}>Qu'Allah te récompense pour tes efforts 🤲</Text>
            <Text style={brand}>Professeur ALFASL — الفصل</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PresentielCorrectionEmail,
  subject: (data: Record<string, any>) =>
    data.status === 'validee'
      ? `✅ Ton travail de ${STEP_LABEL[data.stepType] || data.stepType || 'présentiel'} est validé`
      : `📝 Ton travail de ${STEP_LABEL[data.stepType] || data.stepType || 'présentiel'} est à corriger`,
  displayName: 'Correction présentiel',
  previewData: {
    studentName: 'Yacine',
    courseName: 'Leçon 5 — Lettres arabes',
    stepType: 'ecriture',
    status: 'a_corriger',
    feedback: 'Attention à la forme du qaf, reprends la leçon 3.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }
const header = { padding: '28px 24px', textAlign: 'center' as const, color: '#ffffff' }
const headerIcon = { fontSize: '36px', margin: '0 0 8px', textAlign: 'center' as const, color: '#ffffff' }
const headerTitle = { fontSize: '22px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 4px', textAlign: 'center' as const }
const headerSubtitle = { fontSize: '13px', color: '#ffffff', opacity: 0.9, margin: 0, textAlign: 'center' as const }
const body = { padding: '24px 28px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const feedbackBox = { backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderLeft: '4px solid #b45309', borderRadius: '6px', padding: '14px 16px', margin: '16px 0' }
const feedbackLabel = { fontSize: '13px', fontWeight: 'bold' as const, color: '#6b7280', margin: '0 0 6px' }
const feedbackText = { fontSize: '14px', color: '#374151', fontStyle: 'italic' as const, margin: 0 }
const btn = { color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const brand = { fontSize: '12px', color: '#b45309', marginTop: '16px', letterSpacing: '1px' }
