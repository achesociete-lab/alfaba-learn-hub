import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "ALFASL"
const SITE_URL = "https://alfasl.fr"

interface ReportProps {
  firstName?: string
  weekStart?: string
  weekEnd?: string
  sessionsCount?: number
  averageScore?: number
  progressSummary?: string
  recommendations?: string[]
  weakPoints?: string[]
  strongPoints?: string[]
}

const TutorWeeklyReportEmail = ({
  firstName,
  weekStart,
  weekEnd,
  sessionsCount = 0,
  averageScore = 0,
  progressSummary,
  recommendations = [],
  weakPoints = [],
  strongPoints = [],
}: ReportProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{`Votre rapport hebdomadaire ALFASL — ${sessionsCount} session${sessionsCount > 1 ? 's' : ''} cette semaine`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📊 Votre rapport hebdomadaire</Heading>
        <Text style={greeting}>
          Assalâmu 'alaykum {firstName ? firstName : ''} 👋
        </Text>
        <Text style={text}>
          Voici votre bilan de la semaine du <strong>{weekStart}</strong> au <strong>{weekEnd}</strong> avec votre Tuteur IA.
        </Text>

        <Section style={statsBox}>
          <div style={statItem}>
            <Text style={statValue}>{sessionsCount}</Text>
            <Text style={statLabel}>Session{sessionsCount > 1 ? 's' : ''}</Text>
          </div>
          <div style={statItem}>
            <Text style={statValue}>{Math.round(averageScore)}/100</Text>
            <Text style={statLabel}>Score moyen</Text>
          </div>
        </Section>

        {progressSummary && (
          <>
            <Heading as="h2" style={h2}>Résumé de la semaine</Heading>
            <Text style={text}>{progressSummary}</Text>
          </>
        )}

        {strongPoints.length > 0 && (
          <>
            <Heading as="h2" style={h2}>✅ Points forts</Heading>
            {strongPoints.map((p, i) => (
              <Text key={i} style={listItem}>• {p}</Text>
            ))}
          </>
        )}

        {weakPoints.length > 0 && (
          <>
            <Heading as="h2" style={h2}>📌 À travailler</Heading>
            {weakPoints.map((p, i) => (
              <Text key={i} style={listItem}>• {p}</Text>
            ))}
          </>
        )}

        {recommendations.length > 0 && (
          <>
            <Heading as="h2" style={h2}>🎯 Recommandations pour la semaine prochaine</Heading>
            {recommendations.map((r, i) => (
              <Text key={i} style={listItem}>• {r}</Text>
            ))}
          </>
        )}

        <Hr style={hr} />

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={`${SITE_URL}/tuteur`} style={button}>
            Démarrer une session
          </Button>
        </Section>

        <Text style={footer}>
          Bonne semaine d'apprentissage,<br />
          L'équipe {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TutorWeeklyReportEmail,
  subject: (data: Record<string, any>) => `📊 Votre rapport ALFASL — ${data.sessionsCount || 0} session(s) cette semaine`,
  displayName: 'Rapport hebdomadaire tuteur',
  previewData: {
    firstName: 'Ahmed',
    weekStart: '21/04/2026',
    weekEnd: '27/04/2026',
    sessionsCount: 4,
    averageScore: 78,
    progressSummary: 'Excellente semaine ! Vous avez bien progressé sur les voyelles longues et la lecture des mots.',
    recommendations: ['Réviser les lettres ص et ض', 'Pratiquer la dictée 10 min/jour', 'Faire l\'exercice de lecture du chapitre 5'],
    weakPoints: ['Distinction entre ح et ه', 'Le tanwin'],
    strongPoints: ['Lecture fluide des mots simples', 'Maîtrise de la fatha'],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#047857', margin: '0 0 16px' }
const h2 = { fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '24px 0 8px' }
const greeting = { fontSize: '15px', color: '#1f2937', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 12px' }
const listItem = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '4px 0' }
const statsBox = { display: 'flex', justifyContent: 'space-around', backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '16px', margin: '20px 0' }
const statItem = { textAlign: 'center' as const, flex: 1 }
const statValue = { fontSize: '28px', fontWeight: 'bold', color: '#047857', margin: '0' }
const statLabel = { fontSize: '12px', color: '#6b7280', margin: '4px 0 0', textTransform: 'uppercase' as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const button = { backgroundColor: '#047857', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0', textAlign: 'center' as const }
