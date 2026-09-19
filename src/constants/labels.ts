/**
 * Single source of truth for every user-facing string in the product.
 * Components import from here instead of hardcoding Persian text, so copy
 * can be reviewed (and later localised) in one place.
 */

export const APP = {
  name: "تسک‌فلو",
  nameLatin: "TaskFlow",
  tagline: "مدیریت وظایف تیمی",
  description: "پلتفرم مدیریت پروژه و همکاری تیمی",
} as const;

export const NAV_LABELS = {
  dashboard: "داشبورد",
  projects: "پروژه‌ها",
  tasks: "وظایف",
  team: "تیم",
  notifications: "اعلان‌ها",
  settings: "تنظیمات",
} as const;

export const SECTION_LABELS = {
  workspace: "فضای کاری",
  manage: "مدیریت",
  account: "حساب کاربری",
} as const;

export const ACTION_LABELS = {
  create: "ایجاد",
  createTask: "ایجاد وظیفه",
  edit: "ویرایش",
  editTask: "ویرایش وظیفه",
  delete: "حذف",
  save: "ذخیره",
  saveChanges: "ذخیره تغییرات",
  cancel: "انصراف",
  close: "بستن",
  confirm: "تأیید",
  retry: "تلاش دوباره",
  search: "جستجو",
  filter: "فیلتر",
  filters: "فیلترها",
  clear: "پاک کردن",
  clearFilters: "حذف فیلترها",
  apply: "اعمال",
  reset: "بازنشانی",
  back: "بازگشت",
  viewAll: "مشاهده همه",
  showMore: "نمایش بیشتر",
  showLess: "نمایش کمتر",
  copy: "کپی",
  copied: "کپی شد",
  reply: "پاسخ",
  send: "ارسال",
  add: "افزودن",
  remove: "حذف",
  markAllRead: "خواندن همه",
  loadMore: "بارگذاری بیشتر",
} as const;

export const TASK_STATUS_LABELS = {
  todo: "انجام نشده",
  in_progress: "در حال انجام",
  in_review: "در انتظار بررسی",
  blocked: "مسدود شده",
  done: "انجام شده",
} as const;

export const TASK_PRIORITY_LABELS = {
  urgent: "فوری",
  high: "زیاد",
  medium: "متوسط",
  low: "کم",
} as const;

export const USER_ROLE_LABELS = {
  frontend: "توسعه‌دهنده فرانت‌اند",
  backend: "توسعه‌دهنده بک‌اند",
  designer: "طراح UI/UX",
  product: "مدیر محصول",
  qa: "کارشناس تست",
  devops: "مهندس دواپس",
} as const;

export const PROJECT_STATUS_LABELS = {
  active: "فعال",
  planning: "در برنامه‌ریزی",
  on_hold: "متوقف شده",
  completed: "تکمیل شده",
} as const;

export const PRESENCE_LABELS = {
  online: "آنلاین",
  away: "غایب",
  offline: "آفلاین",
} as const;

/**
 * The dashboard greeting.
 *
 * The salutation follows the clock, and the sentence under it is picked from
 * whichever fact is most worth acting on — an overdue task outranks a due
 * today, which outranks work in progress.
 */
export const GREETING_LABELS = {
  morning: "صبح بخیر",
  afternoon: "ظهر بخیر",
  evening: "عصر بخیر",
  night: "شب بخیر",
  wave: "👋",
  overdue: (count: string) =>
    `${count} وظیفه عقب‌افتاده داری؛ بهتر است اول سراغ آن‌ها بروی.`,
  dueToday: (count: string) => `امروز ${count} مهلت داری.`,
  inProgress: (count: string) => `${count} وظیفه در حال انجام داری.`,
  allClear: "همه‌چیز مرتب است؛ کار عقب‌افتاده‌ای نداری.",
  completedToday: (count: string) => `${count} وظیفه را هم امروز به پایان رساندی.`,
} as const;

