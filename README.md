# The Thread Sutra

Monorepo starter for `thethreadsutra.com`, a garments e-commerce marketplace that lists and sells products across Amazon, Flipkart, Myntra, quick-commerce channels, and owned storefronts.

## Stack

- Web: Next.js, Tailwind CSS
- API: NestJS, MongoDB via Mongoose
- Mobile: React Native with Expo

## Apps

- `apps/web`: customer-facing marketplace web app
- `apps/api`: NestJS catalog API
- `apps/mobile`: React Native marketplace app

## Getting Started

```bash
npm install
cp apps/api/.env.example apps/api/.env
docker compose up -d mongodb
npm run dev:api
npm run dev:web
npm run dev:mobile
```

The web app expects the API at `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:4000`.
The mobile app expects `EXPO_PUBLIC_API_URL`, defaulting to `http://localhost:4000`.
