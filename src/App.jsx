import { useState } from 'react';
import { Button } from './components/ui/button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    issue: '',
    vehicle: '',
  });
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        alert('❌ Unable to fetch location');
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      alert('📱 Please enter a valid 10-digit phone number.');
      return;
    }

    if (
      !formData.name ||
      !formData.phone ||
      !formData.issue ||
      !formData.vehicle ||
      !location.latitude ||
      !location.longitude
    ) {
      alert('⚠️ Please fill all fields and send your location.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (response.ok) {
        alert('✅ Emergency request sent!');
        setFormData({ name: '', phone: '', issue: '', vehicle: '' });
        setLocation({ latitude: null, longitude: null });
      } else {
        alert('❌ Failed to send request.');
      }
    } catch (error) {
      alert('❌ Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-blue-100 to-indigo-200 flex flex-col items-center justify-center py-10 px-4">
      <div className="flex flex-col lg:flex-row items-center gap-10">
        {/* 👨‍🔧 Mechanic GIF */}
        <img
          src="/fotor-video-remover-object-pre-unscreen.gif"
          alt="Mechanic Animation"
          className="w-60 h-auto rounded-2xl"
        />

        {/* 🚨 Emergency Form Box with 3D Glass Effect */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-8 w-full max-w-xl transform transition duration-500 hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)] space-y-5">
          <h1 className="text-3xl font-bold text-center text-red-600">
            🚨 Emergency Roadside Help
          </h1>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="👤 Your Name"
            className="w-full p-3 bg-white/40 border border-white/30 rounded-xl shadow-inner backdrop-blur-md placeholder-gray-700 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="📞 Phone Number"
            className="w-full p-3 bg-white/40 border border-white/30 rounded-xl shadow-inner backdrop-blur-md placeholder-gray-700 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            placeholder="🚗 Vehicle Name/Model"
            className="w-full p-3 bg-white/40 border border-white/30 rounded-xl shadow-inner backdrop-blur-md placeholder-gray-700 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            className="w-full p-3 bg-white/40 border border-white/30 rounded-xl shadow-inner backdrop-blur-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">🔧 Select Issue</option>
            <option value="won't start">Won't Start</option>
            <option value="flat tire">Flat Tire</option>
            <option value="out of gas">Out of Gas</option>
            <option value="other">Other</option>
          </select>

          <div className="flex space-x-3 items-center">
            <Button
              onClick={handleGetLocation}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md"
            >
              📍 Send My Location
            </Button>
            <span className="text-sm text-white">
              {location.latitude && location.longitude
                ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                : 'No location set'}
            </span>
          </div>

          {location.latitude && location.longitude && (
            <div className="h-64 rounded-xl overflow-hidden border border-white/30 shadow-inner backdrop-blur-md">
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[location.latitude, location.longitude]}>
                  <Popup>Your Location</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <Button
            className="bg-red-600 hover:bg-red-700 text-white w-full p-3 rounded-xl shadow-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '🚨 Sending...' : '🚨 Submit Emergency Request'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
