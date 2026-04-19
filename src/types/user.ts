export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "blocked";
  role: USER_ROLES;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type USER_ROLES = "student" | "teacher" | "admin";
