# Fraud Trends Investigator Agent

An AI-powered research agent that investigates insurance fraud trends using Claude AI and Tavily web search. Part of the AI Agents Portfolio project showcasing agentic AI patterns.

## Overview

The Fraud Trends Investigator executes a transparent 6-step workflow to research and synthesize fraud trends across the insurance industry:

1. **Plan Research Strategy** - Generate targeted search queries
2. **Search Industry Sources** - Gather industry reports and articles
3. **Search Regulatory Sources** - Query NAIC, FBI, state regulators
4. **Search Academic Sources** - Find peer-reviewed research
5. **Extract Key Findings** - Classify trends with domain-specific attributes
6. **Synthesize Report** - Generate executive summary and recommendations

## Features

- **Transparent Execution**: Every step logged with inputs, outputs, and timing
- **Domain Classifications**: Fraud types, severity levels, detection difficulty
- **Multi-Source Research**: Industry, regulatory, and academic sources
- **Type-Safe Output**: Pydantic validation matching TypeScript schema
- **Error Resilience**: Graceful handling of API failures

## Project Structure

```
agents/fraud-trends/
├── agent.py              # Main agent script with CLI
├── utils/
│   ├── __init__.py       # Package initialization
│   ├── models.py         # Pydantic models (Epic 2)
│   ├── steps.py          # 6-step workflow functions (Epic 3)
│   └── constants.py      # Immutable constants (Epic 3)
├── output/               # Generated JSON case studies
├── requirements.txt      # Python dependencies (Story 1.3)
├── .env                  # Environment variables (gitignored)
└── README.md             # This file
```

## Prerequisites

- **Python**: 3.10 or higher
- **API Keys**:
  - Anthropic API key (Claude AI)
  - Tavily API key (web search)

## Setup

### 1. Install Dependencies

```bash
cd agents/fraud-trends
pip install -r requirements.txt
```

Dependencies include:
- `langchain>=0.3.0` - AI framework
- `langchain-anthropic>=0.2.0` - Claude integration
- `tavily-python>=0.5.0` - Web search API
- `pydantic>=2.5.0` - Data validation
- `python-dotenv>=1.0.0` - Environment management

### 2. Configure API Keys

Create a `.env` file in `agents/fraud-trends/`:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your actual API keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Where to get API keys:**
- **Anthropic**: https://console.anthropic.com/ (sign up for Claude API)
- **Tavily**: https://tavily.com/ (sign up for search API)

**Important**: Never commit the `.env` file to git. It is already in `.gitignore`.

## Usage

### Basic Usage

```bash
python agent.py \
  --topic "Auto Insurance Fraud" \
  --regions "US,CA" \
  --time-range "2024-2025"
```

### With Focus Areas

```bash
python agent.py \
  --topic "Synthetic Identity Fraud" \
  --regions "US,UK" \
  --time-range "2024" \
  --focus-areas "detection,prevention,technology"
```

### Get Help

```bash
python agent.py --help
```

## Example Topics

1. **Auto Insurance Fraud Trends (2024-2025)**
2. **Property Insurance Fraud After Climate Events**
3. **Digital and Synthetic Identity Fraud**
4. **Organized Fraud Rings and Schemes**
5. **Technology and AI in Fraud Detection**

## Output Format

Generated case studies are saved to `output/` as JSON files with:

- **Input Parameters**: Topic, regions, time range, focus areas
- **Output Results**: Trends, findings, recommendations, confidence ratings
- **Execution Trace**: All 6 steps with timing and details

Example: `output/case_study_20250209_123045.json`

## Implementation Status

- ✅ **Story 1.2**: Project structure and skeleton (Current)
- ⏳ **Story 1.3**: Python dependencies installation
- ⏳ **Story 1.5**: Environment variable configuration
- ⏳ **Epic 2**: Pydantic models and type system
- ⏳ **Epic 3**: Full 6-step workflow implementation
- ⏳ **Epic 4**: Database import and validation

## Architecture

This agent is part of a larger system:
- **Agent Layer** (Python): Research and generate case studies
- **Database Layer** (PostgreSQL): Store case studies with universal schema
- **API Layer** (Next.js): Expose case studies via REST API
- **Frontend Layer** (Next.js): Display agent work (Phase 3)

## Development Notes

- **Type Safety**: Pydantic models match TypeScript types exactly
- **Execution Transparency**: Every step logged for portfolio demonstration
- **Error Handling**: API failures don't crash the agent
- **Code Quality**: Pylint score ≥9.0/10.0 required
- **Security**: No API keys in output files or git history

## Troubleshooting

### Missing API Keys

```
Error: ANTHROPIC_API_KEY not found in environment
```

**Solution**: Ensure `.env` file exists with valid API keys.

### Import Errors

```
ModuleNotFoundError: No module named 'langchain'
```

**Solution**: Run `pip install -r requirements.txt`

### Permission Errors

```
PermissionError: [Errno 13] Permission denied: 'output/'
```

**Solution**: Ensure `output/` directory exists and is writable.

## Contributing

This is a portfolio project demonstrating AI agent patterns. Future enhancements:
- Additional fraud types and classifications
- More sophisticated source quality scoring
- Integration with additional regulatory data sources
- Real-time fraud monitoring capabilities

## License

This project is part of the AI Agents Portfolio. See LICENSE file for details.

## Contact

For questions or feedback about this agent implementation, see the main project README.

---

**Status**: Phase 1 MVP - Fraud Trends Investigator (proof of concept)
**Last Updated**: 2025-02-09