export const DASHBOARD_LABELS = {
  title: "داشبورد",
  stats: {
    total: "کل وظایف",
    done: "انجام شده",
    inProgress: "در حال انجام",
    overdue: "عقب‌افتاده",
  },
  progress: "پیشرفت کلی",
  progressHint: "نسبت وظایف انجام‌شده به کل وظایف",
  recentActivity: "فعالیت‌های اخیر",
  upcoming: "مهلت‌های نزدیک",
  upcomingHint: "وظایفی که مهلت آن‌ها نزدیک است",
  statusBreakdown: "توزیع وضعیت",
  activeProjects: "پروژه‌های فعال",
  workload: "بار کاری تیم",
  doneOfTotal: (done: string, total: string) => `${done} از ${total} وظیفه`,
  completionRate: "نرخ تکمیل",
  viewAll: "مشاهده همه",
  upcomingEmpty: "مهلت نزدیکی در پیش نیست",
  upcomingEmptyHint: "وظایف زمان‌بندی‌شده‌ات در وضعیت مناسبی هستند.",
  activityEmptyTitle: "فعالیتی ثبت نشده است",
  activityEmptyBody: "تغییرات وظایف تیم در اینجا نمایش داده می‌شود.",
} as const;

export const TASK_PAGE_LABELS = {
  title: "وظایف",
  subtitle: "همه وظایف تیم در یک نگاه",
  newTask: "وظیفه جدید",
  searchPlaceholder: "جستجوی وظیفه، توضیحات، مسئول یا برچسب…",
  resultsCount: (count: string) => `${count} وظیفه`,
  groupByStatus: "گروه‌بندی بر اساس وضعیت",
  groupByNone: "بدون گروه‌بندی",
  selectAll: "انتخاب همه",
  selectedCount: (count: string) => `${count} مورد انتخاب شده`,
  /** Accessible names for the row checkbox, which also carries the task title. */
  completeTask: (title: string) => `تکمیل وظیفه ${title}`,
  reopenTask: (title: string) => `بازگرداندن وظیفه ${title}`,
} as const;

/** Shared chrome for every picker: the combobox, multi-select and calendar. */
export const PICKER_LABELS = {
  searchUsers: "جستجوی کاربر…",
  searchTags: "جستجوی برچسب…",
  searchProjects: "جستجوی پروژه…",
  noUsers: "کاربری پیدا نشد",
  noTags: "برچسبی پیدا نشد",
  noProjects: "پروژه‌ای پیدا نشد",
  clearSelection: "پاک کردن انتخاب",
  removeOption: (label: string) => `حذف ${label}`,
  previousMonth: "ماه قبل",
  nextMonth: "ماه بعد",
} as const;

export const TASK_FORM_LABELS = {
  createTitle: "ایجاد وظیفه جدید",
  createSubtitle: "جزئیات وظیفه را وارد کنید",
  editTitle: "ویرایش وظیفه",
  editSubtitle: "تغییرات مورد نظر را اعمال کنید",
  fields: {
    title: "عنوان وظیفه",
    description: "توضیحات",
    status: "وضعیت",
    priority: "اولویت",
    assignee: "مسئول",
    members: "اعضای مرتبط",
    startDate: "تاریخ شروع",
    dueDate: "مهلت انجام",
    tags: "برچسب‌ها",
    checklist: "چک‌لیست",
    project: "پروژه",
  },
  placeholders: {
    title: "مثلاً طراحی صفحه ورود",
    description: "توضیح کامل وظیفه، اهداف و نکات مهم…",
    checklistItem: "آیتم جدید…",
    selectUser: "انتخاب کاربر",
    selectDate: "انتخاب تاریخ",
    selectTags: "انتخاب برچسب",
  },
  sections: {
    details: "جزئیات",
    schedule: "زمان‌بندی",
    organize: "دسته‌بندی",
    advanced: "تنظیمات بیشتر",
  },
  checklistAdd: "افزودن آیتم",
  checklistRemove: "حذف آیتم",
  errors: {
    titleRequired: "عنوان وظیفه الزامی است",
    titleTooShort: "عنوان باید حداقل ۳ کاراکتر باشد",
    titleTooLong: "عنوان نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد",
    dueBeforeStart: "مهلت انجام نمی‌تواند قبل از تاریخ شروع باشد",
    assigneeRequired: "انتخاب مسئول الزامی است",
  },
} as const;

