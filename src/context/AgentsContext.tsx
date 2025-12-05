import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type {
  Agent,
  AgentStats,
  Department,
  Event,
  Notification,
} from "../types";

type BigAnnouncement = {
  id: number;
  agentId: number;
  agentName: string;
  department: Department;
  score: number;
  message: string;
};

type AgentsContextValue = {
  agents: Agent[];
  events: Event[];
  notifications: Notification[];
  bigAnnouncement: BigAnnouncement | null;
  addAgent: (name: string, avatarUrl?: string) => void;
  adjustScore: (agentId: number, department: Department, delta: number) => void;
  getSortedAgents: (department: Department) => Agent[];
  getDepartmentTotal: (department: Department) => number;
  getRecentCountForAgent: (
    agentId: number,
    department: Department,
    sinceMs: number
  ) => number;
  dismissBigAnnouncement: () => void;
};

const AgentsContext = createContext<AgentsContextValue | undefined>(undefined);

let agentIdCounter = 3;
let eventIdCounter = 0;
let notificationIdCounter = 0;

const makeStats = (ret: number, nsf: number): Record<Department, AgentStats> => ({
  retention: { score: ret },
  nsf: { score: nsf },
});

const now = Date.now();

const initialAgents: Agent[] = [
  {
    id: 1,
    name: "Jude",
    avatarUrl: "",
    createdAt: now - 3000,
    stats: makeStats(4, 7),
  },
  {
    id: 2,
    name: "Sara",
    avatarUrl: "",
    createdAt: now - 2000,
    stats: makeStats(6, 2),
  },
  {
    id: 3,
    name: "Omar",
    avatarUrl: "",
    createdAt: now - 1000,
    stats: makeStats(1, 11),
  },
];

type Props = { children: ReactNode };

