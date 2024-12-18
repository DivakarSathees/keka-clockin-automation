const puppeteer = require("puppeteer");
const axios = require("axios");
const cron = require("node-cron");
const http = require("http");
const { chromium } = require('playwright');  // Import Playwright

const predefinedLocation = { latitude: 19.1073653, longitude: 73.0235438 }; // Replace with your predefined location (e.g., Bangalore)

// Function to get current location using IP Geolocation API
async function getCurrentLocation() {
   const userDataDir = 'C:/Users/divak/AppData/Local/Google/Chrome/User Data1'; // Replace with actual path
    const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // Path to your Chrome executable

    try {
        // Launch Puppeteer with custom Chrome installation
        const browser = await puppeteer.launch({
            headless: false,  // Set to false to open the browser in a non-headless mode
            userDataDir: userDataDir,  
            executablePath: executablePath,
            args: [
              '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--remote-debugging-port=9222',
                '--start-maximized',
            ],
          });
       
      const page = await browser.newPage();
      console.log(page);
  
      // Enable geolocation
      const context = browser.defaultBrowserContext();
      console.log("context");
      
    //   const asd = await context.overridePermissions("http://127.0.0.1:8080", ["geolocation"]);
    //   console.log(asd);

    
      // Open the locally served page
      await page.goto("http://127.0.0.1:8080");
  
      // Wait for geolocation data to appear
      await page.waitForFunction(() => document.body.innerText.includes("latitude"));
  
      // Retrieve location data
      const location = await page.evaluate(() => JSON.parse(document.body.innerText));
      console.log("Retrieved Location:", location);
  
      // Close Puppeteer
      await browser.close();
    //   server.close(); // Stop the server
      return location;
    } catch (error) {
      console.error("Error fetching location:", error);
    //   server.close(); 
      return null;
    }
  }

// Function to calculate distance between two locations (using simple Euclidean distance)
function isLocationMatch(currentLocation, predefinedLocation) {
    console.log(currentLocation);
    
  const distance = Math.sqrt(
    Math.pow(currentLocation.latitude - predefinedLocation.latitude, 2) +
      Math.pow(currentLocation.longitude - predefinedLocation.longitude, 2)
  );
  return distance < 0.01; // Adjust threshold based on your accuracy
}
const endpoint = 'https://iamneo.keka.com/k/leave/api/me/leave/summary?forDate=2024-12-18';
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFBRjQzNjk5RUE0NDlDNkNCRUU3NDZFMjhDODM5NUIyMEE0MUNFMTgiLCJ4NXQiOiJHdlEybWVwRW5HeS01MGJpaklPVnNncEJ6aGciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FwcC5rZWthLmNvbSIsIm5iZiI6MTczNDU0MjAwMywiaWF0IjoxNzM0NTQyMDAzLCJleHAiOjE3MzQ2Mjg0MDMsImF1ZCI6WyJrZWthaHIuYXBpIiwiaGlyby5hcGkiLCJodHRwczovL2FwcC5rZWthLmNvbS9yZXNvdXJjZXMiXSwic2NvcGUiOlsib3BlbmlkIiwia2VrYWhyLmFwaSIsImhpcm8uYXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbImV4dGVybmFsIl0sImNsaWVudF9pZCI6Ijk4N2NjOTcxLWZjMjItNDQ1NC05OWY5LTE2YzA3OGZhN2ZmNiIsInN1YiI6IjE3OTIyZGRkLTlmOWYtNDcwMi05NjVhLWZjYTcyYmU0ZWY2OCIsImF1dGhfdGltZSI6MTczNDU0MjAwMCwiaWRwIjoiT2ZmaWNlMzY1IiwidGVuYW50X2lkIjoiNGNlMDZlZWYtNTA0Ni00ZDQ5LTlhMTAtNTdhNTQ2ZTVmMmNhIiwidGVuYW50aWQiOiI0Y2UwNmVlZi01MDQ2LTRkNDktOWExMC01N2E1NDZlNWYyY2EiLCJzdWJkb21haW4iOiJpYW1uZW8ua2VrYS5jb20iLCJ1c2VyX2lkIjoiMGYwMmU5YmItZTEwYy00OGEzLTg3NDYtN2ZlZDZjZWU1ZDA3IiwidXNlcl9pZGVudGlmaWVyIjoiMGYwMmU5YmItZTEwYy00OGEzLTg3NDYtN2ZlZDZjZWU1ZDA3IiwidXNlcm5hbWUiOiJkaXZha2FyLnNAaWFtbmVvLmFpIiwiZW1haWwiOiJkaXZha2FyLnNAaWFtbmVvLmFpIiwiYXV0aGVudGljYXRpb25fdHlwZSI6IjIiLCJzaWQiOiJBMEZBRDI2NEJGRTk2RDM5NDUxQTI4ODYyRUNDMDg1MiIsImp0aSI6IjBGNUEzNThBODdBNUNCQzlFOUZBNkZBQTRBMEE0NzlFIn0.UkxhHJqGo0V-aJUGPkJ6fQUy8omcrGKF_zTZ-RucGfW4598cIq-kGZGy2txrwfYKtdae52AvxksSLl5ek5xUu0iIr9MOiieNnwi0a724h3tEdXACWcjSpcsqteqHHCN_2M1L90vvJbOampANNyfQEkCslWgsfP9jxQ3tG2y4H9JLJQYtNBfl4-_SgUbeEIMu2Bs3MdpsuvFHHB6EBRSVDr0SRkvEsrI4PWhAI1I8SWonQNPG4jTL_-hnze7wIeIErc9Rybjcj5tp8Ns3CqhBR2l3O-0nsXthLTn__DBUNQwCsqTEp7zuFz1AS8du5INCMNJ4UGllGyodHvO6YAJGfA'; // Replace with your token


