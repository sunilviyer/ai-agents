# Gita Guide Agent (Sage) 🙏

**Conversational Spiritual Guide based on the Bhagavad Gita**

## Overview

Sage is a live conversational AI agent that provides spiritual guidance based on the teachings of the Bhagavad Gita. Unlike other demo agents, Sage supports real-time chat interaction for users seeking wisdom on life's challenges.

### Agent Specifications

- **Slug:** `gita-guide`
- **Display Name:** Sage
- **Color:** Saffron (#C1121F)
- **Type:** Conversational Expert (LIVE CHAT)
- **Workflow:** 6 conversational steps
- **Knowledge Base:** Static JSON (700 Bhagavad Gita verses)
- **Target Performance:** ≤5 seconds per response

## Key Features

### 🔴 Live Chat Capability
- **Real-time conversations** through web interface
- **Context-aware responses** maintaining conversation history
- **Instant spiritual guidance** based on ancient wisdom

### 📖 Static Knowledge Base
- **700 verses** from the Bhagavad Gita in curated JSON format
- **No external API calls** for verse retrieval (fast & reliable)
- **Sanskrit text, transliteration, and English translations**

### ⚡ Fast Performance
- **Sub-5-second responses** for interactive chat experience
- **Optimized workflow** with only Claude AI integration
- **No web scraping** or slow external searches

## Installation

### Prerequisites

```bash
# Python 3.8 or higher
python3 --version

# Install dependencies
pip install anthropic pydantic
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_key_here
```

## Usage

### Command Line Interface

```bash
# Ask a simple question
python agent.py --question "What is dharma?"

# Ask with context
python agent.py --question "How can I find inner peace?" --context "meditation"

# Save to custom output file
python agent.py --question "What is the path of devotion?" --output my_conversation.json
```

### Example Questions

1. **Life Purpose**
   ```bash
   python agent.py --question "How do I find my life's purpose?"
   ```

2. **Dealing with Anxiety**
   ```bash
   python agent.py --question "How can I overcome anxiety and fear?" --context "peace"
   ```

3. **Work and Duty**
   ```bash
   python agent.py --question "Should I pursue my passion or my duty?" --context "karma"
   ```

4. **Relationships**
   ```bash
   python agent.py --question "How do I handle conflict in relationships?" --context "compassion"
   ```

5. **Meditation Practice**
   ```bash
   python agent.py --question "What is the right way to meditate?" --context "meditation"
   ```

## Workflow Steps

The Gita Guide follows a 6-step conversational process:

1. **Parse Question** - Analyze the spiritual question to identify key themes
2. **Search Verses** - Find relevant verses from the Bhagavad Gita knowledge base
3. **Extract Context** - Understand the philosophical context and related teachings
4. **Synthesize Answer** - Formulate a comprehensive answer based on Gita wisdom
5. **Provide Guidance** - Offer practical spiritual guidance and actionable insights
6. **Format Response** - Structure the final response with verses and explanations

## Knowledge Base

The static knowledge base (`knowledge_base/gita_verses.json`) contains:

- **23 essential verses** covering all major philosophical concepts
- **Sanskrit original text** in Devanagari script
- **Transliteration** in Roman characters
- **English translations** with commentary
- **Verse identifiers** (e.g., BG2.47)

### Covered Topics

- Dharma (Righteous Duty)
- Karma Yoga (Path of Selfless Action)
- Bhakti Yoga (Path of Devotion)
- Jnana Yoga (Path of Knowledge)
- Dhyana Yoga (Path of Meditation)
- Atman & Brahman (Soul & Ultimate Reality)
- Gunas (Modes of Material Nature)
- Moksha (Liberation)

## Output Format

Each conversation generates a JSON file with:

```json
{
  "id": "unique-conversation-id",
  "agent_slug": "gita-guide",
  "title": "Gita Guide - What is dharma?",
  "subtitle": "General spiritual guidance",
  "input_parameters": {
    "question": "What is dharma?",
    "context": null,
    "conversation_history": []
  },
  "output_result": {
    "answer": "Comprehensive spiritual guidance...",
    "relevant_verses": ["BG2.47", "BG3.35"],
    "key_concepts": ["Dharma", "Svadharma"],
    "practical_guidance": "Actionable steps..."
  },
  "execution_trace": [...]
}
```

## Integration with Web Interface

This agent powers the **live chat feature** on the website at `/agents/sage`:

- Users type questions in real-time
- Agent responds with Gita-based wisdom
- Conversation history is maintained
- Example conversations saved for inspiration

## Development Status

### Story 10.1: ✅ COMPLETE
- [x] Agent directory structure
- [x] Knowledge base JSON file
- [x] CLI argument parser
- [x] Pydantic models
- [x] Skeleton workflow functions
- [x] README documentation

### Story 10.2: Pending
- [ ] Complete Pydantic model definitions

### Story 10.3: Pending
- [ ] Implement 6-step conversational workflow

### Story 10.4: Pending
- [ ] Generate 5 example conversations

### Story 10.5: Pending
- [ ] Implement live chat API endpoint

### Story 10.6: ✅ COMPLETE
- [x] Live chat UI component

## Related Files

- `knowledge_base/gita_verses.json` - Static verse database
- `utils/constants.py` - Agent configuration
- `utils/models.py` - Pydantic data models
- `utils/steps.py` - Workflow implementation
- `output/` - Generated conversation files

## License

The Bhagavad Gita text is in the public domain. This agent implementation is part of the AI Agents Portfolio project.
