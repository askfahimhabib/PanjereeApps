export enum UserRole {
  ADMIN = 'ADMIN',
  HEAD_TEACHER = 'HEAD_TEACHER',
  ASSISTANT_TEACHER = 'ASSISTANT_TEACHER',
  REGULAR_STUDENT = 'REGULAR_STUDENT',
  EXAM_BATCH_STUDENT = 'EXAM_BATCH_STUDENT'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum StudentType {
  REGULAR = 'REGULAR',
  EXAM_BATCH = 'EXAM_BATCH'
}

export enum StudentGroup {
  SCIENCE = 'SCIENCE',
  ARTS = 'ARTS',
  COMMERCE = 'COMMERCE'
}

export enum Shift {
  MORNING = 'MORNING',
  DAY = 'DAY'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTUAL = 'CONTRACTUAL',
  VISITING = 'VISITING'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

export enum PaymentType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  FREE = 'FREE'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum NoticeTargetType {
  ALL = 'ALL',
  CLASS = 'CLASS',
  BATCH = 'BATCH',
  URGENT = 'URGENT'
}

export enum CalendarEventType {
  HOLIDAY = 'HOLIDAY',
  EVENT = 'EVENT',
  EXAM = 'EXAM'
}

export enum RoutineTargetType {
  CLASS = 'CLASS',
  BATCH = 'BATCH'
}

export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

export enum SalaryStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL'
}

export enum SubjectPaper {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  NONE = 'NONE'
}

export enum BatchStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}
