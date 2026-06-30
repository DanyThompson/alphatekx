#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/alphatekx"
cd "$APP_DIR"

if [ ! -f .env ]; then
  cat > .env <<'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_placeholder
ALPHATekX_API_KEY=alpha-tekx-enterprise-key
ALPHATekX_API_KEYS=
EOF
  echo "Created a starter .env file. Edit it before continuing."
fi

sudo docker-compose down --remove-orphans || true
sudo docker-compose up -d --build
sudo docker-compose ps
