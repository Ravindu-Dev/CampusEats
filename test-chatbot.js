fetch('http://localhost:8081/api/chatbot/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "hello" })
}).then(async res => {
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
}).catch(console.error);
