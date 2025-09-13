import { USSDSimulator } from './components/USSDSimulator';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="min-h-screen bg-background from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">USSD Simulator</h1>
          <p className="">Test your USSD applications with ease</p>
        </div>
        <USSDSimulator />
      </div>
      <Toaster />
    </div>
  );
}

export default App;