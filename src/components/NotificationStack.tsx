import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgents } from "../context/AgentsContext";

export const NotificationStack: React.FC = () => {
  const { notifications } = useAgents();

  // Only show the latest 4 notifications to prevent overlap
  const visibleNotifications = notifications.slice(-4);

  return (
    <div className="notif-stack">
      <AnimatePresence>
        {visibleNotifications.map((n, index) => {
          // Stagger notifications from bottom, each one offset more
          const offset = (visibleNotifications.length - 1 - index) * 75;

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
            case "rankUp":
              label = "RANK UP";
              cls = "accent-rankup";
              break;
            case "info":
              label = "INFO";
              cls = "accent-info";
              break;
            default:
              label = "";
              cls = "";
          }

          return (
            <motion.div
              key={n.id}
              className={`notif-card ${cls}`}
              style={{ bottom: 12 + offset }}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <div className="notif-header">
                <span className="notif-label">{label}</span>
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
