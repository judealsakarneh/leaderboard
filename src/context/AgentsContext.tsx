import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  Agent,
  AgentStats,
  Department,
  Event,
  Notification,
} from "../types";

type AgentsContextValue = {
  agents: Agent[];
  events: Event[];
  notifications: Notification[];
  addAgent: (name: string, avatarUrl?: string) => void;
  adjustScore: (agentId: number, department: Department, delta: number) => void;
  getSortedAgents: (department: Department) => Agent[];
  getDepartmentTotal: (department: Department) => number;
  getRecentCountForAgent: (
    agentId: number,
    department: Department,
    sinceMs: number
  ) => number;
  connectToGithubRepo: (agentId: number, repoUrl: string) => void;
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

export const AgentsProvider: React.FC<Props> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const pushNotification = useCallback(
    (data: Omit<Notification, "id">, ttl = 2600) => {
      const id = ++notificationIdCounter;
      const notif: Notification = { id, ...data };
      setNotifications((prev) => [...prev, notif]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, ttl);
    },
    []
  );

  // Connect to GitHub repo: triggers a notification
  const connectToGithubRepo = useCallback((agentId: number, repoUrl: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    pushNotification({
      agentId,
      agentName: agent.name,
      department: "retention",
      kind: "plus",
      message: `Connecting ${agent.name} to GitHub repo: ${repoUrl}`,
    }, 2500);
  }, [agents, pushNotification]);

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
                agentName: targetAgent ? targetAgent.name : "",
                department,
                kind: "plus",
                message: `+${delta} ${labelDept}${
                  delta > 1 ? "s" : ""
                } locked in.`,
              },
              1800
            );
          } else {
            pushNotification(
              {
                agentId,
                agentName: targetAgent && "name" in targetAgent ? targetAgent.name : "",
                department,
                kind: "minus",
                message: `${Math.abs(
                  delta
                )} ${labelDept}${Math.abs(delta) > 1 ? "s" : ""} reversed.`,
              },
              1800
            );
          }

          // Only celebrate upward moves
          if (delta > 0 && newScore > prevScore) {
            const threshold =
              department === "retention" ? 5 : 10; // 5 retains, 10 NSFs
            const jackpotMultiplier =
              department === "retention" ? 5 : 10; // milestone every 5/10

            const hitJackpot =
              newScore >= threshold && newScore % jackpotMultiplier === 0;

            if (hitJackpot) {
              pushNotification(
                {
                  agentId,
                  agentName: targetAgent && "name" in targetAgent ? targetAgent.name : "",
                  department,
                  kind: "jackpot",
                  message:
                    department === "retention"
                      ? `Slot hit: ${newScore} retains.`
                      : `Board spike: ${newScore} NSFs.`,
                },
                3800
              );
            } else if (newScore % jackpotMultiplier === 0) {
              pushNotification(
                {
                  agentId,
                  agentName: targetAgent && "name" in targetAgent ? targetAgent.name : "",
                  department,
                  kind: "milestone",
                  message: `Milestone at ${newScore} ${labelDept}s.`,
                },
                3200
              );
            }

            // Streak check: last 5 minutes, same department, positive events
            setEvents((prev) => {
              const since = nowTs - 5 * 60 * 1000;
              const recent = prev.filter(
                (e) =>
                  e.timestamp >= since &&
                  e.agentId === agentId &&
                  e.department === department &&
                  e.delta > 0
              );
              const totalDelta =
                recent.reduce((sum, e) => sum + e.delta, 0) + delta;
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
    [pushNotification]
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
        addAgent,
        adjustScore,
        getSortedAgents,
        getDepartmentTotal,
        getRecentCountForAgent,
        connectToGithubRepo,
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
