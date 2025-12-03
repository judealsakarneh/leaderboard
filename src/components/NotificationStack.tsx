import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgents } from "../context/AgentsContext";

const getEmoji = (kind: string, department: string) => {
  if (kind === "jackpot") return department === "retention" ? "🔥" : "⚡";
  if (kind === "streak") return "🚀";
  if (kind === "milestone") return "🎯";
  if (kind === "plus") return department === "retention" ? "✅" : "💪";
  if (kind === "minus") return "↩️";
  return "";
};

export const NotificationStack: React.FC = () => {
  const { notifications } = useAgents();

  return (
    <div className="notif-stack">
      <AnimatePresence>
        {notifications.map((n, index) => {
          const offset = index * 70;

          let label = "";
          let cls = "";

          switch (n.kind) {
            case "plus":
              label = "HIT";
              cls = "accent-plus";
              break;
            case "minus":
              label = "ADJUST";
              cls = "accent-minus";
              break;
            case "milestone":
              label = "MILESTONE";
              cls = "accent-milestone";
              break;
            case "streak":
              label = "STREAK";
              cls = "accent-streak";
              break;
            case "jackpot":
              label = "JACKPOT";
              cls = "accent-jackpot";
              break;
          }

          const emoji = getEmoji(n.kind, n.department);
          const isSpecial = n.kind === "jackpot" || n.kind === "streak";

          return (
            <motion.div
              key={n.id}
              className={`notif-card ${cls}`}
              style={{ bottom: 12 + offset }}
              initial={{ x: 80, opacity: 0, scale: 0.95 }}
              animate={
                isSpecial
                  ? { x: 0, opacity: 1, scale: [0.95, 1.05, 1] }
                  : { x: 0, opacity: 1, scale: 1 }
              }
              exit={{ x: 80, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="notif-header">
                <span className="notif-label">
                  {emoji} {label}
                </span>
                <span
                  className={`notif-dept ${
                    n.department === "retention" ? "d-ret" : "d-nsf"
                  }`}
                >
                  {n.department === "retention" ? "RET" : "NSF"}
                </span>
              </div>
              <div className="notif-agent">{n.agentName}</div>
              <div className="notif-message">{n.message}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
