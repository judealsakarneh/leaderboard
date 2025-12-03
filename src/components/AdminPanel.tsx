import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAgents } from "../context/AgentsContext";
import type { Department } from "../types";

const departments: Department[] = ["retention", "nsf"];

export const AdminPanel: React.FC = () => {
  const { agents, addAgent, adjustScore } = useAgents();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addAgent(name, avatarUrl);
    setName("");
    setAvatarUrl("");
  };

  const labelForDept = (dept: Department) =>
    dept === "retention" ? "Retains" : "NSFs";

  return (
    <div className="admin-screen">
      <div className="admin-panel">
        <div className="admin-header">
          <h1 className="admin-title">Floor Control</h1>
        </div>

        <div className="admin-add">
          <input
            className="input"
            placeholder="Agent name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            className="input"
            placeholder="Avatar URL (optional)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="btn primary" onClick={handleAdd}>
            Add
          </button>
        </div>

        <div className="admin-list">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              className="admin-agent-row"
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="admin-agent-main">
                <div className="admin-avatar">
                  {agent.avatarUrl ? (
                    <img src={agent.avatarUrl} alt={agent.name} />
                  ) : (
                    <span>{agent.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="admin-agent-name">{agent.name}</div>
                  <div className="admin-agent-id">ID {agent.id}</div>
                </div>
              </div>

              <div className="admin-agent-stats">
                {departments.map((dept) => {
                  const score = agent.stats[dept]?.score || 0;
                  return (
                    <div key={dept} className="admin-stat-block">
                      <div className="admin-stat-label">
                        {labelForDept(dept)}
                      </div>
                      <div className="admin-stat-value">{score}</div>
                      <div className="admin-buttons-row">
                        <button
                          className="btn ghost-small"
                          onClick={() => adjustScore(agent.id, dept, -1)}
                        >
                          –1
                        </button>
                        <button
                          className="btn ghost-small plus"
                          onClick={() => adjustScore(agent.id, dept, 1)}
                        >
                          +1
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