export const TASK_DETAIL_LABELS = {
  description: "توضیحات",
  noDescription: "برای این وظیفه توضیحی ثبت نشده است.",
  checklist: "چک‌لیست",
  checklistEmpty: "هنوز آیتمی به چک‌لیست اضافه نشده است.",
  checklistProgress: (done: string, total: string) =>
    `${done} از ${total} انجام شده`,
  dates: "زمان‌بندی",
  startDate: "تاریخ شروع",
  dueDate: "مهلت انجام",
  members: "اعضا",
  assignee: "مسئول",
  mentionedUsers: "منشن‌شده‌ها",
  tags: "برچسب‌ها",
  comments: "کامنت‌ها",
  activity: "تاریخچه فعالیت",
  overdue: "عقب‌افتاده",
  overdueBy: (days: string) => `${days} روز تأخیر`,
  dueToday: "مهلت امروز",
  dueTomorrow: "مهلت فردا",
  remaining: (days: string) => `${days} روز باقی‌مانده`,
  notFound: "وظیفه مورد نظر پیدا نشد",
  notFoundHint: "ممکن است حذف شده باشد یا نشانی اشتباه باشد.",
  deleteConfirmTitle: "حذف وظیفه",
  deleteConfirmBody: "آیا از حذف این وظیفه مطمئن هستید؟ این کار قابل بازگشت نیست.",
  properties: "مشخصات",
} as const;

export const COMMENT_LABELS = {
  title: "کامنت‌ها",
  empty: "هنوز کامنتی ثبت نشده است",
  emptyHint: "اولین نظر خود را بنویسید و گفتگو را شروع کنید.",
  placeholder: "کامنت خود را بنویسید… برای منشن کردن @ را تایپ کنید",
  replyPlaceholder: "پاسخ خود را بنویسید…",
  send: "ارسال",
  reply: "پاسخ",
  edit: "ویرایش",
  delete: "حذف",
  edited: "ویرایش شده",
  deleteConfirm: "این کامنت حذف شود؟",
  countLabel: (count: string) => `${count} کامنت`,
  mentionHint: "برای منشن کردن کاربر، @ را تایپ کنید",
  mentionSuggestions: "پیشنهاد کاربر برای منشن",
  emoji: "ایموجی",
  addEmoji: (emoji: string) => `افزودن ${emoji}`,
  react: (emoji: string) => `واکنش ${emoji}`,
  cancelReply: "لغو پاسخ",
} as const;

export const NOTIFICATION_LABELS = {
  title: "اعلان‌ها",
  unread: "خوانده‌نشده",
  empty: "اعلانی وجود ندارد",
  emptyHint: "اعلان‌های جدید در اینجا نمایش داده می‌شوند.",
  markAllRead: "علامت‌گذاری همه به‌عنوان خوانده‌شده",
  viewAll: "مشاهده همه اعلان‌ها",
  unreadOnly: "فقط خوانده‌نشده‌ها",
  all: "همه اعلان‌ها",
  /** Screen-reader suffix for a bare unread count badge. */
  unreadItems: "مورد خوانده‌نشده",
  groups: {
    today: "امروز",
    yesterday: "دیروز",
    earlier: "پیش‌تر",
  },
} as const;

