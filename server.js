import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { createServer as createViteServer } from 'vite';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const port = 5173;

  // Use JSON body parser
  app.use(bodyParser.json());

  // API endpoint to save settings
  app.post('/api/save-settings', (req, res) => {
    try {
      const settingsData = req.body;
      const settingsPath = path.resolve(__dirname, 'public/data/settings.json');
      
      // Write the settings to the file
      fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2));
      
      console.log('Settings saved to file:', settingsPath);
      res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // API endpoint to save locations
  app.post('/api/save-locations', (req, res) => {
    try {
      const locationsData = req.body;
      const locationsPath = path.resolve(__dirname, 'public/data/locations.json');
      
      // Write the locations to the file
      fs.writeFileSync(locationsPath, JSON.stringify(locationsData, null, 2));
      
      console.log('Locations saved to file:', locationsPath);
      res.json({ success: true, message: 'Locations saved successfully' });
    } catch (error) {
      console.error('Error saving locations:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true }
  });
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API endpoints available for saving settings and locations`);
  });
}

createServer().catch((err) => {
  console.error('Error starting server:', err);
});
