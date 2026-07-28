// ─────────────────────────────────────────────
// Shared Types — Project LMS
// Used by both apps/web and apps/api
// ─────────────────────────────────────────────

// ── ROLES ──────────────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  HEAD_TEACHER = 'HEAD_TEACHER',
  ASSISTANT_TEACHER = 'ASSISTANT_TEACHER',
  REGULAR_STUDENT = 'REGULAR_STUDENT',
  EXAM_BATCH_STUDENT = 'EXAM_BATCH_STUDENT',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// ── STUDENT TYPES ───────────────────────────────
export enum StudentType {
  REGULAR = 'REGULAR',
  EXAM_BATCH = 'EXAM_BATCH',
}

export enum StudentGroup {
  SCIENCE = 'SCIENCE',
  ARTS = 'ARTS',
  COMMERCE = 'COMMERCE',
}

export enum Shift {
  MORNING = 'MORNING',
  DAY = 'DAY',
}

// ── TEACHER ─────────────────────────────────────
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTUAL = 'CONTRACTUAL',
  VISITING = 'VISITING',
}

// ── NOTICE ──────────────────────────────────────
export enum NoticeTargetType {
  ALL = 'ALL',
  CLASS = 'CLASS',
  BATCH = 'BATCH',
  URGENT = 'URGENT',
}

// ── ATTENDANCE ──────────────────────────────────
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

// ── PAYMENT ─────────────────────────────────────
export enum PaymentType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  FREE = 'FREE',
}

// ── LEAVE ───────────────────────────────────────
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ── CALENDAR ────────────────────────────────────
export enum CalendarEventType {
  HOLIDAY = 'HOLIDAY',
  EVENT = 'EVENT',
  EXAM = 'EXAM',
}

// ── ROUTINE ─────────────────────────────────────
export enum RoutineTargetType {
  CLASS = 'CLASS',
  BATCH = 'BATCH',
}

export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

// ── SALARY ──────────────────────────────────────
export enum SalaryStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
}

// ── SUBJECT PAPER ───────────────────────────────
export enum SubjectPaper {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  NONE = 'NONE',
}

// ── BATCH STATUS ─────────────────────────────────
export enum BatchStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

// ─────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;       // user id
  role: UserRole;
  email?: string;
  phone?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
