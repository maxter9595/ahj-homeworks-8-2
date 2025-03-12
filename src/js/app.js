import Dashboard from "./Dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  // const serverUrl = "http://localhost:3000"
  const serverUrl = "https://ahj-homeworks-8-2.onrender.com";
  const dashboard = new Dashboard(serverUrl);
  window.dashboard = dashboard;
});
