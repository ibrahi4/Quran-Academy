fetch("http://localhost:4000/api/v1/teacher", {
  headers: {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
})
.then(r => r.json())
.then(d => console.log("API Response:", JSON.stringify(d, null, 2)))
