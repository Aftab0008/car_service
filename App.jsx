import { useState } from 'react';
import { Button } from './components/ui/button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

// Fix Leaflet marker icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!BACKEND_URL) console.error("VITE_BACKEND_URL is not defined in .env");

function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [formData, setFormData] = useState({ name: '', phone: '', issue: '', vehicle: '' });
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        toast.success('✅ Location captured!');
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error(`❌ Unable to fetch location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const { name, phone, vehicle, issue } = formData;

    if (!/^[0-9]{10}$/.test(phone)) return toast.error('📱 Enter a valid 10-digit phone number');
    if (!name.trim()) return toast.error('👤 Name is required');
    if (!vehicle.trim()) return toast.error('🚗 Vehicle model is required');
    if (!issue) return toast.error('🔧 Please select an issue');
    if (!location.latitude || !location.longitude) return toast.error('📍 Location not captured');

    const payload = { ...formData, ...location };
    console.log('🚀 Sending payload:', payload);
    toast(`📦 Sending data: ${JSON.stringify(payload)}`);

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('✅ Emergency request sent successfully!');
        setFormData({ name: '', phone: '', issue: '', vehicle: '' });
        setLocation({ latitude: null, longitude: null });
      } else {
        const errorText = await res.text();
        console.error('❌ Server response:', errorText);
        toast.error(`❌ Server: ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      toast.error('❌ Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl bg-white/40 border border-white/30 shadow-inner placeholder-gray-700 text-gray-900";

  return (
    <div className="min-h-screen from-blue-100 to-indigo-200 flex flex-col items-center justify-center py-10 px-4">
      <Toaster position="top-right" />
      <div className="flex flex-col lg:flex-row items-center gap-10">
        <img src="/fotor-video-remover-object-pre-unscreen.gif" alt="Mechanic" className="w-60 h-auto rounded-2xl" />

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl p-8 w-full max-w-xl space-y-5">
          <h1 className="text-3xl font-bold text-center text-red-600">🚨 Emergency Roadside Help</h1>

          <input name="name" value={formData.name} onChange={handleChange} placeholder="👤 Your Name" className={inputClass} />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="📞 Phone Number" className={inputClass} />
          <input name="vehicle" value={formData.vehicle} onChange={handleChange} placeholder="🚗 Vehicle Model" className={inputClass} />

          <select name="issue" value={formData.issue} onChange={handleChange} className={inputClass}>
            <option value="">🔧 Select Issue</option>
            <option value="won't start">Won't Start</option>
            <option value="flat tire">Flat Tire</option>
            <option value="out of gas">Out of Gas</option>
            <option value="other">Other</option>
          </select>

          <div className="flex items-center space-x-3">
            <Button onClick={handleGetLocation} disabled={loading} className="bg-blue-500 text-white">📍 Send Location</Button>
            <span className="text-sm text-white">{location.latitude ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'No location set'}</span>
          </div>

          {location.latitude && (
            <div className="h-64 rounded-xl overflow-hidden border">
              <MapContainer center={[location.latitude, location.longitude]} zoom={13} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.latitude, location.longitude]}>
                  <Popup>Your Location</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <Button className="bg-red-600 text-white w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? '🚨 Sending...' : '🚨 Submit Emergency Request'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
