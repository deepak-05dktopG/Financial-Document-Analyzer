## Importing libraries and files
from crewai import Task
from agents import financial_analyst, verifier, investment_advisor, risk_assessor
# Import the actual tool functions we defined in tools.py
from tools import read_data_tool

## 1. Verification Task (The gatekeeper)
verification = Task(
    description=(
        "Run a fast but rigorous pre-analysis gate on {file_path}. "
        "Confirm readability, classify likely document type (earnings release, annual report, statement pack, etc.), "
        "and assess whether the content is sufficient for credible financial analysis. "
        "If invalid, non-financial, or too weak in quality, return a direct rejection reason with proof."
    ),
    expected_output=(
        "Validation verdict with:\n"
        "- Gate decision: PASS or FAIL\n"
        "- is_financial_document: true/false\n"
        "- confidence: low/medium/high\n"
        "- document_type\n"
        "- evidence summary (2-4 lines)\n"
        "- failure_reason (required only when FAIL)"
    ),
    agent=verifier,
    tools=[read_data_tool], # FIXED: Use the function name directly
    async_execution=False
)

## 2. Analysis Task
analyze_financial_document = Task(
    description=(
        "Produce a high-impact financial narrative from {file_path} that directly answers: {query}.\n"
        "Use only verifiable document evidence, cite the metric or statement behind every major claim, "
        "and keep the reasoning transparent.\n"
        "Focus on business quality, financial momentum, profitability, cash generation, and balance-sheet strength.\n"
        "When data is incomplete, explicitly list assumptions and their confidence."
    ),
    expected_output=(
        "Interview-ready analysis with sections:\n"
        "- Executive Summary (3-5 crisp lines)\n"
        "- Financial Scorecard (key metrics, trend direction, and interpretation)\n"
        "- Query-Focused Answer (direct response to {query})\n"
        "- Evidence & Assumptions (what is known vs assumed)\n"
        "- Limitations (data gaps that could change the conclusion)"
    ),
    agent=financial_analyst,
    tools=[read_data_tool], # FIXED: Use the function name directly
    async_execution=False,
)

## 3. Investment Analysis Task
investment_analysis = Task(
    description=(
        "Using prior analysis context for {file_path}, craft a committee-style investment view for: {query}.\n"
        "Do not re-read the full document unless absolutely necessary; build on extracted evidence.\n"
        "Present a balanced thesis with return drivers, valuation posture, and downside controls.\n"
        "Avoid hype, guarantees, or fabricated figures."
    ),
    expected_output=(
        "Decision memo section with:\n"
        "- Investment Thesis (why this may work)\n"
        "- Counter-Thesis (what can break it)\n"
        "- Suitability Matrix (low/medium/high risk profiles)\n"
        "- Scenario Outlook (base/upside/downside with key triggers)\n"
        "- Recommendation Stance: Accumulate / Hold / Avoid with short rationale\n"
        "- Compliance note: informational only, not personalized financial advice"
    ),
    agent=investment_advisor,
    tools=[],
    async_execution=False,
)

## 4. Risk Assessment Task
risk_assessment = Task(
    description=(
        "Create an executive risk register using prior analysis context for {file_path} and query: {query}.\n"
        "Identify financial, liquidity, operational, governance, market, and concentration risks.\n"
        "Use existing evidence first; avoid unnecessary full-document re-reads.\n"
        "Rank risks by likelihood and impact, then attach concrete monitoring signals and mitigation actions."
    ),
    expected_output=(
        "Structured risk register with:\n"
        "- Top risks ranked by severity (Critical/High/Medium/Low)\n"
        "- Risk rationale (why it matters to outcomes)\n"
        "- Early warning indicators (specific metrics/events to watch)\n"
        "- Mitigation playbook (preventive and contingency actions)\n"
        "- Residual risk note after mitigation"
    ),
    agent=risk_assessor,
    tools=[],
    async_execution=False,
)