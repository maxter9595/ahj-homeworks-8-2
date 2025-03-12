/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/Dashboard.js
class Dashboard {
  constructor(serverUrl = "http://localhost:3000") {
    this.serverUrl = serverUrl;
    this.instancesContainer = document.getElementById("instances-list");
    this.worklogContainer = document.getElementById("worklog");
    this.createInstanceButton = document.getElementById("create-instance");
    this.instances = [];
    this.init();
  }
  init() {
    this.loadWorklog();
    this.setupEventSource();
    this.loadInstances();
    this.setupEventListeners();
  }
  loadWorklog() {
    const savedLogs = localStorage.getItem("worklog");
    if (savedLogs) {
      const logs = JSON.parse(savedLogs);
      logs.forEach(log => this.addLogToDOM(log));
    }
  }
  saveWorklog(event) {
    const logEntry = {
      time: `${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`,
      server: event.id,
      info: event.type
    };
    const savedLogs = localStorage.getItem("worklog");
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    logs.push(logEntry);
    localStorage.setItem("worklog", JSON.stringify(logs));
  }
  addLogToDOM(log) {
    const logEntry = document.createElement("div");
    logEntry.innerHTML = `
      <div class="log-time">${log.time}</div>
      <div class="log-server">Server: ${log.server}</div>
      <div class="log-info">INFO: ${log.info}</div>
    `;
    logEntry.classList.add("log-entry");
    this.worklogContainer.appendChild(logEntry);
    this.worklogContainer.scrollTop = this.worklogContainer.scrollHeight;
  }
  setupEventSource() {
    const eventSource = new EventSource(`${this.serverUrl}/events`);
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);
      this.updateWorklog(data);
      this.updateInstances(data);
    };
  }
  loadInstances() {
    fetch(`${this.serverUrl}/instances`).then(response => response.json()).then(data => {
      this.instances = data;
      this.renderInstances();
    });
  }
  setupEventListeners() {
    this.createInstanceButton.addEventListener("click", () => {
      fetch(`${this.serverUrl}/instances`, {
        method: "POST"
      });
    });
  }
  renderInstances() {
    this.instancesContainer.innerHTML = this.instances.map(instance => `
          <div class="instance">
            <div>${instance.id}</div>
            <div>Status: <span class="status ${instance.state}"></span>${instance.state}</div>
            <div>Actions: 
              ${instance.state === "stopped" ? `<button class="start-button" onclick="dashboard.startInstance('${instance.id}')">▶</button>` : ""}
              ${instance.state === "running" ? `<button class="stop-button" onclick="dashboard.stopInstance('${instance.id}')">❚❚</button>` : ""}
              <button class="delete-button" onclick="dashboard.deleteInstance('${instance.id}')">✖</button>
            </div>
          </div>
        `).join("");
  }
  updateWorklog(event) {
    const log = {
      time: `${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`,
      server: event.id,
      info: event.type
    };
    this.addLogToDOM(log);
    this.saveWorklog(event);
  }
  updateInstances(event) {
    if (event.type === "created" || event.type === "started" || event.type === "stopped" || event.type === "removed") {
      this.loadInstances();
    }
  }
  startInstance(id) {
    fetch(`${this.serverUrl}/instances/${id}/start`, {
      method: "PUT"
    });
  }
  stopInstance(id) {
    fetch(`${this.serverUrl}/instances/${id}/stop`, {
      method: "PUT"
    });
  }
  deleteInstance(id) {
    fetch(`${this.serverUrl}/instances/${id}`, {
      method: "DELETE"
    });
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

document.addEventListener("DOMContentLoaded", () => {
  // const serverUrl = "http://localhost:3000"
  const serverUrl = "https://ahj-homeworks-8-2.onrender.com";
  const dashboard = new Dashboard(serverUrl);
  window.dashboard = dashboard;
});
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;