export type Department = "retention" | "nsf";

export type AgentStats = {
  score: number;
};

export type Agent = {
  id: number;
  name: string;
  avatarUrl?: string;
  createdAt: number;
  stats: Record<Department, AgentStats>;
};

export type Event = {
  id: number;
  agentId: number;
  department: Department;
  delta: number;
  timestamp: number;
};

export type NotificationKind = "plus" | "minus" | "milestone" | "streak" | "jackpot" | "info" | "bigAnnouncement" | "rankUp";

export type Notification = {
  id: number;
  agentId: number;
  agentName: string;
  department: Department;
  kind: NotificationKind;
  message: string;
};
