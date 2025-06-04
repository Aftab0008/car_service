import { useState } from 'react';
import { Button } from './components/ui/button'; // adjust if you use default export

function App() {
  // Store latitude and longitude separately as numbers or null initially
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    issue: '',
    vehicle: '',
  });

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => alert('Unable to fetch location')
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validate fields + location coordinates
    if (
      !formData.name ||
      !formData.phone ||
      !formData.issue ||
      !formData.vehicle ||
      !location.latitude ||
      !location.longitude
    ) {
      alert('Please fill all fields and send your location.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send latitude and longitude as numbers separately
        body: JSON.stringify({ ...formData, latitude: location.latitude, longitude: location.longitude }),
      });

      if (response.ok) {
        alert('✅ Emergency request sent!');
        // Reset form
        setFormData({ name: '', phone: '', issue: '', vehicle: '' });
        setLocation({ latitude: null, longitude: null });
      } else {
        alert('❌ Failed to send request.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Server error. Try again later.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">🚨 Request Emergency Roadside Help</h1>

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name"
        className="w-full p-2 border rounded"
      />

      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full p-2 border rounded"
      />

      <input
        name="vehicle"
        value={formData.vehicle}
        onChange={handleChange}
        placeholder="Vehicle Name/Model"
        className="w-full p-2 border rounded"
      />

      <select
        name="issue"
        value={formData.issue}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Issue</option>
        <option value="won't start">Won't Start</option>
        <option value="flat tire">Flat Tire</option>
        <option value="out of gas">Out of Gas</option>
        <option value="other">Other</option>
      </select>

      <div className="flex space-x-2 items-center">
        <Button onClick={handleGetLocation}>📍 Send My Location</Button>
        <span className="text-sm text-gray-500">
          {location.latitude && location.longitude
            ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : 'No location set'}
        </span>
      </div>

      <Button
        className="bg-red-600 hover:bg-red-700 text-white w-full"
        onClick={handleSubmit}
      >
        🚨 Submit Emergency Request
      </Button>
    </div>
  );
}

export default App;
