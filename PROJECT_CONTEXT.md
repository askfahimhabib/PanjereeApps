# 🏫 Project LMS — Context & Implementation Plan
> **Last Updated:** 2026-07-28
> **Status:** Phase 1 In Progress
> **Conversation ID:** 688884b8-2b01-4981-a423-db21b6da36ce

---

## 📌 প্রজেক্ট ওভারভিউ

একটি সম্পূর্ণ **বাংলাদেশ কেন্দ্রিক স্কুল ও কোচিং ম্যানেজমেন্ট সিস্টেম**।
- **Institution type:** Single school / coaching
- **Max users:** ~২৫০ জন
- **Platform:** Web-first → Android পরে

---

## 👥 Roles (5টি)

| Role | Description |
|---|---|
| Admin | সম্পূর্ণ access |
| Head Teacher | Teacher/Class/Result manage |
| Assistant Teacher | Attendance, Routine, Result entry |
| Regular Student | নিজের dashboard দেখবে |
| Exam Batch Student | Batch info, results দেখবে |

---

## 🔧 Tech Stack — ১০০% Free

### Frontend (Web)
- **Next.js 14** (App Router)
- **ShadCN/UI** + Custom CSS
- **Zustand** + TanStack Query
- **React Hook Form** + Zod
- **Recharts** (charts)
- **i18next** (bilingual: বাংলা + English)

### Backend (API)
- **NestJS** (TypeScript)
- **Prisma** ORM
- **PostgreSQL**
- **JWT** + Bcrypt + Google OAuth (2FA)
- **Socket.io** (real-time)
- **Puppeteer** / PDFKit (PDF)
- **ExcelJS** (Excel export)

### Free Deployment Stack
| Service | Tool | Free Limit |
|---|---|---|
| Web Frontend | **Vercel** | Unlimited |
| Backend API | **Fly.io** | No cold start |
| Database | **Supabase** PostgreSQL | 500MB |
| Media | **Cloudinary** | 25GB |
| Push Notification | **Firebase FCM** | Unlimited |
| Email | **Resend** | 3,000/month |
| Cache | **Upstash** Redis | 10k req/day |
| Auth | **Google OAuth** | Free |

---

## 🗂️ Project Structure

```
i:/Project LMS/
├── apps/
│   ├── web/                    # Next.js 14
│   │   └── app/
│   │       ├── (admin)/
│   │       ├── (teacher)/
│   │       ├── (student)/
│   │       └── auth/
│   └── api/                    # NestJS Backend
│       └── src/
│           └── modules/
│               ├── auth/
│               ├── users/
│               ├── students/
│               ├── teachers/
│               ├── classes/
│               ├── batches/
│               ├── subjects/
│               ├── routines/
│               ├── exams/
│               ├── results/
│               ├── attendance/
│               ├── payments/
│               ├── notices/
│               ├── messages/
│               ├── leaves/
│               ├── salary/
│               ├── reports/
│               ├── notifications/
│               ├── calendar/
│               └── settings/
├── packages/
│   ├── shared/                 # Shared types/utils
│   └── ui/                     # Shared components
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── PROJECT_CONTEXT.md          # ← এই ফাইল
```

---

## 🗄️ Database Schema (Prisma)

```
── AUTH & USERS ──
users              → id, role, phone, email, password_hash, google_id,
                     account_status, last_login, created_at
login_history      → id, user_id, device, ip, timestamp
audit_logs         → id, user_id, action, target_table, old_value, new_value

── TEACHERS ──
teachers           → user_id, employee_id, designation, department,
                     employment_type, joining_date, experience, bio
teacher_subjects   → teacher_id, subject_id, class_id
teacher_salary     → teacher_id, month, amount, bonus, payment_status
teacher_leaves     → id, teacher_id, from, to, reason, status

── STUDENTS ──
students           → user_id, student_id, reg_no, type (REGULAR/EXAM_BATCH),
                     father_name, mother_name, guardian_name, guardian_phone
regular_students   → student_id, class_id, section_id, roll, group_id,
                     shift, admission_date, academic_session
exam_students      → student_id, batch_id, target_exam, school_name,
                     current_class, enrollment_date
student_leaves     → id, student_id, from, to, reason, status

── ACADEMIC ──
classes            → id, name (1-12/HSC), academic_year
sections           → id, class_id, name (A/B/C)
groups             → id, class_id, name (Science/Arts/Commerce)
subjects           → id, class_id, group_id, name, name_bn, code, paper (1st/2nd)
batches            → id, name, class_id, exam_name, exam_year,
                     start_date, end_date, status
batch_sections     → id, batch_id, name
academic_calendar  → id, title, date, type (HOLIDAY/EVENT/EXAM), description

── ROUTINE & EXAM ──
routines           → id, target_type (CLASS/BATCH), target_id, subject_id,
                     teacher_id, day, start_time, end_time, chapter, room
exams              → id, target_type, target_id, subject_id, date,
                     start_time, total_marks, chapter
results            → id, student_id, exam_id, obtained_marks, rank
merit_lists        → id, exam_id, student_id, rank, total, percentage, grade

── OPERATIONS ──
attendance         → id, student_id, date, status (P/A/L)
notices            → id, target_type (ALL/CLASS/BATCH/URGENT), target_id,
                     title, content, attachments, expires_at, is_pinned
notice_reads       → notice_id, user_id, read_at
messages           → id, sender_id, receiver_id, group_id, content,
                     attachments, is_read, sent_at

── PAYMENTS ──
fee_structures     → id, class_id, academic_year, monthly_fee, description
payments           → id, student_id, month, year, total_amount,
                     paid_amount, payment_type (FULL/PARTIAL/FREE),
                     collected_by, notes, created_at

── SETTINGS ──
school_settings    → id, name, name_bn, logo_url, address, phone,
                     email, primary_color, secondary_color, tagline
notification_prefs → user_id, push, email, in_app
```

