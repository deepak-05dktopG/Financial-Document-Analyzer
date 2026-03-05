import os
from dotenv import load_dotenv
from crewai import Agent, LLM
from tools import search_tool, read_data_tool, analyze_investment_tool, create_risk_assessment_tool

load_dotenv()

### 1. Switch to a Higher TPM Model
# llama-3.3-70b is powerful but has a much larger "token bucket" on Groq
llm_instance = LLM(
    model="groq/meta-llama/llama-4-scout-17b-16e-instruct", 
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
    max_tokens=700
)

### 2. Group Tools
financial_tools = [read_data_tool, analyze_investment_tool, create_risk_assessment_tool]
if search_tool is not None:
    financial_tools.append(search_tool)

### 3. Optimized Agents (Lower RPM to avoid Rate Limits)
# We set max_rpm lower because multi-agent crews hit the API very fast
financial_analyst = Agent(
    role="Senior Financial Analyst",
    goal=(
        "Deliver an interview-grade financial brief from {file_path} that directly answers {query}. "
        "Prioritize signal over noise, quantify trends, and explain why each insight matters for decision-making."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "You are a former equity research lead known for turning dense filings into crisp boardroom narratives. "
        "Your style is precise, confident, and evidence-first. Never invent numbers. "
        "If a metric is missing, state it clearly and proceed with bounded assumptions."
    ),
    tools=financial_tools,
    llm=llm_instance,
    max_iter=1,
    allow_delegation=False
)

verifier = Agent(
    role="Financial Document Verifier",
    goal=(
        "Act as the quality gate: verify whether {file_path} is a valid financial document and can support reliable analysis."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "You are a diligence specialist for institutional workflows. "
        "You quickly classify document type, detect low-quality or irrelevant inputs, and provide a clear go/no-go verdict with evidence."
    ),
    tools=financial_tools,
    llm=llm_instance,
    max_iter=1,
    allow_delegation=False
)

investment_advisor = Agent(
    role="Investment Advisor",
    goal=(
        "Transform analysis from {file_path} into decision-ready investment guidance tied to {query}, "
        "including upside, downside, and investor suitability."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "You are a portfolio strategy advisor presenting to an investment committee. "
        "You balance conviction with discipline: compare opportunities, highlight trade-offs, "
        "and frame recommendations by risk-adjusted return potential."
    ),
    tools=financial_tools,
    llm=llm_instance,
    max_iter=1,
    allow_delegation=False
)

risk_assessor = Agent(
    role="Risk Assessment Specialist",
    goal=(
        "Build a high-clarity risk register from evidence in {file_path} for {query}, "
        "ranking what can hurt outcomes most and what to monitor early."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "You are an enterprise risk strategist trusted for pre-mortem analysis. "
        "You think in scenarios, surface hidden fragilities, and convert risk signals into practical mitigation actions."
    ),
    tools=financial_tools,
    llm=llm_instance,
    max_iter=1,
    allow_delegation=False
)