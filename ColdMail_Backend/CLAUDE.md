# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic upgrade head          # Apply all migrations
alembic revision --autogenerate -m "description"  # Create new migration
alembic downgrade -1          # Roll back one migration
```

No test framework is configured in this project.

## Architecture

This is a **cold email outreach SaaS backend** — users connect their Gmail account via Google OAuth, send cold emails with AI-generated follow-up sequences, and the system automatically tracks replies and manages follow-up scheduling.

### Key Flows

**Authentication**: Google OAuth 2.0 → JWT cookies (`app_access_token` 30min, `app_refresh_token` 30 days). Token validation via `app/auth/dependencies.py:get_current_user`.

**Email Sending** (`POST /send-mail`): Validates recipient unsubscribe status → generates follow-ups via Azure OpenAI → encrypts body with Fernet → sends via Gmail API → stores `Mail` record → schedules `FollowUp` records.

**Follow-up Scheduling**: APScheduler cron (`send_due_followups`, every 2 min) polls for due `FollowUp` records and sends them via Gmail API. Two strategies: `standard` (preset delays: 2,4,7,11,16,22,30,40,55,75 days) or `every_N` (custom interval).

**Reply Detection**: APScheduler cron (`auto_reply_checker`, every 15 min) polls Gmail thread IDs for replies. On reply: updates `Mail.status` → `replied`, marks all pending `FollowUp` records as `blocked_by_reply`, creates a `Notification`.

**Campaigns**: CSV upload → multi-step validation pipeline (`app/campaign/validations/`) → creates bulk `Mail` records with template variable substitution.

### Data Encryption

All email bodies are encrypted at the application layer using Fernet. Each `User` record has an individual encryption key, itself encrypted with a `MASTER_KEY` env variable. Decryption happens at read time in inbox routes. See `app/helper/crypto_utils.py`.

### Background Jobs

Three APScheduler jobs are registered in `app/main.py`:
- `send_due_followups` — `app/home/sendmail/followup_sender.py`
- `auto_reply_checker` — `app/home/mailHelper/reply_tracker_cron.py`
- `push_scheduled_mails` — handles scheduled (future-dated) initial sends

### Module Structure

```
app/
├── main.py              # FastAPI app, router registration, APScheduler startup
├── models.py            # All SQLAlchemy models (User, Mail, FollowUp, Campaign, etc.)
├── database.py          # PostgreSQL session + connection pool
├── auth/                # Google OAuth, JWT, Gmail API client
├── helper/              # Fernet crypto utils, Azure OpenAI integration
├── home/
│   ├── sendmail/        # Send mail endpoint + follow-up generation/scheduling
│   └── mailHelper/      # Reply detection logic and cron
├── campaign/            # Campaign CRUD + CSV validation pipeline
├── inbox/               # Read mails/followups with decryption
└── utils/               # Unsubscribe flow, notifications
```

### Key Status Enums (in `app/models.py`)

`MailStatus`: `scheduled | sent | failed | blocked_by_reply | completed | replied | blocked_by_unsubscribe | stopped`

`CampaignStatus`: `draft | running | paused | completed`

### Environment Variables

Required in `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `JWT_SECRET`, `SECRET_KEY`, `MASTER_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_DEPLOYMENT_NAME`, `FRONTEND_BASE`

### Deployment

CI/CD via `.github/workflows/main_coldmaily-backend.yml` — pushes to `main` deploy to Azure Web App.
