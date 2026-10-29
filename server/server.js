import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Lohan Logistics Backend',
    timestamp: new Date().toISOString()
  });
});

// Quote submission endpoint
app.post('/api/quote', (req, res) => {
  const { name, email, phone, origin, destination, cargoType, weight, notes } = req.body;
  console.log('Received quote request:', req.body);
  
  // Return confirmed quote reference
  res.json({
    success: true,
    message: 'Quote request received successfully. Our team will contact you shortly.',
    quoteId: `LH-${Date.now().toString().slice(-6)}`,
    data: req.body
  });
});

// Tracking query endpoint
app.get('/api/tracking/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;
  res.json({
    trackingNumber,
    status: 'In Transit',
    currentLocation: 'Nagpur Multi-Modal Hub',
    origin: 'JNPT, Mumbai',
    destination: 'ICD Whitefield, Bengaluru',
    eta: 'Tomorrow, 4:00 PM',
    milestones: [
      { step: 'Gate In at Port', time: 'Yesterday 10:30 AM', completed: true },
      { step: 'Customs Cleared', time: 'Yesterday 3:15 PM', completed: true },
      { step: 'Rail Handover', time: 'Today 06:00 AM', completed: true },
      { step: 'In Transit', time: 'Today 12:45 PM', completed: true },
      { step: 'Delivery', time: 'Pending', completed: false }
    ]
  });
});

// Serve frontend in production if built
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Lohan Logistics Server running on port ${PORT}`);
});
