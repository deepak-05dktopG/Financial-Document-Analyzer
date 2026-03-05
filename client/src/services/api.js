const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const ANALYZE_PATH = import.meta.env.VITE_API_ANALYZE_PATH || "/analyze";

function buildAnalyzeUrl() {
    if (API_BASE_URL) {
        return `${API_BASE_URL}${ANALYZE_PATH}`;
    }

    // In Vite dev server, same-origin keeps requests routed through the dev proxy.
    if (import.meta.env.DEV) {
        return ANALYZE_PATH;
    }

    // For production previews without a reverse proxy, default to local backend.
    return `http://127.0.0.1:8000${ANALYZE_PATH}`;
}

export async function analyzeFinancialDocument({ file, query }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("query", query);

    const response = await fetch(buildAnalyzeUrl(), {
        method: "POST",
        body: formData,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
        const errorMessage =
            (typeof payload === "object" && payload && payload.detail) ||
            (typeof payload === "string" && payload) ||
            `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
    }

    return payload;
}