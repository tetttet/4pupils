export type MailTag = Array<
  "important" | "work" | "personal" | "spam" | "teacher" | "student" | "admin"
>;

export type MailFolder =
  | "draft"
  | "sent"
  | "inbox"
  | "archived"
  | "trash"
  | "spam";

export type MailType = "user" | "system" | "notification";

export type MailSender = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  role: "student" | "teacher" | "admin";
};

export type MailListItem = {
  mail_id: string;
  folder: MailFolder;
  unread: boolean;
  read_at: string | null;
  starred: boolean;
  important: boolean;
  tags: MailTag;

  sender_id: string;
  subject: string;
  preview: string;
  type: MailType;
  thread_id: string | null;
  created_at: string;
  sender?: MailSender | null;
  unread_count?: number;
};

export type MailAttachment = {
  id: string;
  name: string;
  url: string;
  size: number;
  mime: string;
};

export type MailDetail = {
  folder: MailFolder;
  unread: boolean;
  read_at: string | null;
  starred: boolean;
  important: boolean;
  tags: MailTag;

  id: string; // mail id
  sender_id: string;
  subject: string;
  preview: string;
  body: string;
  type: MailType;
  thread_id: string | null;
  reply_to_id: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;

  to: string[];
  cc: string[];
  bcc: string[];

  attachments: MailAttachment[];
};

export type CreateDraftPayload = {
  subject?: string;
  preview?: string;
  body?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  tags?: MailTag;
  type?: MailType;
};

export type UpdateDraftPayload = {
  subject?: string | null;
  preview?: string | null;
  body?: string | null;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  tags?: MailTag;
};

export type SendPayload = { scheduledAt?: string | null };
