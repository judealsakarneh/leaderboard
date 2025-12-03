import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgents } from "../context/AgentsContext";
import { Leaderboard } from "../components/Leaderboard";
import type { Agent, Department } from "../types";

type DisplayMode = "retention" | "nsf" | "split" | "spotlight";

const ROTATION_MS = 16000;

export const DisplayScreen: React.FC = () => {
  const {
    agents,
    getSortedAgents,
    getDepartmentTotal,
    getRecentCountForAgent,
  } = useAgents();

  const [mode, setMode] = useState<DisplayMode>("retention");
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  const spotlightCandidates: Agent[] = useMemo(
    () =>
      agents.filter(
        (a) =>
          (a.stats.retention?.score || 0) > 0 ||
          (a.stats.nsf?.score || 0) > 0
      ),
    [agents]
  );

  useEffect(() => {
    const sequence: DisplayMode[] = ["retention", "nsf", "split", "spotlight"];

    const id = setInterval(() => {
      setMode((prev) => {
        const currentIndex = sequence.indexOf(prev);
        const next = sequence[(currentIndex + 1) % sequence.length];

        // Skip spotlight if no candidates
        if (next === "spotlight" && spotlightCandidates.length === 0) {
          return "retention";
        }
        return next;
      });
    }, ROTATION_MS);

    return () => clearInterval(id);
  }, [spotlightCandidates.length]);

  useEffect(() => {
    if (mode !== "spotlight") return;
    if (spotlightCandidates.length === 0) return;
    const id = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlightCandidates.length);
    }, 6000);
    return () => clearInterval(id);
  }, [mode, spotlightCandidates]);

  const retentionSorted = getSortedAgents("retention");
  const nsfSorted = getSortedAgents("nsf");
  const retentionTotal = getDepartmentTotal("retention");
  const nsfTotal = getDepartmentTotal("nsf");

  const activeSpotlight: Agent | null =
    mode === "spotlight" && spotlightCandidates.length > 0
      ? spotlightCandidates[spotlightIndex % spotlightCandidates.length]
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

  return (
    <div className="display-root">
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

        {mode === "spotlight" && activeSpotlight && (
          <motion.div
            key="spotlight"
            className="display-mode spotlight-mode"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
          >
            <div className="spotlight-header">Floor Highlight</div>
            <div className="spotlight-inner">
              <div className="spotlight-main-card">
                <div className="spotlight-avatar">
                  {activeSpotlight.avatarUrl ? (
                    <img
                      src={activeSpotlight.avatarUrl}
                      alt={activeSpotlight.name}
                    />
                  ) : (
                    <span>
                      {activeSpotlight.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="spotlight-name">{activeSpotlight.name}</div>
                <div className="spotlight-tagline">Floor streak monitor</div>
              </div>

              <div className="spotlight-stats-row">
                {(["retention", "nsf"] as Department[]).map((dept) => {
                  const total = activeSpotlight.stats[dept]?.score || 0;
                  const lastHour = getRecentCountForAgent(
                    activeSpotlight.id,
                    dept,
                    60 * 60 * 1000
                  );
                  const label =
                    dept === "retention" ? "Retains" : "NSFs Logged";
                  const hourLabel =
                    dept === "retention" ? "Retains last hour" : "NSFs last hour";

                  return (
                    <div key={dept} className="spotlight-stat-card">
                      <div className="spotlight-stat-title">{label}</div>
                      <div className="spotlight-stat-number">{total}</div>
                      <div className="spotlight-stat-sub">
                        {hourLabel}:{" "}
                        <span className="spotlight-stat-chip">
                          {lastHour}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
