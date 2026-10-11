import React from "react";

export const CompareScreen: React.FC = () => {
  return (
    <div style={{ padding: "8px", maxWidth: "1200px" }} data-testid="compare-screen">
      <h2>Strategy Comparison</h2>
      <p style={{ color: "var(--jp-muted)" }}>
        Benchmark JalPriority AI against FCFS and Nearest-First baseline dispatch heuristics.
      </p>
      <div style={{ background: "var(--jp-surface)", border: "1px dashed var(--jp-border)", borderRadius: "var(--jp-radius)", padding: "40px", textAlign: "center", color: "var(--jp-muted)" }}>
        Comparison metrics table and charts (Scheduled for Milestone M12).
      </div>
    </div>
  );
};
