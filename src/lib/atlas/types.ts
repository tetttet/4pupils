export type AtlasIntent =
  | "intro"
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

export type AtlasCardVisual =
  | "sparkles"
  | "compass"
  | "layers"
  | "shield"
  | "book"
  | "messages"
  | "dashboard"
  | "users"
  | "courses"
  | "settings";

export type AtlasFeatureCard = {
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  visual: AtlasCardVisual;
};

export type AtlasDeepLinkCard = {
  title: string;
  description: string;
  href: string;
  actionLabel?: string;
  visual: AtlasCardVisual;
};

export type AtlasIntroPayload = {
  featureCards: AtlasFeatureCard[];
  featureTitle?: string;
  deepLinks: AtlasDeepLinkCard[];
  deepLinksTitle?: string;
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

export type AtlasHistoryMessage = {
  content: string;
  role: "assistant" | "user";
};

export type BotReply = {
  answer: string;
  engine: "local" | "openrouter" | "openrouter-fallback";
  intent: AtlasIntent;
  confidence: number;
  actions: ChatAction[];
  links: LinkTarget[];
  chips: string[];
  sources: string[];
  memory: AtlasMemory;
  context: UserContext;
  handoff: boolean;
  intro?: AtlasIntroPayload;
  topic?: string;
};

export type ChatRequest = {
  message: string;
  history?: AtlasHistoryMessage[];
  memory?: AtlasMemory;
  context?: UserContext;
};
