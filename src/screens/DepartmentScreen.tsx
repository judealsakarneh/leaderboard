import React from "react";
import { useAgents } from "../context/AgentsContext";
import { Leaderboard } from "../components/Leaderboard";
import type { Department } from "../types";

type Props = {
  department: Department;
};

export const DepartmentScreen: React.FC<Props> = ({ department }) => {
  const { getSortedAgents, getDepartmentTotal } = useAgents();

  // Use the correct function name
  const agents = getSortedAgents(department);
  const total = getDepartmentTotal(department);

  return (
    <div className="department-screen">
      <div className="department-header">
        <h1 className="department-title">
          {department === "retention" ? "Retention" : "NSF"} Floor
        </h1>

        <div className="department-total">
          <div className="department-total-number">{total}</div>
          <div className="department-total-label">
            {department === "retention" ? "Total Retains" : "Total NSFs"}
          </div>
        </div>
      </div>

      <Leaderboard department={department} agents={agents} />
    </div>
  );
};
