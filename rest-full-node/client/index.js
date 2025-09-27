import fetch from "node-fetch";

const base = process.env.API_BASE || "http://api:80";

// Verifica stock
const check = async () => {
  const res = await fetch(`${base}/api/inventory/check/P001/3`);
  const data = await res.json();
  console.log("Check Stock:", data);
};

// Crea una orden
const order = async () => {
  const res = await fetch(`${base}/api/inventory/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ProductId: "P001", Quantity: 3 })
  });
  const data = await res.json();
  console.log("Create Order:", data);
};

(async () => {
  try {
    await check();
    await order();
    await check(); // Ver stock actualizado
  } catch (e) {
    console.error("Client error:", e);
    process.exit(1);
  }
})();
