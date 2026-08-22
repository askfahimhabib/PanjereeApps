# 🏫 Project LMS — Complete Implementation Blueprint

> **Version:** 2.0 (Vite + NestJS)
> **Stack:** Turborepo + Vite/React + NestJS + Prisma + PostgreSQL
> **Target:** Bangladesh School & Coaching Management System

---

## 📌 Project Vision

একটি সম্পূর্ণ **বাংলাদেশ কেন্দ্রিক** School ও Coaching Management System।

- **Institution type:** Single school / coaching center
- **Max users:** ~২৫০ জন
- **Platform:** Web-first → Android পরে
- **Language:** Bilingual (বাংলা + English toggle)

---

## 👥 User Roles (5টি)

| Role | Access Level |
|---|---|
| `ADMIN` | সম্পূর্ণ access — সব কিছু manage করতে পারে |
| `HEAD_TEACHER` | Teacher/Class/Result manage করতে পারে |
| `ASSISTANT_TEACHER` | Attendance, Routine, Result entry করতে পারে |
| `REGULAR_STUDENT` | নিজের dashboard, result, attendance দেখতে পারে |
| `EXAM_BATCH_STUDENT` | Batch info, results দেখতে পারে |

---

## 🔧 Tech Stack

### Monorepo Tool
- **Turborepo** + **pnpm workspaces**

### Frontend (`apps/vite-ui`)
- **Vite 8** + **React 19** + **TypeScript**
- **React Router DOM v7** (SPA routing)
- **TanStack Query v5** (server state)
- **Zustand v5** (client state — auth)
- **React Hook Form** + **Zod** (forms & validation)
- **Recharts** (charts)
- **Tailwind CSS v4** (utility classes)
- **CSS Modules** (component-scoped styles)
- **Axios** (HTTP client)
- **Socket.io-client** (real-time)

### Backend (`apps/api`)
- **NestJS 11** (TypeScript)
- **Prisma 7** (ORM) — with `@prisma/adapter-pg`
- **PostgreSQL** (Neon / Supabase)
- **JWT** + **Bcrypt** (Authentication)
- **Passport.js** (Strategy pattern)
- **Socket.io** (WebSocket / real-time messaging)
- **ExcelJS** (Excel export)
- **PDFKit** (PDF generation)
- **@nestjs/swagger** (API documentation)
- **@nestjs/throttler** + **Redis** (rate limiting)
- **@nestjs/schedule** (cron jobs)
- **Firebase Admin** (FCM push notifications)
- **Cloudinary** (media storage)
- **Resend** (email)

### Shared Package (`packages/shared`)
- Shared TypeScript types, interfaces, enums
- Must be compiled to JS (`tsc`) before use

### Free Deployment Stack
| Service | Tool | Free Tier |
|---|---|---|
| Frontend | **Vercel** | Unlimited |
| Backend | **Fly.io** | No cold start |
| Database | **Neon** PostgreSQL | 500MB |
| Media | **Cloudinary** | 25GB |
| Push Notifications | **Firebase FCM** | Unlimited |
| Email | **Resend** | 3,000/month |
| Cache | **Upstash** Redis | 10k req/day |

---

## 🗂️ Monorepo Structure

