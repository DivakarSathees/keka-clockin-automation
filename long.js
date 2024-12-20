const http = require("http");


const htmlContent = `
      <html>
        <body>
          <script>
            navigator.geolocation.getCurrentPosition(
              (position) => {
                document.body.innerHTML = JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                document.body.innerHTML = JSON.stringify({ error: error.message });
              }
            );
          </script>
        </body>
      </html>
    `;
  
    // Start a local HTTP server to host the HTML content
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    });
    server.listen(8080, "127.0.0.1", () => console.log("Server running ..."));
