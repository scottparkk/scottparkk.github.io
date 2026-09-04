---
title: "Nameify"
type: "technical"
year: 2024
summary: "Nameify is an Acrostic Poem Generator that reads your Spotify Listening data and builds an acrostic poem of your name with your most listened to artists."
stack: ["React 18", "TypeScript", "Vite 6", "three.js", "@react-three/fiber", "Spotify Web API", "PKCE", "Vercel"]
tags: ["react", "typescript", "threeJS", "web-development", "spotify-api"]
role: "Designer & Developer"
cover: "/images/projects/technical/Nameify/landing.webp"
coverAlt: "Nameify landing page with a voxel cat wearing headphones"
gallery:
  - src: "/images/projects/technical/Nameify/landing.webp"
    alt: "Nameify landing page with a voxel cat wearing headphones on a lit platform"
    caption: "Home — the pitch, a Spotify login, and a sample anyone can open. The cat is a voxel model you can drag to spin"
  - src: "/images/projects/technical/Nameify/auth.webp"
    alt: "Spotify authorization screen listing the read-only scopes Nameify asks for"
    caption: "Spotify login — Authorization Code with PKCE, read-only scopes, no client secret and no backend"
  - src: "/images/projects/technical/Nameify/poem.webp"
    alt: "Acrostic of the name NAMEIFY, one artist per letter, each tagged with its source and rank"
    caption: "Poem generation — one artist per letter, badged with the list it came from. Retype the name to recompose"
links:
  live: "https://nameify-seven.vercel.app"
draft: false
order: 400
---

Nameify is an acrostic poem generator. It reads your Spotify listening data and spells your name down the page, one top artist per letter.

It pools artists from your top artists across all three Spotify time ranges, the artists on your top tracks, everyone you follow, and your recent plays. Each one is scored by where it came from and how high it ranked, so an all-time favourite beats something you played once last week. Every letter then takes the best-scoring artist starting with it, and the badge next to the name shows which list it came from. Leading articles and accents are ignored while matching, so "The Strokes" counts for S and "Ólafur Arnalds" for O. If nothing in your history starts with a letter, it searches Spotify's catalogue instead and marks the result as a discovery.

## Built with

- **React 18 + TypeScript + Vite 6**
- **three.js via `@react-three/fiber`** — the cat scene, code-split so the poem page never loads it
- **Spotify Web API, Authorization Code + PKCE** — no client secret, no backend, tokens stay in the browser

## Logging in

Spotify changed its developer API policy: new apps stay in development mode, where only accounts explicitly added to the app's allowlist can sign in. If you are not on it, the login will fail. Use demo mode instead — "See a sample" on the landing page builds the same acrostic from fixed example data and needs no account.
