/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as adminPendingSignup } from './admin-pending-signup.tsx'
import { template as tutorWeeklyReport } from './tutor-weekly-report.tsx'
import { template as presentielAccessGranted } from './presentiel-access-granted.tsx'
import { template as welcomeNewUser } from './welcome-new-user.tsx'
import { template as paymentConfirmation } from './payment-confirmation.tsx'
import { template as newLessonPublished } from './new-lesson-published.tsx'
import { template as hifzBookingAdmin } from './hifz-booking-admin.tsx'
import { template as hifzBookingConfirmation } from './hifz-booking-confirmation.tsx'
import { template as hifzSessionConfirmed } from './hifz-session-confirmed.tsx'
import { template as hifzSessionCancelled } from './hifz-session-cancelled.tsx'
import { template as hifzSessionEvaluated } from './hifz-session-evaluated.tsx'
import { template as hifzSessionReminder } from './hifz-session-reminder.tsx'
import { template as hifzDailyReminder } from './hifz-daily-reminder.tsx'
import { template as hifzRescheduleRequest } from './hifz-reschedule-request.tsx'
import { template as hifzRescheduleProposal } from './hifz-reschedule-proposal.tsx'
import { template as presentielCorrection } from './presentiel-correction.tsx'
import { template as hifzApplicationAdmin } from './hifz-application-admin.tsx'
import { template as familyInvite } from './family-invite.tsx'
import { template as adminNewStudentSignup } from './admin-new-student-signup.tsx'
import { template as followupLevel1Online } from './followup-level1-online.tsx'
import { template as followupLevel2Online } from './followup-level2-online.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'followup-level1-online': followupLevel1Online,
  'followup-level2-online': followupLevel2Online,
  'admin-new-student-signup': adminNewStudentSignup,
  'admin-pending-signup': adminPendingSignup,
  'tutor-weekly-report': tutorWeeklyReport,
  'presentiel-access-granted': presentielAccessGranted,
  'welcome-new-user': welcomeNewUser,
  'payment-confirmation': paymentConfirmation,
  'new-lesson-published': newLessonPublished,
  'hifz-booking-admin': hifzBookingAdmin,
  'hifz-booking-confirmation': hifzBookingConfirmation,
  'hifz-session-confirmed': hifzSessionConfirmed,
  'hifz-session-cancelled': hifzSessionCancelled,
  'hifz-session-evaluated': hifzSessionEvaluated,
  'hifz-session-reminder': hifzSessionReminder,
  'hifz-daily-reminder': hifzDailyReminder,
  'hifz-reschedule-request': hifzRescheduleRequest,
  'hifz-reschedule-proposal': hifzRescheduleProposal,
  'presentiel-correction': presentielCorrection,
  'hifz-application-admin': hifzApplicationAdmin,
  'family-invite': familyInvite,
}
