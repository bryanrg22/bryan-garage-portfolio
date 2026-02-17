import { Suspense } from 'react'
import GarageScene from './components/Scene/GarageScene'
import ErrorBoundary from './components/ErrorBoundary'
import TopBar from './components/UI/TopBar'
import InfoPanel from './components/UI/InfoPanel'
import SpotifyPlayer from './components/UI/SpotifyPlayer'
import HintText from './components/UI/HintText'
import BackButton from './components/UI/BackButton'
import LoadingScreen from './components/UI/LoadingScreen'
import MobileTabBar from './components/UI/MobileTabBar'
import RotatePrompt from './components/UI/RotatePrompt'

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-garage-dark">
      <p className="font-serif text-lg text-golden/60">Loading scene...</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-garage-dark">
      <ErrorBoundary>
        <Suspense fallback={<SceneFallback />}>
          <GarageScene />
        </Suspense>
      </ErrorBoundary>

      {/* UI overlays — pointer-events-none on wrapper, pointer-events-auto on interactive children */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <TopBar />
        <BackButton />
        <InfoPanel />
        <SpotifyPlayer />
        <HintText />
        <MobileTabBar />
      </div>

      <LoadingScreen />
      <RotatePrompt />
    </div>
  )
}
