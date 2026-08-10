import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_URL = 'https://alfasl.fr/cours-presentiel'

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
          ? `✅ Votre travail d'${stepLabel} a été validé par votre professeur`
          : `📝 Votre professeur a laissé un commentaire sur votre ${stepLabel}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...header, backgroundColor: isValid ? '#15803d' : '#b45309' }}>
            <Text style={headerIcon}>{isValid ? '✅' : '📝'}</Text>
            <Heading style={headerTitle}>
              {isValid ? 'Travail validé !' : 'Retour de votre professeur'}
            </Heading>
            <Text style={headerSubtitle}>{courseName || 'Cours présentiel'} · {stepLabel}</Text>
          </Section>

          <Section style={body}>
            <Text style={text}>As-salâmu 'alaykum {studentName || ''},</Text>
            {isValid ? (
              <Text style={text}>
                Votre professeur a <strong style={{ color: '#15803d' }}>validé</strong> votre travail
                d'<strong>{stepLabel}</strong>. Félicitations, continuez sur cette lancée !
              </Text>
            ) : (
              <Text style={text}>
                Votre professeur a examiné votre travail d'<strong>{stepLabel}</strong> et souhaite
                que vous y apportiez quelques <strong style={{ color: '#b45309' }}>corrections</strong>.
                Consultez son commentaire ci-dessous.
              </Text>
            )}

            {feedback && (
              <Section style={feedbackBox}>
                <Text style={feedbackLabel}>💬 Commentaire du professeur :</Text>
                <Text style={feedbackText}>« {feedback} »</Text>
              </Section>
            )}

            {!isValid && (
              <Text style={tipsText}>
                Prenez le temps de relire la leçon, corrigez votre travail, puis renvoyez une nouvelle photo depuis la plateforme.
              </Text>
            )}

            <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
              <Button href={APP_URL} style={{ ...btn, backgroundColor: isValid ? '#15803d' : '#b45309' }}>
                {isValid ? 'Passer à la suite' : 'Corriger et renvoyer'}
              </Button>
            </Section>

            <Text style={duaText}>Qu'Allah vous récompense pour vos efforts 🤲</Text>
            <Text style={brand}>Votre professeur ALFASL — الفصل</Text>
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
      ? `✅ Votre ${STEP_LABEL[data.stepType] || data.stepType || 'travail'} est validé — ALFASL`
      : `📝 Retour de votre professeur sur votre ${STEP_LABEL[data.stepType] || data.stepType || 'travail'} — ALFASL`,
  displayName: 'Correction présentiel',
  previewData: {
    studentName: 'Yacine',
    courseName: 'Leçon 5 — Lettres arabes',
    stepType: 'ecriture',
    status: 'a_corriger',
    feedback: 'Attention à la forme du qaf — revenez sur la leçon 3 et recopiez ce mot 5 fois.',
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
const tipsText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '12px 0' }
const btn = { color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const duaText = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const brand = { fontSize: '12px', color: '#b45309', marginTop: '16px', letterSpacing: '1px' }
