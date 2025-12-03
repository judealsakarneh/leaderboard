import React, { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
} from "framer-motion";

type Agent = {
  id: number;
  name: string;
  score: number;
  createdAt: number;
};

type MilestoneNotification = {
  id: number;
  agentName: string;
  milestone: number;
};

let agentCounter = 3;
let notificationId = 0;

const initialAgents: Agent[] = [
  { id: 1, name: "Jude", score: 3, createdAt: Date.now() - 3000 },
  { id: 2, name: "Sara", score: 5, createdAt: Date.now() - 2000 },
  { id: 3, name: "Omar", score: 1, createdAt: Date.now() - 1000 },
];

const coolMessages = [
  "🔥 ON FIRE!",
  "🚀 ROCKET MODE",
  "⚡ UNSTOPPABLE",
  "💪 CRUSHING IT",
  "🎯 LETHAL",
  "⭐ SUPERSTAR",
  "🏆 CHAMPION",
  "💯 PERFECT STREAK",
];

// Screen shake hook
const useScreenShake = (intensity: number = 15, duration: number = 400) => {
  return (callback?: () => void) => {
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = elapsed / duration;

      if (progress < 1) {
        const x = (Math.random() - 0.5) * intensity * (1 - progress);
        const y = (Math.random() - 0.5) * intensity * (1 - progress);
        document.documentElement.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(animate);
      } else {
        document.documentElement.style.transform = "translate(0, 0)";
        callback?.();
      }
    };
    animate();
  };
};

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [newAgentName, setNewAgentName] = useState("");
  const [milestoneNotifications, setMilestoneNotifications] = useState<
    MilestoneNotification[]
  >([]);

  const shake = useScreenShake(15, 400);

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.createdAt - b.createdAt;
    });
  }, [agents]);

  const handleAddAgent = () => {
    const name = newAgentName.trim();
    if (!name) return;
    agentCounter += 1;
    const now = Date.now();
    setAgents((prev) => [
      ...prev,
      { id: agentCounter, name, score: 0, createdAt: now },
    ]);
    setNewAgentName("");
  };

  const handlePlusOne = (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const newScore = agent.score + 1;

    // Update scores
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, score: newScore } : a
      )
    );

    // Trigger earthquake and notification on 5-milestone
    if (newScore > 0 && newScore % 5 === 0) {
      shake();
      notificationId += 1;
      setMilestoneNotifications((prev) => [
        ...prev,
        {
          id: notificationId,
          agentName: agent.name,
          milestone: newScore,
        },
      ]);

      // Remove notification after 4 seconds
      setTimeout(() => {
        setMilestoneNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
      }, 4000);
    }
  };

  const handleResetScores = () => {
    setAgents((prev) => prev.map((a) => ({ ...a, score: 0 })));
  };

  const handleClearAgents = () => {
    setAgents([]);
  };

  return (
    <div className="app-root">
      <div className="app-overlay-gradient" />
      <div className="app-grid">
        {/* LEFT: Admin Panel */}
        <section className="panel panel-admin">
          <h1 className="title-main">
            Retention <span>Arena</span>
          </h1>
          <p className="subtitle">
            Add agents & give <strong>+1</strong> when they retain a client.
            Every <strong>5 retentions</strong> = 🌍 EARTHQUAKE!
          </p>

          <div className="card">
            <h2 className="card-title">Add Agent</h2>
            <div className="row">
              <input
                className="input"
                placeholder="Agent name…"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddAgent();
                }}
              />
              <button className="btn primary" onClick={handleAddAgent}>
                + Add
              </button>
            </div>
          </div>

          <div className="card card-agents">
            <div className="card-header">
              <h2 className="card-title">Agents</h2>
              <div className="card-controls">
                <button className="btn ghost" onClick={handleResetScores}>
                  Reset scores
                </button>
                <button
                  className="btn ghost danger"
                  onClick={handleClearAgents}
                >
                  Clear all
                </button>
              </div>
            </div>

            {sortedAgents.length === 0 ? (
              <p className="muted">No agents yet – add some above.</p>
            ) : (
              <div className="agent-list">
                {sortedAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                    className="agent-row"
                  >
                    <div className="agent-rank">#{index + 1}</div>
                    <div className="agent-main">
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-score">
                        {agent.score}{" "}
                        <span className="agent-score-label">retentions</span>
                      </div>
                    </div>
                    <button
                      className="btn plus"
                      onClick={() => handlePlusOne(agent.id)}
                    >
                      +1
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <p className="footnote">
            Put this on a TV or second screen, and hit +1 live whenever someone
            saves a client.
          </p>
        </section>

        {/* RIGHT: Leaderboard */}
        <section className="panel panel-leaderboard">
          <div className="leaderboard-header">
            <h2>🔥 LIVE RETENTION BOARD 🔥</h2>
            <p>Champion's bar stays on fire. Every 5 retentions = earthquake.</p>
          </div>

          <LayoutGroup>
            <motion.div layout className="leaderboard-list">
              {sortedAgents.map((agent, index) => (
                <LeaderboardRow
                  key={agent.id}
                  agent={agent}
                  index={index}
                  isTopAgent={index === 0}
                />
              ))}
            </motion.div>
          </LayoutGroup>

          {/* Milestone Notifications */}
          <AnimatePresence>
            {milestoneNotifications.map((notif) => (
              <MilestoneNotification key={notif.id} notification={notif} />
            ))}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

type LeaderboardRowProps = {
  agent: Agent;
  index: number;
  isTopAgent: boolean;
};

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  agent,
  index,
  isTopAgent,
}) => {
  return (
    <motion.div
      layout
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
      }}
      className={`leaderboard-row ${isTopAgent ? "top" : ""}`}
    >
      <motion.div
        className="leaderboard-rank"
        animate={isTopAgent ? { scale: [1, 1.2, 1] } : {}}
        transition={isTopAgent ? { duration: 0.8, repeat: Infinity, repeatDelay: 2.5 } : {}}
      >
        #{index + 1}
      </motion.div>

      <div className="leaderboard-info">
        <div className="leaderboard-name">{agent.name}</div>
        <div className="leaderboard-bar-wrap">
          <div className="leaderboard-bar-bg" />

          <motion.div
            className={`leaderboard-bar-fill ${isTopAgent ? "bar-fire" : ""}`}
            initial={{ width: 0 }}
            animate={{
              width: `${
                agent.score === 0 ? 6 : Math.min(agent.score * 12, 100)
              }%`,
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 24,
            }}
          >
            {/* Fire effect for top agent */}
            {isTopAgent && (
              <>
                {/* Animated fire glow */}
                <motion.div
                  className="fire-glow"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    filter: [
                      "drop-shadow(0 0 8px #ff6b1b) drop-shadow(0 0 16px #ff1744)",
                      "drop-shadow(0 0 16px #ff6b1b) drop-shadow(0 0 24px #ff1744)",
                      "drop-shadow(0 0 8px #ff6b1b) drop-shadow(0 0 16px #ff1744)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Flame particles */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`flame-${i}`}
                    className="flame-particle"
                    style={{
                      position: "absolute",
                      left: `${10 + i * 14}%`,
                      bottom: "-8px",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: ["#ff6b1b", "#ff1744", "#ffa726"][i % 3],
                    }}
                    animate={{
                      y: [-8, -40, -60],
                      opacity: [1, 0.8, 0],
                      scale: [1, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                  />
                ))}

                {/* Crown icon */}
                <motion.div
                  className="bar-crown"
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  👑
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="leaderboard-score"
        animate={isTopAgent ? { scale: [1, 1.15, 1] } : {}}
        transition={isTopAgent ? { duration: 0.8, repeat: Infinity, repeatDelay: 2.5 } : {}}
      >
        {agent.score}
      </motion.div>
    </motion.div>
  );
};

type MilestoneNotificationProps = {
  notification: MilestoneNotification;
};

const MilestoneNotification: React.FC<MilestoneNotificationProps> = ({
  notification,
}) => {
  const coolMessage =
    coolMessages[Math.floor(Math.random() * coolMessages.length)];

  return (
    <motion.div
      className="milestone-notification"
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -60, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <motion.div
        className="milestone-card"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="milestone-title">{coolMessage}</div>
        <div className="milestone-agent">{notification.agentName}</div>
        <div className="milestone-text">
          🎉 {notification.milestone} RETENTIONS 🎉
        </div>
      </motion.div>
    </motion.div>
  );
};

export default App;
