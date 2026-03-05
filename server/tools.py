import os
from dotenv import load_dotenv
from crewai_tools import SerperDevTool
from crewai.tools import tool # The decorator lives here in your version
from pypdf import PdfReader

load_dotenv()

DEFAULT_PDF_PATH = os.getenv("DEFAULT_PDF_PATH", "data/sample.pdf")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "").strip()
PDF_CHAR_LIMIT = int(os.getenv("PDF_CHAR_LIMIT", "9000"))

# Creating search tool
search_tool = SerperDevTool() if SERPER_API_KEY else None

# --- CUSTOM TOOLS START HERE --- 

@tool("read_data_tool")
def read_data_tool(path: str):
    """
    Reads and extracts text from a PDF financial document.
    Trims content to stay within model token-per-minute constraints.
    """
    if not path.lower().endswith('.pdf'):
        return "Error: This tool only supports PDF files. Please convert your .docx file to .pdf."
    
    if not path:
        path = DEFAULT_PDF_PATH

    if not os.path.exists(path):
        return f"Error: Financial document not found at path: {path}"

    try:
        reader = PdfReader(path)
        full_report = ""
        for page in reader.pages:
            content = page.extract_text() or ""
            content = " ".join(content.split())
            if content.strip():
                full_report += content + "\n"

        if not full_report.strip():
            return "Error: No readable text found in the financial document."

        # 1 token is roughly 4 characters. Keep extracted payload compact
        # so multi-step crews do not exceed provider TPM limits.
        char_limit = PDF_CHAR_LIMIT
        if len(full_report) > char_limit:
            return full_report[:char_limit] + "\n\n[SYSTEM NOTE: Document truncated to fit API token limits.]"
            
        return full_report.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

@tool("analyze_investment_tool")
def analyze_investment_tool(financial_document_data: str):
    """
    Prepares extracted financial document text for investment analysis.
    """
    if not financial_document_data:
        return "No financial document data provided for investment analysis."

    # Allow callers to pass either raw text or a PDF path.
    if isinstance(financial_document_data, str):
        candidate = financial_document_data.strip()
        if candidate.lower().endswith(".pdf") and os.path.exists(candidate):
            extracted = read_data_tool(candidate)
            if isinstance(extracted, str) and extracted.startswith("Error:"):
                return extracted
            return extracted

    return str(financial_document_data).strip()

@tool("create_risk_assessment_tool")
def create_risk_assessment_tool(financial_document_data: str):
    """
    Prepares extracted financial document text for risk assessment.
    """
    if not financial_document_data:
        return "No financial document data provided for risk assessment."

    # Allow callers to pass either raw text or a PDF path.
    if isinstance(financial_document_data, str):
        candidate = financial_document_data.strip()
        if candidate.lower().endswith(".pdf") and os.path.exists(candidate):
            extracted = read_data_tool(candidate)
            if isinstance(extracted, str) and extracted.startswith("Error:"):
                return extracted
            return extracted

    return str(financial_document_data).strip()