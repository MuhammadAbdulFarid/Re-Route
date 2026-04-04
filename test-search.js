// Simple test for search API
const response = await fetch("http://localhost:3001/api/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "test search" }),
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