// Big announcement milestones
// NSF: 6, 10, 15, 20, 25, 30... (first at 6, then every 5)
// Retention: 4, 7, 10, 15, 20... (first at 4, then 7, then every 5)
const NSF_MILESTONES = [6, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;
const RETENTION_MILESTONES = [4, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

const isBigMilestone = (score: number, department: Department): boolean => {
  const milestones = department === "nsf" ? NSF_MILESTONES : RETENTION_MILESTONES;
  return milestones.includes(score);
};

// Hype messages for big announcements
const nsfHypeMessages = [
  "is on a tear!",
  "just won't stop!",
  "is absolutely crushing it!",
  "making waves on the floor!",
  "dominating the board!",
  "unstoppable right now!",
  "setting the pace!",
  "leading the charge!",
];

const retentionHypeMessages = [
  "is keeping clients happy!",
  "customer retention master!",
  "saving the day!",
  "keeping them coming back!",
  "client whisperer!",
  "retention machine!",
  "loyalty champion!",
  "making it happen!",
];

const getRandomHypeMessage = (department: Department): string => {
  const messages = department === "nsf" ? nsfHypeMessages : retentionHypeMessages;
  return messages[Math.floor(Math.random() * messages.length)];
};

// Fun rank up messages
const rankUpMessages = [
  "just passed",
  "moved up past",
  "overtook",
  "climbed above",
  "jumped over",
];

const getRandomRankUpMessage = (): string => {
  return rankUpMessages[Math.floor(Math.random() * rankUpMessages.length)];
};

export const AgentsProvider: React.FC<Props> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bigAnnouncement, setBigAnnouncement] = useState<BigAnnouncement | null>(null);
  const bigAnnouncementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissBigAnnouncement = useCallback(() => {
    setBigAnnouncement(null);
    if (bigAnnouncementTimeoutRef.current) {
      clearTimeout(bigAnnouncementTimeoutRef.current);
      bigAnnouncementTimeoutRef.current = null;
    }
  }, []);

  const showBigAnnouncement = useCallback((announcement: BigAnnouncement, duration = 5000) => {
    // Clear any existing timeout
    if (bigAnnouncementTimeoutRef.current) {
      clearTimeout(bigAnnouncementTimeoutRef.current);
    }
    setBigAnnouncement(announcement);
    bigAnnouncementTimeoutRef.current = setTimeout(() => {
      setBigAnnouncement(null);
      bigAnnouncementTimeoutRef.current = null;
    }, duration);
  }, []);

  const pushNotification = useCallback(
    (data: Omit<Notification, "id">, ttl = 2600) => {
      const id = ++notificationIdCounter;
      const notif: Notification = { id, ...data };
      setNotifications((prev) => {
        // Limit to max 4 notifications at a time
        const updated = [...prev, notif];
        if (updated.length > 4) {
          return updated.slice(-4);
        }
        return updated;
      });
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, ttl);
    },
    []
  );

  const addAgent = useCallback((name: string, avatarUrl?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = ++agentIdCounter;
    const createdAt = Date.now();
    const newAgent: Agent = {
      id,
      name: trimmed,
      avatarUrl: avatarUrl?.trim() || undefined,
      createdAt,
      stats: makeStats(0, 0),
    };
    setAgents((prev) => [...prev, newAgent]);
  }, []);

  const adjustScore = useCallback(
    (agentId: number, department: Department, delta: number) => {
      if (delta === 0) return;
      const nowTs = Date.now();

      setAgents((prevAgents) => {
        let targetAgent: Agent | undefined;
        let prevScore = 0;
        let newScore = 0;

        // Get previous rankings for rank change detection
        const prevSorted = [...prevAgents].sort((a, b) => {
          const sa = a.stats[department]?.score || 0;
          const sb = b.stats[department]?.score || 0;
          if (sb !== sa) return sb - sa;
          return a.createdAt - b.createdAt;
        });
        const prevRankIndex = prevSorted.findIndex(a => a.id === agentId);

        const updatedAgents = prevAgents.map((agent) => {
          if (agent.id !== agentId) return agent;

          targetAgent = agent;
          const currentStats = agent.stats[department] || { score: 0 };
          prevScore = currentStats.score;
          newScore = Math.max(0, prevScore + delta);

          const updatedStats: AgentStats = { score: newScore };

          return {
            ...agent,
            stats: {
              ...agent.stats,
              [department]: updatedStats,
            },
          };
        });

        if (targetAgent) {
          // Record event
          setEvents((prev) => {
            const evt: Event = {
              id: ++eventIdCounter,
              agentId,
              department,
              delta,
              timestamp: nowTs,
            };
            const all = [...prev, evt];
            // keep last 600 events max
            if (all.length > 600) all.shift();
            return all;
          });

          // Base notification
          const labelDept = department === "retention" ? "retain" : "NSF";

          if (delta > 0) {
            pushNotification(
              {
                agentId,
                agentName: targetAgent.name,
                department,
                kind: "plus",
                message: `+${delta} ${labelDept}${delta > 1 ? "s" : ""} locked in.`,
              },
              1800
            );

            // Check for rank changes - find new position
            const newSorted = [...updatedAgents].sort((a, b) => {
              const sa = a.stats[department]?.score || 0;
              const sb = b.stats[department]?.score || 0;
              if (sb !== sa) return sb - sa;
              return a.createdAt - b.createdAt;
            });
            const newRankIndex = newSorted.findIndex(a => a.id === agentId);
            
            // If agent moved up in rank
            if (newRankIndex < prevRankIndex && prevRankIndex > 0) {
              // Find who they passed
              const passedAgent = prevSorted[prevRankIndex - 1];
              if (passedAgent) {
                pushNotification(
                  {
                    agentId,
                    agentName: targetAgent.name,
                    department,
                    kind: "rankUp",
                    message: `${getRandomRankUpMessage()} ${passedAgent.name}!`,
                  },
                  2500
                );
              }
            }

            // Check for big milestone announcements
            if (isBigMilestone(newScore, department)) {
              const labelType = department === "retention" ? "Retains" : "NSFs";
              showBigAnnouncement({
                id: ++notificationIdCounter,
                agentId,
                agentName: targetAgent.name,
                department,
                score: newScore,
                message: `${targetAgent.name} ${getRandomHypeMessage(department)} ${newScore} ${labelType} so far!`,
              }, 6000);
            }
          } else {
            pushNotification(
              {
                agentId,
                agentName: targetAgent.name,
                department,
                kind: "minus",
                message: `${Math.abs(delta)} ${labelDept}${Math.abs(delta) > 1 ? "s" : ""} reversed.`,
              },
              1800
            );
          }

          // Streak check: last 5 minutes, same department, positive events
          if (delta > 0 && newScore > prevScore) {
            setEvents((prev) => {
              const since = nowTs - 5 * 60 * 1000;
              const recent = prev.filter(
                (e) =>
                  e.timestamp >= since &&
                  e.agentId === agentId &&
                  e.department === department &&
                  e.delta > 0
              );
              const totalDelta = recent.reduce((sum, e) => sum + e.delta, 0) + delta;
              if (totalDelta >= 3) {
                pushNotification(
                  {
                    agentId,
                    agentName: targetAgent!.name,
                    department,
                    kind: "streak",
                    message: `Floor streak: ${totalDelta} ${labelDept}s in minutes.`,
                  },
                  3400
                );
              }
              return prev;
            });
          }
        }

        return updatedAgents;
      });
    },
    [pushNotification, showBigAnnouncement]
  );

  const getSortedAgents = useCallback(
    (department: Department): Agent[] => {
      return [...agents].sort((a, b) => {
        const sa = a.stats[department]?.score || 0;
        const sb = b.stats[department]?.score || 0;
        if (sb !== sa) return sb - sa;
        return a.createdAt - b.createdAt;
      });
    },
    [agents]
  );

  const getDepartmentTotal = useCallback(
    (department: Department): number =>
      agents.reduce(
        (sum, agent) => sum + (agent.stats[department]?.score || 0),
        0
      ),
    [agents]
  );

  const getRecentCountForAgent = useCallback(
    (agentId: number, department: Department, sinceMs: number): number => {
      const cutoff = Date.now() - sinceMs;
      return events
        .filter(
          (e) =>
            e.agentId === agentId &&
            e.department === department &&
            e.timestamp >= cutoff &&
            e.delta > 0
        )
        .reduce((sum, e) => sum + e.delta, 0);
    },
    [events]
  );

  return (
    <AgentsContext.Provider
      value={{
        agents,
        events,
        notifications,
        bigAnnouncement,
        addAgent,
        adjustScore,
        getSortedAgents,
        getDepartmentTotal,
        getRecentCountForAgent,
        dismissBigAnnouncement,
      }}
    >
      {children}
    </AgentsContext.Provider>
  );
};

export const useAgents = (): AgentsContextValue => {
  const ctx = useContext(AgentsContext);
  if (!ctx) throw new Error("useAgents must be used inside AgentsProvider");
  return ctx;
};
