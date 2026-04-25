This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# Clone the repo
git clone https://github.com/your-org/toolrelay
cd toolrelay

# Install frontend dependencies
cd frontend && npm install

# Install function dependencies
cd ../functions && pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your Anthropic API key and GCP project ID

# Run locally
npm run dev          # Frontend
functions-framework  # Cloud Functions emulator
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=
GCP_PROJECT_ID=
FIRESTORE_DATABASE=
FIREBASE_AUTH_DOMAIN=
```

---

## Demo Scenario

1. User types: _"Build me a GitHub assistant that summarizes repos"_
2. Intent agent configures a server with GitHub + summarization tools
3. Tool call fires → first server returns a raw file list
4. Validator flags it as not a summary
5. Router switches to backup server
6. Clean summary returned
7. Dashboard updates live with the full decision trail

---

## Built At

[Open Loop] · [25/4/2026] · Team [OpenSHA]
