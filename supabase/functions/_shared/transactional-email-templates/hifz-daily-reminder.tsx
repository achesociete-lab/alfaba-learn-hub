import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  studentName?: string
  pacePerDay?: number | null
  totalMemorized?: number | null
  programmeUrl?: string
}

const HifzDailyReminderEmail = ({ studentName, pacePerDay, totalMemorized, programmeUrl = 'https://alfasl.fr/hifz' }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🌙 Ta révision du jour — ne laisse pas l'oubli s'installer</Preview>
    <Body style={main}>
      <Container style={container}>

        {/* Header */}
        <Section style={header}>
          <Text style={headerIcon}>🌙</Text>
          <Heading style={headerTitle}>Révision du jour</Heading>
          <Text style={headerSubtitle}>Hifd al-Qur'ān — ALFASL</Text>
        </Section>

        <Section style={body}>
          <Text style={text}>As-salâmu 'alaykum {studentName || ''},</Text>

          {/* Hadith */}
          <Section style={hadithBox}>
            <Text style={hadithArabic}>«&nbsp;تَعَاهَدُوا هَذَا الْقُرْآنَ، فَوَالَّذِي نَفْسُ مُحَمَّدٍ بِيَدِهِ لَهُوَ أَشَدُّ تَفَصِّيًا مِنَ الإِبِلِ فِي عُقُلِهَا&nbsp;»</Text>
            <Text style={hadithTranslation}>
              « Révisez régulièrement ce Coran, car par Celui qui tient l'âme de Muhammad entre Ses mains, il échappe plus vite que les chameaux de leurs entraves. »
            </Text>
            <Text style={hadithSource}>— Bukhari & Muslim</Text>
          </Section>

          <Text style={text}>Le hifd se perd sans révision quotidienne. Voici votre programme pour aujourd'hui :</Text>

          {/* 3 piliers */}
          <Section style={pillarsBox}>
            <PillarRow icon="📗" color="#15803d" title="Nouvel apprentissage" desc={pacePerDay ? `${pacePerDay} page${pacePerDay > 1 ? 's' : ''} à mémoriser — répétez 10× ce soir` : 'Mémorisez votre nouvelle portion'} />
            <PillarRow icon="📙" color="#b45309" title="Révision récente" desc="Récitez vos hizb des dernières semaines sans mushaf" />
            <PillarRow icon="📘" color="#7c3aed" title="Révision ancienne" desc="1 ancien hizb minimum — tirez-en un au hasard parmi vos acquis" />
          </Section>

          {totalMemorized !== null && totalMemorized !== undefined && totalMemorized > 0 && (
            <Section style={progressBox}>
              <Text style={progressText}>
                ✨ Vous avez déjà mémorisé <strong>{totalMemorized}/60 hizb</strong> — continuez, vous êtes sur la bonne voie !
              </Text>
            </Section>
          )}

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <a href={programmeUrl} style={button}>
              Voir mon programme →
            </a>
          </Section>

          <Hr style={hr} />
          <Text style={quote}>اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي</Text>
          <Text style={quoteTranslation}>« Ô Allah, fais-moi profiter de ce que Tu m'as enseigné »</Text>
          <Text style={brand}>ALFASL — الفصل</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

function PillarRow({ icon, color, title, desc }: { icon: string; color: string; title: string; desc: string }) {
  return (
    <Section style={{ ...pillarRow, borderLeft: `3px solid ${color}` }}>
      <Text style={pillarTitle}>
        <span>{icon}</span> <strong style={{ color }}>{title}</strong>
      </Text>
      <Text style={pillarDesc}>{desc}</Text>
    </Section>
  )
}

export const template = {
  component: HifzDailyReminderEmail,
  subject: () => `🌙 Ta révision du jour — Hifd al-Qur'ān`,
  displayName: 'Rappel quotidien Hifd',
  previewData: {
    studentName: 'Yacine',
    pacePerDay: 1.5,
    totalMemorized: 12,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#fdf8ef', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }
const header = { padding: '32px 24px', textAlign: 'center' as const, backgroundColor: '#15803d', color: '#ffffff' }
const headerIcon = { fontSize: '40px', margin: '0 0 8px', textAlign: 'center' as const, color: '#ffffff' }
const headerTitle = { fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 6px', textAlign: 'center' as const }
const headerSubtitle = { fontSize: '13px', color: '#ffffff', opacity: 0.85, margin: 0, textAlign: 'center' as const }
const body = { padding: '24px 28px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const hadithBox = { backgroundColor: '#fdf8ef', border: '1px solid #d97706', borderRadius: '8px', padding: '16px 20px', margin: '16px 0' }
const hadithArabic = { fontSize: '15px', color: '#92400e', textAlign: 'right' as const, direction: 'rtl' as const, fontFamily: 'Georgia, serif', lineHeight: '1.8', margin: '0 0 10px' }
const hadithTranslation = { fontSize: '13px', color: '#374151', fontStyle: 'italic' as const, lineHeight: '1.6', margin: '0 0 6px' }
const hadithSource = { fontSize: '11px', color: '#9ca3af', margin: 0, textAlign: 'right' as const }
const pillarsBox = { margin: '12px 0' }
const pillarRow = { backgroundColor: '#fafafa', padding: '10px 14px', borderRadius: '4px', margin: '8px 0' }
const pillarTitle = { fontSize: '14px', margin: '0 0 2px' }
const pillarDesc = { fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.5' }
const progressBox = { backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '6px', padding: '12px 16px', margin: '16px 0' }
const progressText = { fontSize: '14px', color: '#065f46', margin: 0 }
const button = { display: 'inline-block', backgroundColor: '#15803d', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const quote = { fontSize: '18px', color: '#15803d', textAlign: 'center' as const, fontFamily: 'Georgia, serif', margin: '0 0 6px' }
const quoteTranslation = { fontSize: '12px', color: '#b45309', fontStyle: 'italic' as const, textAlign: 'center' as const, margin: '0 0 16px' }
const brand = { fontSize: '11px', color: '#9ca3af', textAlign: 'center' as const, letterSpacing: '1px' }