// Automate Keka Clock-In
async function clockInKeka() {
  try {
    const response = await axios.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`, // Add token as a Bearer token
            'Content-Type': 'application/json' // Optional, depending on the API
        }
    });

    console.log('API Response:', response.data);
    // const browser = await puppeteer.launch({ headless: true });
    // const page = await browser.newPage();
    // await page.goto("https://your-keka-url.com"); // Replace with your Keka URL

    // // Log in to Keka
    // await page.type("#username", "your-email"); // Replace with username selector and value
    // await page.type("#password", "your-password"); // Replace with password selector and value
    // await page.click("#login-button"); // Replace with login button selector
    // await page.waitForNavigation();

    // // Clock-In
    // await page.click("#clock-in-button"); // Replace with clock-in button selector
    // console.log("Clocked in successfully!");

    // await browser.close();
  } catch (error) {
    console.error("Error clocking in:", error.message);
  }
}

// // Schedule task from Monday to Friday between 9:00 AM and 10:00 AM (cron job)
// cron.schedule("0 20-23 * * 1-5", async () => {
cron.schedule('* * * * *', async () => {
  console.log("Checking current location...");

  const currentLocation = await getCurrentLocation();
//   const currentLocation =  getCurrentLocation();
  console.log("Current Location:", currentLocation);
  if (currentLocation) {
    console.log("Latitude:", currentLocation.latitude);
    console.log("Longitude:", currentLocation.longitude);
  } else {
    console.log("Could not retrieve location.");
  }

  if (currentLocation && isLocationMatch(currentLocation, predefinedLocation)) {
    console.log("Location matched. Attempting to clock in...");
    await clockInKeka();
    
    //  clockInKeka();
  } else {
    console.log("Location does not match. Skipping clock-in.");
  }
});
// getCurrentLocation()

console.log("Current time: ", new Date().toLocaleString());

// cron.schedule('* * * * *', () => {
//     console.log('Cron job is running every minute!');
//   });

console.log("Clock-in automation started.");
