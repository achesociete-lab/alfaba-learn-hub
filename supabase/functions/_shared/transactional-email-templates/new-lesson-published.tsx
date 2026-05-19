import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ALFASL'

interface Props {
  studentName?: string
  lessonTitle?: string
  moduleLabel?: string
  lessonUrl?: string
}

const NewLessonPublishedEmail = ({ studentName, lessonTitle, moduleLabel, lessonUrl }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Une nouvelle leçon est disponible sur {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nouvelle leçon disponible 📚</Heading>
        <Text style={text}>As-salâmu ‘alaykum {studentName || ''},</Text>
        <Text style={text}>
          Une nouvelle leçon vient d'être publiée
          {moduleLabel ? <> dans <strong>{moduleLabel}</strong></> : null}
          {lessonTitle ? <> : <strong>{lessonTitle}</strong></> : null}.
        </Text>
        <Text style={text}>
          Connectez-vous dès maintenant pour la découvrir et continuer votre progression.
        </Text>
        {lessonUrl ? (
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button href={lessonUrl} style={btn}>Accéder à la leçon</Button>
          </Section>
        ) : (
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button href="https://alfasl.fr/dashboard" style={btn}>Voir mes cours</Button>
          </Section>
        )}
        <Text style={footer}>{SITE_NAME} — الفصل</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewLessonPublishedEmail,
  subject: (data: Record<string, any>) =>
    data?.lessonTitle
      ? `Nouvelle leçon : ${data.lessonTitle}`
      : 'Une nouvelle leçon est disponible',
  displayName: 'Nouvelle leçon publiée',
  previewData: {
    studentName: 'Yacine',
    lessonTitle: 'Les voyelles longues',
    moduleLabel: 'Niveau 1',
    lessonUrl: 'https://alfasl.fr/niveau-1',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f5132', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const btn = { background: '#0f5132', color: '#ffffff', padding: '12px 22px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '12px', color: '#999', marginTop: '32px', textAlign: 'center' as const }
