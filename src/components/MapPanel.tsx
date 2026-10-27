import { ArrowUpRight, LocateFixed, MapPin, Navigation2, Route } from 'lucide-react';
import { useState } from 'react';

const markers = [
  { id: 'donor', label: 'Green Table Café', x: 23, y: 53, kind: 'donor' },
  { id: 'handoff', label: 'Hope Kitchen', x: 73, y: 31, kind: 'ngo' },
  { id: 'partner', label: 'Ravi · on route', x: 51, y: 61, kind: 'partner' },
];

export function MapPanel() {
  const [active, setActive] = useState(markers[2]);
  return <section className="map-panel card-surface">
    <div className="map-panel-head"><div><span className="eyebrow">NEAR YOUR LOOP</span><h3>One short route. A full table.</h3></div><button className="map-expand" aria-label="Center demo map"><LocateFixed size={17} /></button></div>
    <div className="map-canvas" role="group" aria-label="Illustrative demo delivery map">
      <div className="map-river" /><div className="map-park map-park--one" /><div className="map-park map-park--two" />
      <span className="map-road map-road--one" /><span className="map-road map-road--two" /><span className="map-road map-road--three" /><span className="map-road map-road--four" /><span className="map-road map-road--five" />
      <span className="map-area map-area--one">INDIRANAGAR</span><span className="map-area map-area--two">DOMLUR</span><span className="map-area map-area--three">ULSOOR</span>
      <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M23 53 C32 70 45 69 51 61 S66 36 73 31" fill="none" stroke="#426C4E" strokeWidth="1.5" strokeDasharray="2.5 2.5" vectorEffect="non-scaling-stroke" /></svg>
      {markers.map((marker) => <button key={marker.id} className={`map-marker map-marker--${marker.kind}${active.id === marker.id ? ' selected' : ''}`} style={{ left: `${marker.x}%`, top: `${marker.y}%` }} onClick={() => setActive(marker)} aria-label={marker.label} title={marker.label}><span>{marker.kind === 'partner' ? <Navigation2 size={15} /> : <MapPin size={15} />}</span></button>)}
      <div className="map-legend"><span><i className="legend-dot legend-dot--donor" />Donor</span><span><i className="legend-dot legend-dot--ngo" />Food bank</span><span><i className="legend-dot legend-dot--partner" />Partner</span></div>
      <div className="map-active-card"><span className="map-active-icon"><Route size={15} /></span><div><strong>{active.label}</strong><span>{active.kind === 'partner' ? '12 min to pickup · demo route' : active.kind === 'donor' ? 'Pickup ready · 24 portions' : 'Receiving until 9:00 PM'}</span></div><ArrowUpRight size={15} /></div>
    </div>
    <div className="map-note"><span>Illustrative demo map</span><span>Location and route are simulated.</span></div>
  </section>;
}