export const SEARCH_LABELS = {
  placeholder: "جستجو در وظایف، پروژه‌ها و اعضا…",
  trigger: "جستجو…",
  hint: "برای جستجو کلیک کنید",
  clear: "پاک کردن جستجو",
  empty: "چیزی برای نمایش نیست",
  noResults: "نتیجه‌ای پیدا نشد",
  noResultsHint: (query: string) =>
    `برای «${query}» نتیجه‌ای یافت نشد. عبارت دیگری را امتحان کنید.`,
  sections: {
    tasks: "وظایف",
    projects: "پروژه‌ها",
    people: "اعضا",
    tags: "برچسب‌ها",
  },
  shortcut: "Ctrl + K",
} as const;

export const FILTER_LABELS = {
  status: "وضعیت",
  priority: "اولویت",
  assignee: "مسئول",
  tag: "برچسب",
  project: "پروژه",
  date: "تاریخ",
  dueFrom: "مهلت از",
  dueTo: "مهلت تا",
  activeCount: (count: string) => `${count} فیلتر فعال`,
  presets: {
    all: "همه",
    overdue: "عقب‌افتاده",
    today: "امروز",
    week: "این هفته",
    mine: "وظایف من",
  },
} as const;

/** The task list's sort control. */
export const SORT_LABELS = {
  label: "ترتیب",
  dueDate: "مهلت انجام",
  priority: "اولویت",
  createdAt: "تاریخ ایجاد",
  title: "عنوان",
  status: "وضعیت",
  ascending: "صعودی",
  descending: "نزولی",
} as const;

export const TEAM_LABELS = {
  title: "اعضای تیم",
  subtitle: "وضعیت بار کاری و عملکرد اعضا",
  activeTasks: (count: string) => `${count} وظیفه فعال`,
  completedTasks: (count: string) => `${count} وظیفه انجام‌شده`,
  overdueTasks: (count: string) => `${count} وظیفه عقب‌افتاده`,
  /** Bare column headers — the counted forms above read wrong without a count. */
  columns: {
    member: "عضو تیم",
    role: "نقش",
    presence: "وضعیت",
    activeTasks: "وظایف فعال",
    completedTasks: "وظایف انجام‌شده",
  },
  completionRate: "نرخ تکمیل",
  searchPlaceholder: "جستجوی عضو تیم…",
  empty: "عضوی پیدا نشد",
  emptyHint: "عبارت جستجو را تغییر دهید.",
  viewTasks: "مشاهده وظایف",
} as const;

export const PROJECT_LABELS = {
  title: "پروژه‌ها",
  subtitle: "پروژه‌های در جریان و پیشرفت آن‌ها",
  empty: "هنوز پروژه‌ای وجود ندارد",
  emptyHint: "اولین پروژه خود را ایجاد کنید تا وظایف را سازمان‌دهی کنید.",
  newProject: "پروژه جدید",
  progress: "پیشرفت",
  tasksCount: (count: string) => `${count} وظیفه`,
  lead: "سرپرست پروژه",
  members: "اعضا",
  startDate: "شروع",
  dueDate: "پایان",
} as const;

