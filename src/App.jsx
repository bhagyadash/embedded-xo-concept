import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import StepToday from './steps/StepToday.jsx';
import StepEmbedded from './steps/StepEmbedded.jsx';
import StepIndustry from './steps/StepIndustry.jsx';
import StepAfter from './steps/StepAfter.jsx';
import SourcesPage from './steps/SourcesPage.jsx';

const ROUTES = [
  { id: 'today', n: 1, label: 'Today' },
  { id: 'embedded', n: 2, label: 'Embedded checkout' },
  { id: 'industry', n: 3, label: 'Industry patterns' },
  { id: 'after', n: 4, label: 'After booking' },
  { id: 'sources', n: null, label: 'Real vs. assumed' },
];

const routeFromHash = () => {
  const id = window.location.hash.replace('#/', '');
  return ROUTES.some((r) => r.id === id) ? id : 'today';
};

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [cart, setCart] = useState({});
  const [plan, setPlan] = useState('full');
  const [credit, setCredit] = useState(false);
  const [booked, setBooked] = useState(false);
  const [carFailed, setCarFailed] = useState(false);
  const [model, setModel] = useState('agent');

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.querySelector('.steps a.on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [route]);

  const go = (id) => {
    window.location.hash = `/${id}`;
  };

  return (
    <>
      <div className="concept-bar" role="note">
        <Info size={14} aria-hidden="true" />
        <span>Independent product concept. Not affiliated with or endorsed by Airbnb or any partner named. No real bookings or payments.</span>
      </div>
      <header className="topbar">
        <div className="topbar-in">
          <a className="wordmark" href="#/today" aria-label="Concept home">
            airbnb <span>concept</span>
          </a>
          <nav className="steps" aria-label="Prototype sections">
            {ROUTES.map((r) => (
              <a key={r.id} href={`#/${r.id}`} className={route === r.id ? 'on' : ''} aria-current={route === r.id ? 'page' : undefined}>
                {r.n && <b>{r.n}</b>}
                {r.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="page">
        {route === 'today' && <StepToday go={go} />}
        {route === 'embedded' && (
          <StepEmbedded go={go} cart={cart} setCart={setCart} plan={plan} setPlan={setPlan} credit={credit} setCredit={setCredit} booked={booked} setBooked={setBooked} carFailed={carFailed} setCarFailed={setCarFailed} model={model} setModel={setModel} />
        )}
        {route === 'industry' && <StepIndustry go={go} />}
        {route === 'after' && <StepAfter go={go} cart={cart} plan={plan} credit={credit} booked={booked} carFailed={carFailed} model={model} setModel={setModel} />}
        {route === 'sources' && <SourcesPage />}
      </main>
      <footer className="foot">
        Concept prototype. Sample prices and a sample listing. Public facts checked Nov 6, 2026. See <a href="#/sources">Real vs. assumed</a>.
      </footer>
    </>
  );
}
