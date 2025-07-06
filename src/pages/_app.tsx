import '../app/globals.css'
import type { AppProps } from 'next/app'
import type { ElectronStore, ElectronAPI } from '../types/electron'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electronStore?: ElectronStore;
  }
}