export const SETTINGS_LABELS = {
  title: "تنظیمات",
  subtitle: "شخصی‌سازی تجربه کاری شما",
  sections: {
    appearance: "ظاهر",
    profile: "پروفایل",
    notifications: "اعلان‌ها",
    preferences: "ترجیحات",
  },
  appearance: {
    theme: "پوسته",
    themeHint: "پوسته مورد نظر خود را انتخاب کنید",
    light: "روشن",
    dark: "تاریک",
    system: "سیستم",
    density: "تراکم نمایش",
    densityComfortable: "راحت",
    densityCompact: "فشرده",
    direction: "جهت چیدمان",
    directionHint: "راست‌به‌چپ (فارسی)",
  },
  profile: {
    name: "نام و نام خانوادگی",
    email: "ایمیل",
    role: "نقش",
    saveSuccess: "تغییرات پروفایل ذخیره شد",
  },
  notificationPrefs: {
    mentions: "منشن شدن",
    mentionsHint: "وقتی کسی شما را منشن می‌کند",
    assignments: "اختصاص وظیفه",
    assignmentsHint: "وقتی وظیفه‌ای به شما واگذار می‌شود",
    replies: "پاسخ به کامنت",
    repliesHint: "وقتی کسی به نظر شما پاسخ می‌دهد",
    dueSoon: "یادآوری مهلت",
    dueSoonHint: "یک روز قبل از مهلت انجام",
    digest: "خلاصه روزانه",
    digestHint: "ارسال خلاصه فعالیت‌های روز",
  },
  preferences: {
    language: "زبان",
    languageValue: "فارسی",
    calendar: "تقویم",
    calendarValue: "هجری شمسی",
    timezone: "منطقه زمانی",
    timezoneValue: "تهران (UTC+3:30)",
  },
  data: {
    title: "داده‌ها",
    reset: "بازنشانی داده‌های نمونه",
    resetHint: "همه تغییرات شما پاک و داده‌های اولیه بازگردانی می‌شود.",
    resetConfirmTitle: "بازنشانی داده‌ها؟",
    resetConfirmBody:
      "تمام وظایف، کامنت‌ها و اعلان‌هایی که ساخته‌اید حذف می‌شوند و داده‌های نمونه اولیه بازمی‌گردند. این کار قابل بازگشت نیست.",
    resetConfirm: "بازنشانی کن",
  },
} as const;

export const EMPTY_STATE_LABELS = {
  tasks: {
    title: "هنوز وظیفه‌ای وجود ندارد",
    body: "اولین وظیفه خود را ایجاد کنید تا کار تیم سازمان‌دهی شود.",
  },
  filtered: {
    title: "وظیفه‌ای با این فیلترها پیدا نشد",
    body: "فیلترها را تغییر دهید یا آن‌ها را پاک کنید.",
  },
  projects: {
    title: "هنوز پروژه‌ای وجود ندارد",
    body: "اولین پروژه خود را ایجاد کنید.",
  },
  notifications: {
    title: "اعلانی وجود ندارد",
    body: "اعلان‌های جدید در اینجا نمایش داده می‌شوند.",
  },
  comments: {
    title: "هنوز کامنتی ثبت نشده است",
    body: "اولین نظر خود را بنویسید و گفتگو را شروع کنید.",
  },
  activity: {
    title: "فعالیتی ثبت نشده است",
    body: "تغییرات این وظیفه در اینجا نمایش داده می‌شود.",
  },
} as const;

export const ERROR_LABELS = {
  generic: "خطایی رخ داد",
  genericHint: "مشکلی در بارگذاری اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.",
  loadTasks: "بارگذاری وظایف با خطا مواجه شد",
  loadNotifications: "بارگذاری اعلان‌ها با خطا مواجه شد",
  saveFailed: "ذخیره تغییرات با خطا مواجه شد",
  notFoundTitle: "صفحه مورد نظر پیدا نشد",
  notFoundBody: "نشانی وارد شده معتبر نیست یا صفحه حذف شده است.",
  backHome: "بازگشت به داشبورد",
} as const;

export const TOAST_LABELS = {
  taskCreated: "وظیفه با موفقیت ایجاد شد",
  taskUpdated: "تغییرات وظیفه ذخیره شد",
  taskDeleted: "وظیفه حذف شد",
  taskCompleted: "وظیفه تکمیل شد",
  taskReopened: "وظیفه بازگشایی شد",
  statusChanged: "وضعیت وظیفه تغییر کرد",
  changesSaved: "تغییرات ذخیره شد",
  commentAdded: "کامنت ثبت شد",
  commentUpdated: "کامنت ویرایش شد",
  commentDeleted: "کامنت حذف شد",
  userMentioned: "کاربر منشن شد",
  checklistUpdated: "چک‌لیست به‌روزرسانی شد",
  notificationsRead: "همه اعلان‌ها خوانده شدند",
  themeChanged: "پوسته تغییر کرد",
  dataReset: "داده‌های نمونه بازنشانی شد",
  copied: "در حافظه کپی شد",
  /** Accessible name for a toast's dismiss button. */
  dismiss: "بستن اعلان",
} as const;

