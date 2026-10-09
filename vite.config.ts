import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { parse } from 'yaml'
import { rendreSemaine, rendreTheme } from './app/src/content/render.ts'

const racine = fileURLToPath(new URL('.', import.meta.url))

// Transforme les fichiers YAML de content/ en modules JSON au build.
// Les fichiers de semaine et de thème sont validés puis pré-rendus en HTML (Markdown, KaTeX, Shiki) :
// un contenu invalide fait échouer le build. Avec `?meta`, seul un résumé est exporté
// (pour les listes), le contenu complet étant chargé à la demande.
function yamlContenu(): Plugin {
  return {
    name: 'yaml-contenu',
    async transform(code, id) {
      const [fichier, requete] = id.replace(/\\/g, '/').split('?')
      if (!fichier.endsWith('.yaml')) return null
      let donnees: unknown = parse(code)
      const nom = fichier.slice(fichier.lastIndexOf('/content/') + 1)
      const rendre = /\/content\/[^/]+\/semaine-\d{2}\.yaml$/.test(fichier)
        ? rendreSemaine
        : /\/content\/[^/]+\/theme-[a-z0-9]+\.yaml$/.test(fichier)
          ? rendreTheme
          : null
      if (rendre) {
        const { fiches, quiz, ...u } = await rendre(donnees, nom)
        donnees =
          requete === 'meta'
            ? {
                ...u,
                nbFiches: fiches.length,
                nbNonVerifiees: fiches.filter((f) => !f.verifie).length,
                nbQuiz: quiz.length,
              }
            : { ...u, fiches, quiz }
      }
      return { code: `export default ${JSON.stringify(donnees)}`, map: null }
    },
  }
}

export default defineConfig({
  root: 'app',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    // Le serveur de dev ne sert que l'app, le contenu et les dépendances,
    // jamais les fichiers sources des cours.
    fs: {
      strict: true,
      allow: [`${racine}app`, `${racine}content`, `${racine}node_modules`],
    },
  },
  plugins: [
    yamlContenu(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Révision BA3',
        short_name: 'Révision',
        description: 'Fiches de révision des cours de BA3',
        lang: 'fr',
        display: 'standalone',
        start_url: './',
        background_color: '#f6f5f2',
        theme_color: '#2f4b7c',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
