var req = require.context('./', true, /spec\.ts$/);
req.keys().forEach(req);