---

## 🇧🇩 BD Curriculum Subjects

### Class 1-8:
বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, গণিত, বিজ্ঞান, সমাজ বিজ্ঞান, ধর্ম, ICT

### Class 9-10 (SSC):
- **Science:** বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, গণিত, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত, ICT, ধর্ম
- **Commerce:** বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, গণিত, হিসাববিজ্ঞান, ব্যবসায় উদ্যোগ, ফিন্যান্স ও ব্যাংকিং, ICT, ধর্ম
- **Arts:** বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, গণিত, ইতিহাস, ভূগোল, পৌরনীতি, ICT, ধর্ম

### Class 11-12 (HSC):
- **Science:** বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, পদার্থবিজ্ঞান ১ম/২য়, রসায়ন ১ম/২য়, জীববিজ্ঞান ১ম/২য় / উচ্চতর গণিত ১ম/২য়, ICT
- **Commerce:** বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, হিসাববিজ্ঞান ১ম/২য়, ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম/২য়, ফিন্যান্স ব্যাংকিং ও বিমা ১ম/২য়, উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম/২য়, ICT
- **Arts:** বাংলা ১ম/২য়, ইংরেজি ১ম/২য়, ইতিহাস ১ম/২য়, ইসলামের ইতিহাস ও সংস্কৃতি ১ম/২য়, পৌরনীতি ও সুশাসন ১ম/২য়, অর্থনীতি ১ম/২য়, সমাজকর্ম ১ম/২য়, ভূগোল ১ম/২য়, ICT

---

## 🎨 UI Design System

| Token | Value |
|---|---|
| Primary | `#2563EB` (Royal Blue) |
| Secondary | `#7C3AED` (Purple) |
| Success | `#10B981` (Emerald) |
| Warning | `#F59E0B` (Amber) |
| Danger | `#EF4444` (Red) |
| Dark BG | `#0F172A` (Slate 900) |
| Card BG | `#1E293B` (Slate 800) |
| Font | Inter (Latin) + Hind Siliguri (Bengali) |

**Design:** Dark mode default, Glassmorphism cards, Smooth animations, Mobile-first

---

## 👥 RBAC Summary

| Feature | Admin | Head T. | Asst. T. | Student |
|---|:---:|:---:|:---:|:---:|
| User Management | ✅ | ✅ | ❌ | ❌ |
| Class Management | ✅ | ✅ | ❌ | ❌ |
| Routine Entry | ✅ | ✅ | ✅ | 👁️ |
| Exam Entry | ✅ | ✅ | ✅ | ❌ |
| Result Entry | ✅ | ✅ | ✅ | 👁️ |
| Attendance | ✅ | ✅ | ✅ | 👁️ |
| Payment Entry | ✅ | ✅ | ❌ | 👁️ |
| Analytics | ✅ | ✅ | ❌ | ❌ |
| Salary | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

---

## ✅ Confirmed Decisions

| বিষয় | সিদ্ধান্ত |
|---|---|
| Institution type | Single school / coaching |
| UI Language | Bilingual (বাংলা + English toggle) |
| Platform | Web-first → Android later |
| Deployment | Vercel + Fly.io + Supabase (all free) |
| Media | Cloudinary |
| Payment | Offline cash → in-app notification |
| 2FA | Google OAuth (Gmail) |
| Export | Excel (.xlsx) + PDF |

---

## 🗓️ Development Phases

| Phase | কাজ | সময় | Status |
|---|---|---|---|
| **Phase 1** | Foundation: Monorepo, DB Schema, Auth, Registration Forms, Basic Dashboard | 5 weeks | 🔄 IN PROGRESS |
| **Phase 2** | Academic: Classes, Subjects, Routine | 4 weeks | ⏳ Pending |
| **Phase 3** | Exam & Results | 3 weeks | ⏳ Pending |
| **Phase 4** | Operations: Attendance, Notice, Messaging, Leave | 4 weeks | ⏳ Pending |
| **Phase 5** | Payments & Reports | 3 weeks | ⏳ Pending |
| **Phase 6** | Analytics, Security, PWA, Polish | 3 weeks | ⏳ Pending |
