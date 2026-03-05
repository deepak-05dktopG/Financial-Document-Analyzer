import { useEffect, useMemo, useRef, useState } from "react";
import DocumentUpload from "./components/DocumentUpload";
import QueryForm from "./components/QueryForm";
import AnalysisResult from "./components/AnalysisResult";
import AgentProcessPanel from "./components/AgentProcessPanel";
import { analyzeFinancialDocument } from "./services/api";

const DEFAULT_QUERY = "Analyze this financial document for investment insights";
const QUICK_QUERIES = [
    "Summarize revenue growth, margin trends, and EPS quality.",
    "Give a conservative investment view for a medium-risk investor.",
    "List top 5 risks and warning indicators to monitor quarterly.",
];

const PROCESS_BLUEPRINT = [
    {
        id: "intake",
        title: "File Intake",
        description: "API receives and stores the PDF, then validates payload fields.",
    },
    {
        id: "financial-analyst",
        title: "Senior Financial Analyst",
        description: "Extracts core metrics, trends, and financial performance evidence.",
    },
    {
        id: "investment-advisor",
        title: "Investment Advisor",
        description: "Generates balanced upside and downside investment considerations.",
    },
    {
        id: "risk-assessor",
        title: "Risk Assessor",
        description: "Ranks key risks by likelihood and impact with monitoring indicators.",
    },
    {
        id: "synthesis",
        title: "Final Synthesis",
        description: "Compiles all agent outputs into one response for the frontend.",
    },
];

const PROGRESS_SWITCH_SECONDS = [0, 3, 8, 13, 18];

function createInitialStages() {
    return PROCESS_BLUEPRINT.map((stage) => ({ ...stage, status: "pending" }));
}

