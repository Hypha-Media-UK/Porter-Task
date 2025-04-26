import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Save settings API endpoint
app.post('/api/save-settings', (req, res) => {
  try {
    const settingsData = req.body;
    const settingsPath = path.join(__dirname, 'public', 'data', 'settings.json');
    
    // Write data to file with pretty formatting
    fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2));
    
    console.log('Settings saved successfully');
    res.status(200).json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ success: false, message: 'Error saving settings', error: error.message });
  }
});

// Save locations API endpoint
app.post('/api/save-locations', (req, res) => {
  try {
    const locationData = req.body;
    const locationsPath = path.join(__dirname, 'public', 'data', 'locations.json');
    
    // Write data to file with pretty formatting
    fs.writeFileSync(locationsPath, JSON.stringify(locationData, null, 2));
    
    console.log('Locations saved successfully');
    res.status(200).json({ success: true, message: 'Locations saved successfully' });
  } catch (error) {
    console.error('Error saving locations:', error);
    res.status(500).json({ success: false, message: 'Error saving locations', error: error.message });
  }
});

// Serve Vue.js SPA for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
