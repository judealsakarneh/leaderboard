import React from "react";
import { motion } from "framer-motion";
import type { Agent, Department } from "../types";

type Props = {
  department: Department;
  agents: Agent[];
  dense?: boolean;
  highlightAgentId?: number;
};

export const Leaderboard: React.FC<Props> = ({
  department,
  agents,
  dense,
  highlightAgentId,
}) => {
  const threshold = department === "retention" ? 5 : 10;

  return (
    <div className={`lb-list ${dense ? "lb-list-dense" : ""}`}>
      {agents.map((agent, index) => {
        const stats = agent.stats[department];
        const score = stats?.score || 0;
        const isTop = index === 0;
        const isElite = score >= threshold;
        const isHighlight = highlightAgentId === agent.id;

        const fillPercent =
          score <= 0 ? 5 : Math.min(100, department === "retention" ? score * 12 : score * 6);

        return (
          <motion.div
            key={agent.id}
            layout
            className={`lb-row ${isElite ? "lb-row-elite" : ""} ${
              isHighlight ? "lb-row-focus" : ""
            }`}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <motion.div
              className="lb-rank"
              animate={
                isTop
                  ? { scale: [1, 1.12, 1], y: [0, -1, 0] }
                  : undefined
              }
              transition={
                isTop
                  ? { duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }
                  : undefined
              }
            >
              #{index + 1}
            </motion.div>

            <div className="lb-main">
              <div className="lb-top">
                <div className="lb-avatar">
                  {agent.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} />
                  ) : (
                    <span>{agent.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="lb-info">
                  <div className="lb-name">{agent.name}</div>
                  <div className="lb-sub">
                    {department === "retention" ? "Retention" : "NSF"} Floor
                  </div>
                </div>
              </div>

              <div className="lb-bar-wrap">
                <div className="lb-bar-bg" />
                <motion.div
                  className="lb-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                />
              </div>
            </div>

            <motion.div
              className="lb-score"
              animate={
                isElite
                  ? { scale: [1, 1.06, 1] }
                  : undefined
              }
              transition={
                isElite
                  ? { duration: 0.8, repeat: Infinity, repeatDelay: 2 }
                  : undefined
              }
            >
              {score}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