function App() {
    const [file, setFile] = useState(null);
    const [query, setQuery] = useState(DEFAULT_QUERY);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [processStages, setProcessStages] = useState(createInitialStages);
    const analysisRef = useRef(null);

    useEffect(() => {
        if (!loading) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setElapsedSeconds((seconds) => seconds + 1);
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [loading]);

    useEffect(() => {
        if (!loading) {
            return;
        }

        const activeIndex = PROGRESS_SWITCH_SECONDS.reduce((index, threshold, currentIndex) => {
            if (elapsedSeconds >= threshold) {
                return currentIndex;
            }
            return index;
        }, 0);

        setProcessStages((previous) =>
            previous.map((stage, index) => {
                if (index < activeIndex) {
                    return { ...stage, status: "completed" };
                }
                if (index === activeIndex) {
                    return { ...stage, status: "in_progress" };
                }
                return { ...stage, status: "pending" };
            })
        );
    }, [elapsedSeconds, loading]);

    useEffect(() => {
        if (loading && analysisRef.current) {
            analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [loading]);

    useEffect(() => {
        if ((result || error) && analysisRef.current) {
            analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [result, error]);

    const processSummary = useMemo(() => {
        const completed = processStages.filter((stage) => stage.status === "completed").length;
        const inProgress = processStages.some((stage) => stage.status === "in_progress") ? 0.5 : 0;
        const progressPercent = Math.round(((completed + inProgress) / processStages.length) * 100);
        return {
            completed,
            total: processStages.length,
            progressPercent,
        };
    }, [processStages]);

    const handleAnalyze = async (event) => {
        event.preventDefault();
        setError("");
        setResult(null);

        if (!file) {
            setError("Please upload a PDF file.");
            return;
        }

        if (!query.trim()) {
            setError("Please enter an analysis query.");
            return;
        }

        setElapsedSeconds(0);
        setProcessStages(
            createInitialStages().map((stage, index) => ({
                ...stage,
                status: index === 0 ? "in_progress" : "pending",
            }))
        );

        setLoading(true);
        try {
            const response = await analyzeFinancialDocument({ file, query: query.trim() });
            setResult(response);
            setProcessStages((previous) => previous.map((stage) => ({ ...stage, status: "completed" })));
        } catch (requestError) {
            setError(requestError.message || "Failed to analyze document.");
            setProcessStages((previous) => {
                const activeIndex = previous.findIndex((stage) => stage.status === "in_progress");
                if (activeIndex === -1) {
                    return previous;
                }
                return previous.map((stage, index) => {
                    if (index === activeIndex) {
                        return { ...stage, status: "failed" };
                    }
                    return stage;
                });
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell min-vh-100">
            <nav className="top-nav">
                <div className="container-xl d-flex align-items-center justify-content-between">
                    <div className="nav-brand-wrap">
                        <div className="nav-brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" focusable="false">
                                <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2 3v10h2v-4h5v-2H9V9h6V7H7Z" />
                            </svg>
                        </div>
                        <div>
                            <div className="nav-brand">Financial Document Analyzer</div>
                            <div className="nav-sub">AI-powered analysis workspace</div>
                        </div>
                    </div>
                    <div className="nav-pill">{loading ? "Live Run Active" : "System Ready"}</div>
                </div>
            </nav>

            <main className="container-xl py-4 py-lg-5 app-main">
                <div className="workspace-head mb-3">
                    <div>
                        <div className="eyebrow">Professional Suite</div>
                        <h1 className="app-title mb-1">Financial Document Analyzer</h1>
                        <p className="app-subtitle mb-0">Enterprise-style interface for faster analysis and clearer decision support.</p>
                    </div>
                </div>

                <section className="workspace-stack">
                    
                   

                    <section className="workspace-controls reveal reveal-delay-2">
                        <div className="panel-card">
                            <div className="panel-card-header">
                                <h2 className="panel-title mb-1">Analysis Controls</h2>
                                <p className="panel-subtitle mb-0">Upload a file and configure your query.</p>
                            </div>
                            <div className="panel-card-body">
                                <form onSubmit={handleAnalyze}>
                                    <DocumentUpload file={file} setFile={setFile} loading={loading} />
                                    <QueryForm query={query} setQuery={setQuery} loading={loading} />
                                </form>

                                <div className="quick-query-wrap mt-3">
                                    <div className="quick-query-label">Quick Prompts</div>
                                    <div className="quick-query-list">
                                        {QUICK_QUERIES.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                className="quick-query-btn"
                                                onClick={() => setQuery(item)}
                                                disabled={loading}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="workspace-process-top reveal reveal-delay-1">
                        <AgentProcessPanel
                            loading={loading}
                            stages={processStages}
                            summary={processSummary}
                            error={error}
                        />
                    </section>

                     <section className="workspace-output reveal reveal-delay-2" ref={analysisRef}>
                        {error ? (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        ) : null}
                        <AnalysisResult
                            loading={loading}
                            result={result}
                            stages={processStages}
                            elapsedSeconds={elapsedSeconds}
                        />
                    </section>
                </section>
            </main>

            <footer className="app-footer">
                <div className="container-xl footer-inner">
                    <div className="footer-copy">Professional Links</div>
                    <div className="footer-socials" aria-label="Social links">
                        <a
                            className="footer-social-link"
                            href="http://deepakdigitalcraft.works/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Website"
                            title="Website"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm6.91 9h-3.06a15.77 15.77 0 0 0-1.02-4A8.03 8.03 0 0 1 18.91 11Zm-6.9-7a13.84 13.84 0 0 1 1.92 5H10.1a13.84 13.84 0 0 1 1.91-5ZM4.99 13h3.06a15.77 15.77 0 0 0 1.02 4 8.03 8.03 0 0 1-4.08-4Zm3.06-2H4.99a8.03 8.03 0 0 1 4.08-4 15.77 15.77 0 0 0-1.02 4ZM12.01 20a13.84 13.84 0 0 1-1.91-5h3.83a13.84 13.84 0 0 1-1.92 5Zm2.35-7H9.66a13.72 13.72 0 0 1 0-2h4.69a13.72 13.72 0 0 1 .01 2Zm.47 4a15.77 15.77 0 0 0 1.02-4h3.06a8.03 8.03 0 0 1-4.08 4Z" />
                            </svg>
                            <span>Website</span>
                        </a>

                        <a
                            className="footer-social-link"
                            href="https://www.linkedin.com/in/deepak-05dktopg/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="LinkedIn"
                            title="LinkedIn"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M6.94 8.5A1.56 1.56 0 1 1 6.9 5.37a1.56 1.56 0 0 1 .04 3.13ZM5.53 9.87h2.8V19h-2.8Zm4.56 0h2.68v1.25h.04a2.94 2.94 0 0 1 2.65-1.46c2.84 0 3.36 1.87 3.36 4.3V19H16V14.7c0-1.03-.02-2.35-1.43-2.35-1.43 0-1.64 1.12-1.64 2.28V19h-2.84Z" />
                            </svg>
                            <span>LinkedIn</span>
                        </a>

                        <a
                            className="footer-social-link"
                            href="https://github.com/deepak-05dktopG/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                            title="GitHub"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.8-.25.8-.56v-2.16c-3.25.71-3.94-1.57-3.94-1.57a3.1 3.1 0 0 0-1.3-1.72c-1.06-.72.08-.71.08-.71a2.46 2.46 0 0 1 1.8 1.21 2.5 2.5 0 0 0 3.4.98 2.5 2.5 0 0 1 .75-1.57c-2.6-.29-5.34-1.3-5.34-5.8a4.54 4.54 0 0 1 1.21-3.15 4.2 4.2 0 0 1 .11-3.1s.99-.31 3.25 1.2a11.2 11.2 0 0 1 5.92 0c2.26-1.51 3.24-1.2 3.24-1.2a4.2 4.2 0 0 1 .12 3.1 4.53 4.53 0 0 1 1.2 3.15c0 4.5-2.74 5.5-5.35 5.79a2.8 2.8 0 0 1 .8 2.17v3.22c0 .31.21.68.81.56A11.5 11.5 0 0 0 12 .5Z" />
                            </svg>
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;