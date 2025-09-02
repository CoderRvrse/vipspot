// Purge any localhost SW/caches without touching code
const ORIGIN = process.env.VIP_ORIGIN || "http://localhost:8000";
fetch(`${ORIGIN}/?kill-sw=1`).then(() => console.log("🔧 SW kill requested")).catch(()=>{});