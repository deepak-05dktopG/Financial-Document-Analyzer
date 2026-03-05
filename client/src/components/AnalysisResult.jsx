import { useMemo } from "react";

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

function formatElapsed(seconds) {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
}

function normalizeLine(text) {
    return text.replace(/\*\*/g, "").trim();
}

function parseAnalysisSections(text) {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const sections = [];
    let current = { title: "Executive Summary", bullets: [], paragraphs: [] };

    const pushCurrent = () => {
        if (current.bullets.length > 0 || current.paragraphs.length > 0) {
            sections.push(current);
        }
    };

    lines.forEach((line) => {
        const markdownHeadingMatch = line.match(/^\*\*(.+?)\*\*:?(.*)$/);
        const hashHeadingMatch = line.match(/^#{1,3}\s+(.+)$/);
        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        const numericBulletMatch = line.match(/^\d+\.\s+(.+)$/);

        if (hashHeadingMatch) {
            pushCurrent();
            current = {
                title: normalizeLine(hashHeadingMatch[1]),
                bullets: [],
                paragraphs: [],
            };
            return;
        }

        if (markdownHeadingMatch && markdownHeadingMatch[1].length <= 80) {
            pushCurrent();
            current = {
                title: normalizeLine(markdownHeadingMatch[1]),
                bullets: [],
                paragraphs: [],
            };
            const headingTail = normalizeLine(markdownHeadingMatch[2] || "");
            if (headingTail) {
                current.paragraphs.push(headingTail);
            }
            return;
        }

        if (bulletMatch) {
            current.bullets.push(normalizeLine(bulletMatch[1]));
            return;
        }

        if (numericBulletMatch) {
            current.bullets.push(normalizeLine(numericBulletMatch[1]));
            return;
        }

        current.paragraphs.push(normalizeLine(line));
    });

    pushCurrent();

    if (sections.length === 0) {
        return [{ title: "Executive Summary", bullets: [], paragraphs: [text.trim()] }];
    }

    return sections;
}

function AnalysisResult({ loading, result, stages = [], elapsedSeconds = 0 }) {
    const analysisText = useMemo(() => {
        if (!result) {
            return "";
        }
        return typeof result.analysis === "string" ? result.analysis : JSON.stringify(result.analysis, null, 2);
    }, [result]);
    const sections = useMemo(() => parseAnalysisSections(analysisText), [analysisText]);
    const activeStage = useMemo(() => {
        const running = stages.find((stage) => stage.status === "in_progress");
        if (running) {
            return running;
        }
        const completed = [...stages].reverse().find((stage) => stage.status === "completed");
        return completed || stages[0] || null;
    }, [stages]);

    if (loading) {
        return (
            <section className="panel-card">
                <div className="panel-card-header">
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                        <div>
                            <h2 className="panel-title mb-1">Analysis In Progress</h2>
                            <p className="panel-subtitle mb-0">Agent-by-agent workflow is running on your document.</p>
                        </div>
                        <div className="run-timer" aria-label="Elapsed processing time">
                            <span className="run-timer-label">Elapsed</span>
                            <span className="run-timer-value">{formatElapsed(elapsedSeconds)}</span>
                        </div>
                    </div>
                </div>
                <div className="panel-card-body">
                    <div className="active-agent-row mb-3" aria-live="polite">
                        <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <div>
                            <div className="active-agent-label">Current Agent</div>
                            <div className="active-agent-name">{activeStage ? activeStage.title : "Initializing workflow"}</div>
                        </div>
                    </div>

                    {stages.length > 0 ? (
                        <ol className="agent-status-list mb-0">
                            {stages.map((stage) => (
                                <li key={stage.id} className={`agent-status-item stage-${stage.status}`}>
                                    <span className="stage-dot" aria-hidden="true" />
                                    <span className="agent-status-title">{stage.title}</span>
                                    <span className="agent-status-value">{statusLabel(stage.status)}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="mb-0">Preparing agent pipeline...</p>
                    )}
                </div>
            </section>
        );
    }

    if (!result) {
        return (
            <section className="panel-card">
                <div className="panel-card-header">
                    <h2 className="panel-title mb-1">Analysis Output</h2>
                    <p className="panel-subtitle mb-0">Run an analysis to view structured results here.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="panel-card">
            <div className="panel-card-header">
                <h2 className="panel-title mb-1">Analysis Output</h2>
                <p className="panel-subtitle mb-0">AI-generated findings with operational metadata.</p>
            </div>

            <div className="panel-card-body">
                

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="report-title mb-0">Structured Analyst Report</h3>
                </div>

                <div className="analysis-copy report-sections">
                    {sections.map((section, sectionIndex) => (
                        <article className="report-section" key={`${section.title}-${sectionIndex}`}>
                            <h4 className="report-section-title">{section.title}</h4>
                            {section.paragraphs.map((paragraph, paragraphIndex) => (
                                <p key={`${sectionIndex}-p-${paragraphIndex}`} className="analysis-paragraph">
                                    {paragraph}
                                </p>
                            ))}
                            {section.bullets.length > 0 ? (
                                <ul className="report-bullets">
                                    {section.bullets.map((bullet, bulletIndex) => (
                                        <li key={`${sectionIndex}-b-${bulletIndex}`}>{bullet}</li>
                                    ))}
                                </ul>
                            ) : null}
                        </article>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default AnalysisResult;