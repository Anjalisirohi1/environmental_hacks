import React from "react";

export const ReplanScreen: React.FC = () => {
  return (
    <div style={{ padding: "8px", maxWidth: "1200px" }} data-testid="replan-screen">
      <h2>Disruption Replanning</h2>
      <p style={{ color: "var(--jp-muted)" }}>
        Real-time dynamic re-optimization and allocation delta diff upon crisis events.
      </p>
      <div style={{ background: "var(--jp-surface)", border: "1px dashed var(--jp-border)", borderRadius: "var(--jp-radius)", padding: "40px", textAlign: "center", color: "var(--jp-muted)" }}>
        Disruption simulation and replanning controls (Scheduled for Milestone M12).
      </div>
    </div>
  );
};
