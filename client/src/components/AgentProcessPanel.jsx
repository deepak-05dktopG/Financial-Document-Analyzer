function statusLabel(status) {
    if (status === "completed") {
        return "Completed";
    }
    if (status === "in_progress") {
        return "Running";
    }
    if (status === "failed") {
        return "Failed";
    }
    return "Queued";
}

function AgentProcessPanel({ loading, stages, summary, error }) {
    const panelStatus = error ? "failed" : loading ? "running" : "ready";

    return (
        <section className={`panel-card process-card process-card-${panelStatus}`} aria-live="polite">
            <div className="panel-card-header">
                <div className="workflow-head-row">
                    <div className="panel-badge">Workflow</div>
                    <span className={`workflow-state state-${panelStatus}`}>{error ? "Interrupted" : loading ? "Live" : "Ready"}</span>
                </div>
                <h2 className="panel-title mb-1">Backend Agent Workflow</h2>
                <p className="panel-subtitle mb-0">Real-time pipeline status and agent progress.</p>
            </div>

            <div className="panel-card-body">
                <div className="workflow-strip-head mb-2">
                    <span>{summary.completed}/{summary.total} complete</span>
                    <span>{error ? "interrupted" : loading ? "running" : "ready"}</span>
                </div>

                <div className="workflow-progress mb-2" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={summary.progressPercent}>
                    <div className="workflow-progress-bar" style={{ width: `${summary.progressPercent}%` }} />
                </div>

                <ol className="agent-stage-list-horizontal mb-0 d-flex justify-content-between align-items-center">
                    {stages.map((stage) => (
                        <li className={`agent-stage-horizontal stage-${stage.status}`} key={stage.id} title={`${stage.title} - ${statusLabel(stage.status)}`}>
                            <span className="stage-dot" aria-hidden="true" />
                            <span className="stage-title-inline">{stage.title}</span>
                        </li>
                    ))}
                </ol>

                {error ? <div className="alert alert-danger mt-2 mb-0">Workflow interrupted.</div> : null}
            </div>
        </section>
    );
}

export default AgentProcessPanel;
