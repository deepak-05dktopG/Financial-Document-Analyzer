function QueryForm({ query, setQuery, loading }) {
    return (
        <>
            <div className="mb-3">
                <label htmlFor="queryInput" className="form-label field-label">
                    Analysis Query
                </label>
                <textarea
                    id="queryInput"
                    className="form-control input-soft"
                    rows={4}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Analyze growth, profitability, risks, and investment implications."
                    disabled={loading}
                />
                <div className="query-support mt-2 d-flex justify-content-between">
                    <span>Tip: Ask for metrics, risks, and action points in one prompt.</span>
                    <span>{query.length} chars</span>
                </div>
            </div>
            <button type="submit" className="btn btn-run" disabled={loading}>
                {loading ? "Running Analysis..." : "Run Full Analysis"}
            </button>
        </>
    );
}

export default QueryForm;