export const VALIDATION_LABELS = {
  required: "این فیلد الزامی است",
  /** Counts arrive pre-formatted — see the note on `PALETTE_LABELS.resultsCount`. */
  tooShort: (min: string) => `حداقل ${min} کاراکتر وارد کنید`,
  tooLong: (max: string) => `حداکثر ${max} کاراکتر مجاز است`,
  invalidEmail: "نشانی ایمیل معتبر نیست",
} as const;

export const GENERIC_LABELS = {
  loading: "در حال بارگذاری…",
  saving: "در حال ذخیره…",
  deleting: "در حال حذف…",
  creating: "در حال ایجاد…",
  you: "شما",
  unknownUser: "کاربر ناشناس",
  unknown: "نامشخص",
  unassigned: "بدون مسئول",
  noDueDate: "بدون مهلت",
  noStartDate: "بدون تاریخ شروع",
  /** Fallback avatar initial when a name can't be resolved. */
  unknownInitial: "؟",
  /** Unit suffix for a percentage read out by a screen reader. */
  percent: "درصد",
  untitled: "بدون عنوان",
  more: "بیشتر",
  less: "کمتر",
  of: "از",
  and: "و",
  none: "هیچ‌کدام",
  all: "همه",
  today: "امروز",
  yesterday: "دیروز",
  tomorrow: "فردا",
  /** Shown for timestamps under a minute old. */
  justNow: "همین حالا",
} as const;

export const KEYBOARD_LABELS = {
  search: "جستجوی سریع",
  newTask: "وظیفه جدید",
  closeDialog: "بستن پنجره",
  navigate: "جابه‌جایی",
  select: "انتخاب",
  shortcuts: "میان‌برها",
} as const;

/** Chrome around the app — sidebar, topbar, account menu. */
export const SHELL_LABELS = {
  primaryNav: "ناوبری اصلی",
  openMenu: "باز کردن منو",
  closeMenu: "بستن منو",
  collapseSidebar: "جمع کردن نوار کناری",
  expandSidebar: "باز کردن نوار کناری",
  openSearch: "جستجوی سریع",
  searchPlaceholder: "جستجوی وظیفه، پروژه یا هم‌تیمی…",
  account: "حساب کاربری",
  viewProfile: "مشاهده پروفایل",
  signOut: "خروج از حساب",
  signOutHint: "این نسخه نمایشی است؛ خروج انجام نمی‌شود",
  theme: "پوسته",
  appearances: "ظاهر برنامه",
  skipToContent: "پرش به محتوای اصلی",
  unread: "خوانده‌نشده",
  logoAlt: "نشان تسک‌فلو",
} as const;

/** The command palette (⌘K). */
export const PALETTE_LABELS = {
  title: "جستجوی سریع",
  placeholder: "جستجوی وظیفه، پروژه، هم‌تیمی یا صفحه…",
  sections: {
    navigation: "صفحات",
    tasks: "وظایف",
    projects: "پروژه‌ها",
    people: "هم‌تیمی‌ها",
    actions: "دستورها",
  },
  noResults: "نتیجه‌ای یافت نشد",
  noResultsHint: "عبارت دیگری را امتحان کنید یا فیلترها را تغییر دهید",
  idle: "برای جستجو تایپ کنید",
  idleHint: "می‌توانید بین وظایف، پروژه‌ها، هم‌تیمی‌ها و صفحه‌ها جستجو کنید",
  resultsCount: (count: string) => `${count} نتیجه`,
  createTask: "ایجاد وظیفه جدید",
  goToTasks: "رفتن به همه وظایف",
  toggleTheme: "تغییر پوسته",
  hintArrowKeys: "جابه‌جایی",
  hintEnter: "انتخاب",
  hintEscape: "بستن",
} as const;

