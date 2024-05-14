import WebSocket from 'ws'
import socketRouter from './src/router/router.js'
import { server, app, wss } from './src/application/base.router.js'
import { port, prod } from './src/config/config.js'
import { loadAssets } from './src/utils/load.assets.js'

app.use(socketRouter)
// Dictionary to store connected clients by hospital and channel
const hospitals = new Map()

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');
  console.log(req.url);
  const urlParts = req.url.split('/');
  const hospital = urlParts[1];
  const channel = urlParts[2];

  if (isValidHospital(hospital) && isValidChannel(channel)) {
    if (!hospitals.has(hospital)) {
      hospitals.set(hospital, new Map());
    }
    const channels = hospitals.get(hospital);
    if (!channels.has(channel)) {
      channels.set(channel, []);
    }
    const channelUsers = channels.get(channel);
    if (channel === 'joystick' && channelUsers.length >= 3) {
      ws.send(`The channel is already occupied.`);
      ws.close();
    } else {
      channelUsers.push(ws);

      ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        const clients = channels.get(channel);
        for (const client of clients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        const index = channelUsers.indexOf(ws);
        if (index !== -1) {
          channelUsers.splice(index, 1);
        }
      });

      ws.send(`Welcome to hospital: ${hospital}, channel: ${channel}`);
    }
  } else {
    ws.send(`Internal server error.`);
    ws.close();
  }
});


// Validation functions
const isValidHospital = (hospital) => {
  // Implement hospital validation logic here
  // -- Gets this array from local database like sqlite or lowdb or Nedb
  return ['devTool', 'royal', 'kmch'].includes(hospital);
}

const isValidChannel = (channel) => {
  // Implement  channel validation logic here
  // -- Gets this array from api like a cron job runs every 1hr to get this channels list in db
  return ['test', 'joystick', 'onlineoffline', 'notification'].includes(channel);
}

loadAssets() ?
  server.listen(port,
    () => {
      console.log(`Server is Running on \n👉 Mode [ ${prod.mode} ] \n👉 Port [ ${port} ]`);
    }
  ) :
  console.log("🔴 Cannot read env file.");
