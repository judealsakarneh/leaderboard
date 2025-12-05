import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgents } from "../context/AgentsContext";
import { Leaderboard } from "../components/Leaderboard";
import type { Agent, Department } from "../types";

type DisplayMode = "retention" | "nsf" | "split" | "spotlight-retention" | "spotlight-nsf";

const ROTATION_MS = 12000;
const SPOTLIGHT_AGENT_MS = 5000;

export const DisplayScreen: React.FC = () => {
  const {
    agents,
    getSortedAgents,
    getDepartmentTotal,
    getRecentCountForAgent,
    bigAnnouncement,
    dismissBigAnnouncement,
  } = useAgents();

  const [mode, setMode] = useState<DisplayMode>("retention");
  const [retentionSpotlightIndex, setRetentionSpotlightIndex] = useState(0);
  const [nsfSpotlightIndex, setNsfSpotlightIndex] = useState(0);

  // Separate spotlight candidates by department
  const retentionCandidates: Agent[] = useMemo(
    () => agents.filter((a) => (a.stats.retention?.score || 0) > 0)
      .sort((a, b) => (b.stats.retention?.score || 0) - (a.stats.retention?.score || 0)),
    [agents]
  );

  const nsfCandidates: Agent[] = useMemo(
    () => agents.filter((a) => (a.stats.nsf?.score || 0) > 0)
      .sort((a, b) => (b.stats.nsf?.score || 0) - (a.stats.nsf?.score || 0)),
    [agents]
  );

  useEffect(() => {
    const sequence: DisplayMode[] = ["retention", "nsf", "split", "spotlight-retention", "spotlight-nsf"];

    const id = setInterval(() => {
      setMode((prev) => {
        const currentIndex = sequence.indexOf(prev);
        let next = sequence[(currentIndex + 1) % sequence.length];

        // Skip spotlight-retention if no candidates
        if (next === "spotlight-retention" && retentionCandidates.length === 0) {
          next = "spotlight-nsf";
        }
        // Skip spotlight-nsf if no candidates
        if (next === "spotlight-nsf" && nsfCandidates.length === 0) {
          next = "retention";
        }
        return next;
      });
    }, ROTATION_MS);

    return () => clearInterval(id);
  }, [retentionCandidates.length, nsfCandidates.length]);

  // Rotate retention spotlight agents
  useEffect(() => {
    if (mode !== "spotlight-retention" || retentionCandidates.length === 0) return;
    const id = setInterval(() => {
      setRetentionSpotlightIndex((prev) => (prev + 1) % retentionCandidates.length);
    }, SPOTLIGHT_AGENT_MS);
    return () => clearInterval(id);
  }, [mode, retentionCandidates.length]);

  // Rotate NSF spotlight agents
  useEffect(() => {
    if (mode !== "spotlight-nsf" || nsfCandidates.length === 0) return;
    const id = setInterval(() => {
      setNsfSpotlightIndex((prev) => (prev + 1) % nsfCandidates.length);
    }, SPOTLIGHT_AGENT_MS);
    return () => clearInterval(id);
  }, [mode, nsfCandidates.length]);

  const retentionSorted = getSortedAgents("retention");
  const nsfSorted = getSortedAgents("nsf");
  const retentionTotal = getDepartmentTotal("retention");
  const nsfTotal = getDepartmentTotal("nsf");

  const activeRetentionSpotlight: Agent | null =
    retentionCandidates.length > 0
      ? retentionCandidates[retentionSpotlightIndex % retentionCandidates.length]
      : null;

  const activeNsfSpotlight: Agent | null =
    nsfCandidates.length > 0
      ? nsfCandidates[nsfSpotlightIndex % nsfCandidates.length]
      : null;

  const cardFor = (dept: Department) => {
    const total = dept === "retention" ? retentionTotal : nsfTotal;
    return (
      <div className="screen-summary">
        <div className="screen-total">{total}</div>
        <div className="screen-label">
          {dept === "retention" ? "TOTAL RETAINS" : "TOTAL NSFs"}
        </div>
      </div>
    );
  };

  const renderSpotlight = (agent: Agent, dept: Department) => {
    const score = agent.stats[dept]?.score || 0;
    const lastHour = getRecentCountForAgent(agent.id, dept, 60 * 60 * 1000);
    const label = dept === "retention" ? "Retains" : "NSFs";
    const deptColor = dept === "retention" ? "#22c55e" : "#ef4444";

    return (
      <motion.div
        key={`spotlight-${dept}-${agent.id}`}
        className="display-mode spotlight-mode"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.5 }}
      >
        <div className="spotlight-header" style={{ color: deptColor }}>
          {dept === "retention" ? "Retention Spotlight" : "NSF Spotlight"}
        </div>
        <div className="spotlight-inner-single">
          <div className="spotlight-main-card-large">
            <div className="spotlight-avatar-large">
              {agent.avatarUrl ? (
                <img src={agent.avatarUrl} alt={agent.name} />
              ) : (
                <span>{agent.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="spotlight-info">
              <div className="spotlight-name-large">{agent.name}</div>
              <div className="spotlight-tagline-large">
                {dept === "retention" ? "Retention Champion" : "NSF Leader"}
              </div>
            </div>
          </div>
          <div className="spotlight-stats-single">
            <div className="spotlight-stat-big" style={{ borderColor: deptColor }}>
              <div className="spotlight-stat-number-big">{score}</div>
              <div className="spotlight-stat-label-big">{label}</div>
            </div>
            <div className="spotlight-stat-small">
              <span className="spotlight-stat-chip-big">{lastHour}</span>
              <span className="spotlight-stat-sub-big">Last hour</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="display-root">
      {/* Big Announcement Overlay */}
      <AnimatePresence>
        {bigAnnouncement && (
          <motion.div
            className="big-announcement-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissBigAnnouncement}
          >
            <motion.div
              className={`big-announcement-card ${bigAnnouncement.department}`}
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="big-announcement-header">
                {bigAnnouncement.department === "retention" ? "RETENTION MILESTONE" : "NSF MILESTONE"}
              </div>
              <div className="big-announcement-score">{bigAnnouncement.score}</div>
              <div className="big-announcement-name">{bigAnnouncement.agentName}</div>
              <div className="big-announcement-message">{bigAnnouncement.message}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mode === "retention" && (
          <motion.div
            key="retention"
            className="display-mode"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
          >
            <div className="display-header-row">
              <div className="display-title">Retention Floor</div>
              {cardFor("retention")}
            </div>
            <Leaderboard department="retention" agents={retentionSorted} />
          </motion.div>
        )}

        {mode === "nsf" && (
          <motion.div
            key="nsf"
            className="display-mode"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
          >
            <div className="display-header-row">
              <div className="display-title">NSF Floor</div>
              {cardFor("nsf")}
            </div>
            <Leaderboard department="nsf" agents={nsfSorted} />
          </motion.div>
        )}

        {mode === "split" && (
          <motion.div
            key="split"
            className="display-mode split-mode"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
            <div className="split-column">
              <div className="display-header-row">
                <div className="display-title small">Retention</div>
                {cardFor("retention")}
              </div>
              <Leaderboard
                department="retention"
                agents={retentionSorted}
                dense
              />
            </div>
            <div className="split-column">
              <div className="display-header-row">
                <div className="display-title small">NSF</div>
                {cardFor("nsf")}
              </div>
              <Leaderboard department="nsf" agents={nsfSorted} dense />
            </div>
          </motion.div>
        )}

        {mode === "spotlight-retention" && activeRetentionSpotlight && 
          renderSpotlight(activeRetentionSpotlight, "retention")}

        {mode === "spotlight-nsf" && activeNsfSpotlight && 
          renderSpotlight(activeNsfSpotlight, "nsf")}
      </AnimatePresence>
    </div>
  );
};
