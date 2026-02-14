# Article Editor Agent

**Agent Slug:** `article-editor`
**Agent Color:** Purple
**Type:** Content Enhancement & SEO Optimization

## Description

The Article Editor Agent enhances written content through a 7-step AI-powered workflow. It improves readability, optimizes for SEO, enhances engagement, and provides actionable recommendations for better content performance.

## Features

- **Content Analysis**: Analyzes article structure, readability, and clarity
- **SEO Optimization**: Optimizes content for target keywords and search visibility
- **Tone Adjustment**: Adjusts writing tone to match target audience
- **Readability Enhancement**: Improves sentence structure and clarity
- **Engagement Optimization**: Enhances content to increase reader engagement
- **Reference Enhancement**: Adds relevant citations and fact-checking (optional)
- **Comprehensive Reporting**: Provides detailed before/after analysis

## Workflow Steps

1. **Parse Input** - Analyze article and enhancement requirements
2. **Content Analysis** - Assess current readability and structure
3. **SEO Analysis** - Evaluate keyword usage and search optimization
4. **Research References** - Find supporting citations (optional)
5. **Enhance Content** - Apply improvements and optimizations
6. **Quality Check** - Validate enhancements and scoring
7. **Generate Report** - Create comprehensive enhancement report

## Installation

1. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
- `ANTHROPIC_API_KEY` - Required for Claude AI
- `TAVILY_API_KEY` - Optional for reference searching

## Usage

### Basic Enhancement

```bash
python3 agent.py --article-file article.txt
```

### With SEO Keywords

```bash
python3 agent.py --article-file article.txt --keywords "AI" "machine learning" "automation"
```

### Custom Tone and Goals

```bash
python3 agent.py \
  --article-file article.txt \
  --tone casual \
  --goals readability seo engagement
```

## Command-Line Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `--article-file` | Yes | - | Path to article text file |
| `--keywords` | No | [] | Target SEO keywords (space-separated) |
| `--tone` | No | professional | Desired tone (professional, casual, technical, etc.) |
| `--goals` | No | [readability, seo, engagement] | Enhancement goals |

## Output

The agent generates a JSON case study in the `output/` directory containing:
- Original and enhanced article text
- List of improvements made
- SEO score (0-100)
- Readability score (0-100)
- Recommendations for further improvement
- Complete execution trace of all workflow steps

## Example

```bash
# Create a sample article
echo "This is a sample article about AI. AI is great." > sample.txt

# Enhance the article
python3 agent.py --article-file sample.txt --keywords "artificial intelligence"
```

## Architecture

- `agent.py` - Main entry point with CLI
- `utils/models.py` - Pydantic data models
- `utils/steps.py` - Workflow step functions
- `utils/constants.py` - Agent configuration
- `output/` - Generated case study JSON files

## License

Part of the AI Agents Portfolio project.
