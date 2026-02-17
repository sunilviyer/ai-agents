"""
Constants for Gita Guide Agent

Agent Specifications:
- Slug: gita-guide
- Color: Saffron (#C1121F)
- Type: Conversational Expert (LIVE)
- Workflow: 6 conversational steps
- Target: ≤5 seconds execution time
"""

# Agent Metadata
AGENT_SLUG = "gita-guide"
AGENT_NAME = "Sage"  # Friendly name matching UI
AGENT_COLOR = "#C1121F"  # Saffron/Red

# LLM Configuration
MODEL_NAME = "claude-3-haiku-20240307"  # Fast model for conversational responses
MAX_TOKENS = 2000  # Sufficient for spiritual guidance responses
TEMPERATURE = 0.7  # Balanced creativity for spiritual interpretation

# Workflow Steps
WORKFLOW_STEPS = [
    {
        "number": 1,
        "name": "Parse Question",
        "type": "initialization",
        "description": "Analyze the user's spiritual question to identify key themes and concepts"
    },
    {
        "number": 2,
        "name": "Search Verses",
        "type": "search",
        "description": "Find relevant verses from the Bhagavad Gita knowledge base"
    },
    {
        "number": 3,
        "name": "Extract Context",
        "type": "analysis",
        "description": "Understand the philosophical context and related teachings"
    },
    {
        "number": 4,
        "name": "Synthesize Answer",
        "type": "synthesis",
        "description": "Formulate a comprehensive answer based on Gita wisdom"
    },
    {
        "number": 5,
        "name": "Provide Guidance",
        "type": "guidance",
        "description": "Offer practical spiritual guidance and actionable insights"
    },
    {
        "number": 6,
        "name": "Format Response",
        "type": "formatting",
        "description": "Structure the final response with verses and explanations"
    }
]

# Knowledge Base
KNOWLEDGE_BASE_PATH = "knowledge_base/gita_verses.json"

# Key Philosophical Concepts (for reference)
KEY_CONCEPTS = [
    "Dharma", "Karma Yoga", "Bhakti Yoga", "Jnana Yoga", "Dhyana Yoga",
    "Atman", "Brahman", "Maya", "Gunas", "Sthitaprajna",
    "Nishkama Karma", "Yoga", "Svadharma", "Moksha", "Prakriti",
    "Sankhya", "Tyaga", "Ishvara", "Samsara", "Vishvarupa"
]

# Common Themes
COMMON_THEMES = [
    "duty", "action", "devotion", "knowledge", "meditation",
    "detachment", "surrender", "faith", "renunciation", "liberation",
    "soul", "divine nature", "cosmic form", "self-realization",
    "equanimity", "karma", "wisdom", "peace"
]
