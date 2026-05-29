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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'admin-pending-signup': adminPendingSignup,
  'tutor-weekly-report': tutorWeeklyReport,
  'presentiel-access-granted': presentielAccessGranted,
  'welcome-new-user': welcomeNewUser,
  'payment-confirmation': paymentConfirmation,
  'new-lesson-published': newLessonPublished,
  'hifz-booking-admin': hifzBookingAdmin,
  'hifz-booking-confirmation': hifzBookingConfirmation,
}
