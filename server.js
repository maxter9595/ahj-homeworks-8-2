const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

const instances = [];
const clients = [];

app.get("/instances", (req, res) => {
  res.json(instances);
});

app.post("/instances", (req, res) => {
  const id = uuidv4();
  notifyClients({ type: "received", command: "create", id });

  setTimeout(() => {
    instances.push({ id, state: "stopped" });
    notifyClients({ type: "created", id });
  }, 20000);

  res.json({ status: "ok" });
});

app.put("/instances/:id/start", (req, res) => {
  const { id } = req.params;
  const instance = instances.find((inst) => inst.id === id);

  if (instance) {
    notifyClients({ type: "received", command: "start", id });

    setTimeout(() => {
      instance.state = "running";
      notifyClients({ type: "started", id });
    }, 20000);
  }

  res.json({ status: "ok" });
});

app.put("/instances/:id/stop", (req, res) => {
  const { id } = req.params;
  const instance = instances.find((inst) => inst.id === id);

  if (instance) {
    notifyClients({ type: "received", command: "stop", id });

    setTimeout(() => {
      instance.state = "stopped";
      notifyClients({ type: "stopped", id });
    }, 20000);
  }

  res.json({ status: "ok" });
});

app.delete("/instances/:id", (req, res) => {
  const { id } = req.params;
  const index = instances.findIndex((inst) => inst.id === id);

  if (index !== -1) {
    notifyClients({ type: "received", command: "remove", id });

    setTimeout(() => {
      instances.splice(index, 1);
      notifyClients({ type: "removed", id });
    }, 20000);
  }

  res.json({ status: "ok" });
});

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients.splice(
      clients.findIndex((client) => client.id === clientId),
      1,
    );
  });
});

function notifyClients(event) {
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
