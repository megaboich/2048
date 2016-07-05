var req = require.context('./app/', true, /spec\.ts$/);
req.keys().forEach(req);