```
project-lms/
├── apps/
│   ├── vite-ui/              # React Frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/       # States.tsx, Skeleton.tsx
│   │   │   │   └── providers/# QueryProvider.tsx
│   │   │   ├── contexts/     # LanguageContext.tsx (i18n)
│   │   │   ├── layouts/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── StudentLayout.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── lib/
│   │   │   │   └── api/
│   │   │   │       └── axios.ts  # Axios instance + interceptor
│   │   │   ├── messages/     # i18n JSON files (en.json, bn.json)
│   │   │   ├── pages/        # All page components
│   │   │   ├── store/
│   │   │   │   └── useAuthStore.ts  # Zustand auth store
│   │   │   ├── App.tsx       # Router setup
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts    # @ alias + Tailwind + React plugin
│   │   └── package.json
│   │
│   └── api/                  # NestJS Backend
│       ├── src/
│       │   ├── auth/         # JWT Auth + strategies
│       │   ├── prisma/       # @Global PrismaModule
│       │   ├── students/
│       │   ├── teachers/
│       │   ├── classes/
│       │   ├── subjects/
│       │   ├── groups/
│       │   ├── batches/
│       │   ├── routines/
│       │   ├── exams/
│       │   ├── results/
│       │   ├── attendance/
│       │   ├── fees/
│       │   ├── payments/
│       │   ├── notices/
│       │   ├── messages/     # + WebSocket Gateway
│       │   ├── leaves/
│       │   ├── teacher-salary/
│       │   ├── analytics/
│       │   ├── reports/      # PDF + Excel
│       │   ├── settings/
│       │   ├── calendar/
│       │   ├── academic/
│       │   ├── security/
│       │   ├── email/        # Resend
│       │   ├── media/        # Cloudinary
│       │   ├── notifications/# Firebase FCM
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── prisma.config.ts
│       ├── nest-cli.json
│       └── package.json
│
├── packages/
│   ├── shared/               # Shared types (must build first!)
│   │   ├── src/index.ts      # All enums + interfaces
│   │   ├── tsconfig.json     # Compiles to dist/
│   │   └── package.json      # main: "./dist/index.js"
│   └── ui/                   # (reserved for shared UI components)
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema (Prisma)

### Enums
```prisma
enum UserRole         { ADMIN, HEAD_TEACHER, ASSISTANT_TEACHER, REGULAR_STUDENT, EXAM_BATCH_STUDENT }
enum AccountStatus    { ACTIVE, INACTIVE, SUSPENDED }
enum StudentType      { REGULAR, EXAM_BATCH }
enum StudentGroup     { SCIENCE, ARTS, COMMERCE }
enum Shift            { MORNING, DAY }
enum EmploymentType   { FULL_TIME, PART_TIME, CONTRACTUAL, VISITING }
enum AttendanceStatus { PRESENT, ABSENT, LATE }
enum PaymentType      { FULL, PARTIAL, FREE }
enum LeaveStatus      { PENDING, APPROVED, REJECTED }
enum NoticeTargetType { ALL, CLASS, BATCH, URGENT }
enum CalendarEventType{ HOLIDAY, EVENT, EXAM }
enum RoutineTargetType{ CLASS, BATCH }
enum DayOfWeek        { SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY }
enum SalaryStatus     { PAID, UNPAID, PARTIAL }
enum SubjectPaper     { FIRST, SECOND, NONE }
enum BatchStatus      { UPCOMING, ONGOING, COMPLETED }
```

### Models Summary

| Model | Key Fields |
|---|---|
| `User` | id, role, phone, email, passwordHash, accountStatus |
| `Teacher` | userId, employeeId, fullName, designation, employmentType |
| `TeacherQualification` | teacherId, degree, institution |
| `TeacherSubject` | teacherId, subjectId, classId |
| `TeacherSalary` | teacherId, month, year, amount, paymentStatus |
| `TeacherLeave` | teacherId, fromDate, toDate, status |
| `Student` | userId, studentId, regNo, type, fullName |
| `RegularStudent` | studentId, classId, sectionId, groupId, roll |
| `ExamStudent` | studentId, batchId, targetExam |
| `StudentLeave` | studentId, fromDate, toDate, status |
| `Class` | name (1-12), academicYear |
| `Section` | classId, name (A/B/C) |
| `Group` | classId, name (SCIENCE/ARTS/COMMERCE) |
| `Subject` | classId, groupId, name, nameBn, paper |
| `Batch` | name, classId, examName, examYear, status |
| `BatchSection` | batchId, name |
| `AcademicCalendar` | title, date, type (HOLIDAY/EVENT/EXAM) |
| `Routine` | targetType, classId/batchId, subjectId, teacherId, day, startTime |
| `Exam` | name, targetType, subjectId, date, totalMarks, isPublished |
| `Result` | studentId, examId, obtainedMarks, grade, gradePoint |
| `MeritList` | examId, studentId, rank, percentage, grade |
| `Attendance` | studentId, date, status (PRESENT/ABSENT/LATE) |
| `Notice` | targetType, title, content, isPinned, expiresAt |
| `Message` | senderId, receiverId/groupId, content, isRead |
| `FeeStructure` | classId, academicYear, monthlyFee |
| `Payment` | studentId, month, year, paidAmount, paymentType |
| `SchoolSettings` | name, nameBn, logoUrl, primaryColor |
| `NotificationPref` | userId, push, email, inApp |
| `LeaveRequest` | userId, startDate, endDate, status |
| `LoginHistory` | userId, device, ipAddress |
| `AuditLog` | userId, action, targetTable, oldValue, newValue |

---

## 🖥️ Frontend Pages

### Admin Layout (`/admin/*`)
| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | AdminDashboardPage | Stats + Revenue chart |
| `/admin/students` | AdminStudentsPage | List + Bulk Excel import |
| `/admin/teachers` | AdminTeachersPage | List + Add modal |
| `/admin/teachers/salary` | AdminTeachersSalaryPage | Salary management |
| `/admin/classes` | AdminClassesPage | Class + Section |
| `/admin/classes/rollover` | AdminClassesRolloverPage | Year rollover |
| `/admin/subjects` | AdminSubjectsPage | Subjects per class/group |
| `/admin/groups` | AdminGroupsPage | Sci/Arts/Commerce |
| `/admin/batches` | AdminBatchesPage | Exam batches |
| `/admin/routines` | AdminRoutinesPage | Timetable |
| `/admin/exams` | AdminExamsPage | Exam management |
| `/admin/exams/:examId/marks` | AdminExamsExamIdMarksPage | Bulk marks entry |
| `/admin/exams/:examId/merit/list` | AdminExamsExamIdMeritListPage | Merit list + PDF |
| `/admin/attendance` | AdminAttendancePage | Attendance |
| `/admin/fees` | AdminFeesPage | Fee structures |
| `/admin/payments` | AdminPaymentsPage | Payment recording |
| `/admin/notices` | AdminNoticesPage | Notice board |
| `/admin/messages` | AdminMessagesPage | Messaging |
| `/admin/leaves` | AdminLeavesPage | Leave requests |
| `/admin/reports` | AdminReportsPage | PDF/Excel export |
| `/admin/calendar` | AdminCalendarPage | Calendar |
| `/admin/settings` | AdminSettingsPage | School settings |
| `/admin/settings/security` | AdminSettingsSecurityPage | Security |

### Auth Layout (`/auth/*`)
| Route | Page |
|---|---|
| `/auth/login` | AuthLoginPage |
| `/auth/register/student` | AuthRegisterStudentPage |
| `/auth/register/teacher` | AuthRegisterTeacherPage |
| `/auth/register/exam/batch` | AuthRegisterExamBatchPage |

### Student Layout (`/student/*`)
| Route | Page |
|---|---|
| `/student/student/dashboard` | StudentStudentDashboardPage |
| `/student/student/notices` | StudentStudentNoticesPage |
| `/student/student/messages` | StudentStudentMessagesPage |
| `/student/student/leaves` | StudentStudentLeavesPage |

---

## 🔌 Backend API Modules

### Auth `/api/v1/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/login` | Email/Phone + Password → JWT |
| POST | `/setup-admin` | First-time admin setup |

### Results `/api/v1/results`
| Method | Path | Description |
|---|---|---|
| GET | `/exam/:examId/students` | Students for marks entry |
| POST | `/exam/save` | Bulk marks save |
| GET/POST | `/exam/:examId/merit-list` | Get/Generate merit list |
| GET | `/exam/:examId/merit-list/pdf` | Download PDF |
| GET | `/exam/:examId/student/:id/pdf` | Individual report card |

> All other modules follow standard CRUD: GET list, GET `:id`, POST create, PUT `:id`, DELETE `:id`

---

## ⚙️ Critical Configurations

### Prisma v7 — PrismaService (REQUIRED)
```ts
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });
  }
  async onModuleInit() { await this.$connect(); }
}
```

### PrismaModule — Global
```ts
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

### packages/shared/package.json
```json
{ "main": "./dist/index.js", "types": "./dist/index.d.ts" }
```

---

## 🚀 Build & Run

```bash
# 1. Install
pnpm install

# 2. Build shared package FIRST (critical!)
pnpm --filter @lms/shared build

# 3. Frontend dev
pnpm --filter vite-ui dev          # http://localhost:5173

# 4. Backend build + run
pnpm --filter api build
node apps/api/dist/src/main        # http://localhost:3001
# Swagger: http://localhost:3001/docs

# 5. Backend dev (if Node.js < v22)
pnpm --filter api start:dev
```

---

## ⚠️ Known Gotchas

| Issue | Cause | Fix |
|---|---|---|
| `nest start --watch` crash | Node v25 TypeScript enum in strip mode | Build first, run `node dist/src/main` |
| `@lms/shared` crash | Raw `.ts` imported by Node | `pnpm --filter @lms/shared build` first |
| Prisma no driver adapter | Prisma v7 breaking change | Use `PrismaPg` adapter |
| PrismaService injection fail | PrismaModule not exported | Add `@Global()` + `exports: [PrismaService]` |
| CORS error on Vite | Port 5173 not in allowed origins | Add `http://localhost:5173` to `main.ts` CORS |

---

## 🇧🇩 Curriculum

### Class 9-10 (SSC)
- **Science:** পদার্থ, রসায়ন, জীববিজ্ঞান, উচ্চতর গণিত
- **Commerce:** হিসাব, ব্যবসায় উদ্যোগ, ফিন্যান্স
- **Arts:** ইতিহাস, ভূগোল, পৌরনীতি

### Class 11-12 (HSC)
- **Science:** পদার্থ ১ম/২য়, রসায়ন ১ম/২য়, জীব/উচ্চতর গণিত ১ম/২য়
- **Commerce:** হিসাব ১ম/২য়, ব্যবসায় সংগঠন ১ম/২য়, ফিন্যান্স ১ম/২য়
- **Arts:** ইতিহাস ১ম/২য়, পৌরনীতি ১ম/২য়, অর্থনীতি ১ম/২য়
