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

## Deploying on Render

This repo includes a Render Blueprint at `render.yaml` with two Node web services:

- `thethreadsutra-api`: NestJS API
- `thethreadsutra-web`: Next.js web app

### Steps

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Render, choose **New > Blueprint**.
3. Select this repository.
4. Render will detect `render.yaml` and create both services.
5. Add the required secret environment variables when prompted.

### Required Render Environment Variables

For `thethreadsutra-api`:

```bash
MONGODB_URI=<your MongoDB Atlas connection string>
FLIPKART_APP_ID=<DMILLS Global Flipkart app id>
FLIPKART_APP_SECRET=<DMILLS Global Flipkart app secret>
FLIPKART_SELLER_ID=<DMILLS Global seller id>
FLIPKART_LOCATION_ID=<Flipkart dispatch location id>
```

For `thethreadsutra-web`:

```bash
NEXT_PUBLIC_API_URL=https://thethreadsutra-api.onrender.com
```

If Render changes the service names, update:

- API `CORS_ORIGIN` to the actual web URL
- Web `NEXT_PUBLIC_API_URL` to the actual API URL

### Render Commands

API:

```bash
npm run render:build:api
npm run render:start:api
```

Web:

```bash
npm run render:build:web
npm run render:start:web
```
