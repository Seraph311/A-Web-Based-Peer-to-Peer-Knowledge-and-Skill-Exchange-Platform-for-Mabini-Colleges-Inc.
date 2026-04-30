const iconProps = {
  className: "inline-block",
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

export const BadgeGold = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="6" fill="#FFD700" stroke="#B8860B" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="#B8860B" />
  </svg>
);

export const BadgeSilver = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="6" fill="#C0C0C0" stroke="#808080" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="#808080" />
  </svg>
);

export const BadgeBronze = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="6" fill="#CD7F32" stroke="#8B4513" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="#8B4513" />
  </svg>
);

export const BadgeMember = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none" />
    <circle cx="12" cy="7" r="4" fill="currentColor" opacity="0.2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const StarFilled = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FBBF24" stroke="#D97706" />
  </svg>
);

export const StarEmpty = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" />
  </svg>
);

export const Handshake = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <rect x="3" y="11" width="18" height="8" rx="1" />
    <path d="M7 11v6" />
    <path d="M12 11v6" />
    <path d="M17 11v6" />
  </svg>
);

export const Lightbulb = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

export const BookOpen = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const Target = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const Clipboard = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

export const BuildingSchool = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M4 10V21h6v-5h4v5h6V10L12 3z" />
    <path d="M8 10v11h2v-7h4v7h2v-7h2v7h2v-11" />
  </svg>
);

export const Calendar = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const Clock = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Award = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export const Trophy = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const MedalGold = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="9" r="6" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
    <path d="M8 21l2-4 2 4 2-4 2 4" stroke="#B8860B" strokeWidth="2" />
  </svg>
);

export const MedalSilver = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="9" r="6" fill="#C0C0C0" stroke="#808080" strokeWidth="2" />
    <path d="M8 21l2-4 2 4 2-4 2 4" stroke="#808080" strokeWidth="2" />
  </svg>
);

export const MedalBronze = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="9" r="6" fill="#CD7F32" stroke="#8B4513" strokeWidth="2" />
    <path d="M8 21l2-4 2 4 2-4 2 4" stroke="#8B4513" strokeWidth="2" />
  </svg>
);

export const GraduationCap = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

export const Search = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Trash = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const Pencil = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export const ChatBubble = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const QuestionMark = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const Flag = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export const Crown = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M2 17l3-7 3 7 3-7 3 7 3-7" />
    <path d="M5 17v4h14v-4" />
    <path d="M9 10l3-4 3 4" />
    <path d="M12 6v4" />
  </svg>
);

export const User = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Users = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Hourglass = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4h-2v4" />
    <path d="M7 22v-4h2v4" />
    <path d="M7 2v4h2" />
    <path d="M17 2v4h-2" />
  </svg>
);

export const Check = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const X = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const AlertTriangle = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const FileText = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const Mail = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const Tag = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const Party = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path d="M5.8 11.3L2 22h10l-3.8-10.7" />
    <path d="M4 3h.01" />
    <path d="M20 3h.01" />
    <path d="M15 8h.01" />
    <path d="M9 8h.01" />
    <path d="M12 14v7" />
    <path d="M9 22h6" />
  </svg>
);

export const ArrowUp = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export const ArrowDown = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export const ArrowLeft = ({ className = "", size = "1em" }) => (
  <svg
    {...iconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const icons = {
  badgeGold: BadgeGold,
  badgeSilver: BadgeSilver,
  badgeBronze: BadgeBronze,
  badgeMember: BadgeMember,
  starFilled: StarFilled,
  starEmpty: StarEmpty,
  star: StarFilled,
  handshake: Handshake,
  lightbulb: Lightbulb,
  bookOpen: BookOpen,
  target: Target,
  clipboard: Clipboard,
  buildingSchool: BuildingSchool,
  calendar: Calendar,
  clock: Clock,
  award: Award,
  trophy: Trophy,
  medalGold: MedalGold,
  medalSilver: MedalSilver,
  medalBronze: MedalBronze,
  graduationCap: GraduationCap,
  search: Search,
  trash: Trash,
  pencil: Pencil,
  chatBubble: ChatBubble,
  questionMark: QuestionMark,
  flag: Flag,
  crown: Crown,
  user: User,
  users: Users,
  hourglass: Hourglass,
  check: Check,
  x: X,
  alertTriangle: AlertTriangle,
  fileText: FileText,
  mail: Mail,
  tag: Tag,
  party: Party,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
};

export const Icon = ({ name, className = "", size = "1em" }) => {
  try {
    const IconComponent = icons[name];
    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in icon registry`);
      return null;
    }
    return <IconComponent className={className} size={size} />;
  } catch (error) {
    console.error(`Error rendering icon "${name}":`, error);
    return null;
  }
};