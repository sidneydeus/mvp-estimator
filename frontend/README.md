# Frontend (React)

## Rodar em desenvolvimento

1. Suba o backend em `http://localhost:3000`
2. No diretório `frontend/`:
   - `npm install`
   - `npm run dev`

O Vite faz proxy de `/api` e `/health` para `http://localhost:3000`.
O endpoint usado pelo frontend é `POST /estimate`.

## Docker Compose

Quando rodando via `docker-compose`, o frontend usa `VITE_API_TARGET=http://api:3000` para proxy interno entre containers.
Se preferir evitar proxy (ex.: para debugar), defina `VITE_API_BASE_URL=http://localhost:3000` e o browser chamará a API diretamente.
