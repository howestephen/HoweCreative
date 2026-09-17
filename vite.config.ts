import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

import { resolveContactBuildConfig } from './src/app/lib/contact-build-config'

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const { contactTransport, publicEmailAccessKey } = resolveContactBuildConfig({
    ...env,
    ...process.env,
  })

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      // Free-plan Web3Forms keys are public form identifiers. Server transport
      // deliberately omits the key and uses WEB3FORMS_SERVER_ACCESS_KEY in API.
      'import.meta.env.VITE_CONTACT_TRANSPORT': JSON.stringify(contactTransport),
      'import.meta.env.VITE_EMAIL_ACCESS_KEY': JSON.stringify(publicEmailAccessKey),
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'three'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', 'three/addons/loaders/GLTFLoader.js', 'three/addons/environments/RoomEnvironment.js'],
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
    build: {
      rollupOptions: {
        output: {
          manualChunks: isSsrBuild ? undefined : {
            icons: ['react-icons', 'lucide-react'],
          },
        },
      },
    },
  }
})
