export type AtlasIntent =
  | "account"
  | "profile"
  | "students"
  | "teachers"
  | "courses"
  | "schedule"
  | "payments"
  | "roles"
  | "access"
  | "admin"
  | "messages"
  | "settings"
  | "navigation"
  | "support"
  | "off_topic"
  | "general";

export type LinkTarget = {
  label: string;
  href: string;
};

export type AtlasMemory = {
  lastIntent?: AtlasIntent;
  lastTopic?: string;
  lastUserMessage?: string;
  lastBotAnswer?: string;
  lastSuggestedChips?: string[];
  selectedSection?: string;
  userGoal?: string;
  summary?: string;
};

export type UserContext = {
  role?: "student" | "teacher" | "admin" | "parent" | "school" | "unknown";
  selectedSection?: string;
  notes?: string[];
  lastUpdatedAt?: string;
  summary?: string;
};

export type ChatAction = {
  type: "link" | "handoff";
  label: string;
  href?: string;
};

export type BotReply = {
  answer: string;
  engine: "local" | "atlas" | "atlas-fallback";
  intent: AtlasIntent;
  confidence: number;
  actions: ChatAction[];
  links: LinkTarget[];
  chips: string[];
  sources: string[];
  memory: AtlasMemory;
  context: UserContext;
  handoff: boolean;
  topic?: string;
};

export type ChatRequest = {
  message: string;
  memory?: AtlasMemory;
  context?: UserContext;
};
