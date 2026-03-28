import AppErrorBoundary from './app/routing/AppErrorBoundary'
import AppRouter from './app/routing/AppRouter'

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  )
}
