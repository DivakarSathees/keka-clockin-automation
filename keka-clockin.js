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
                '--ignore-certificate-errors'
            ],
          });
       
      const page = await browser.newPage();
      console.log(page);
  
      // Enable geolocation
      const context = browser.defaultBrowserContext();
      console.log("context");
      
      // const asd = await context.overridePermissions("https://currentlocationtracker7.onrender.com", ["geolocation"]);
    //   console.log(asd);
    // const asd = await context.overridePermissions("https://iamneo.keka.com", ["geolocation"]);


    
      // Open the locally served page
      // await page.goto("http://127.0.0.1:8080", { waitUntil: 'networkidle2' });
      // await page.goto("https://iamneo.keka.com", { waitUntil: 'networkidle2' });
      await page.goto("https://currentlocationtracker7.onrender.com", { waitUntil: 'networkidle2' });
  console.log("fff");
  
      // Wait for geolocation data to appear
      await page.waitForFunction(() => document.body.innerText.includes("latitude"));
  
      // Retrieve location data
      const location = await page.evaluate(() => JSON.parse(document.body.innerText));
      console.log("Retrieved Location:", location);
      await browser.close();

      const geocodeAPI = "https://api.opencagedata.com/geocode/v1/json";
                        
      const apiKey = "cf6826fd71ad4c6f939352b58df02ec4"; // Get a free API key from https://opencagedata.com/

      const url = `${geocodeAPI}?q=${location.latitude}+${location.longitude}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      // console.log(data.results[0].components);
      // console.log(data);
      if (data.results && data.results[0]) {
        const details = data.results[0].components;
        return {
            addressLine1: data.results[0].formatted,
            addressLine2: details.city || details.town || details.village,
            state: details.state,
            city: details.state_district,
            countryCode: details.country_code.toUpperCase(),
            zip: details.postcode,
            latitude:location.latitude,
            longitude:location.longitude,
        };
      } else {
          return { error: "No results found." };
      }
      

  
      // Close Puppeteer
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
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFBRjQzNjk5RUE0NDlDNkNCRUU3NDZFMjhDODM5NUIyMEE0MUNFMTgiLCJ4NXQiOiJHdlEybWVwRW5HeS01MGJpaklPVnNncEJ6aGciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FwcC5rZWthLmNvbSIsIm5iZiI6MTczNDcxNTUyMiwiaWF0IjoxNzM0NzE1NTIyLCJleHAiOjE3MzQ4MDE5MjIsImF1ZCI6WyJrZWthaHIuYXBpIiwiaGlyby5hcGkiLCJodHRwczovL2FwcC5rZWthLmNvbS9yZXNvdXJjZXMiXSwic2NvcGUiOlsib3BlbmlkIiwia2VrYWhyLmFwaSIsImhpcm8uYXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbImV4dGVybmFsIl0sImNsaWVudF9pZCI6Ijk4N2NjOTcxLWZjMjItNDQ1NC05OWY5LTE2YzA3OGZhN2ZmNiIsInN1YiI6IjE3OTIyZGRkLTlmOWYtNDcwMi05NjVhLWZjYTcyYmU0ZWY2OCIsImF1dGhfdGltZSI6MTczNDU0MjAwMCwiaWRwIjoiT2ZmaWNlMzY1IiwidGVuYW50X2lkIjoiNGNlMDZlZWYtNTA0Ni00ZDQ5LTlhMTAtNTdhNTQ2ZTVmMmNhIiwidGVuYW50aWQiOiI0Y2UwNmVlZi01MDQ2LTRkNDktOWExMC01N2E1NDZlNWYyY2EiLCJzdWJkb21haW4iOiJpYW1uZW8ua2VrYS5jb20iLCJ1c2VyX2lkIjoiMGYwMmU5YmItZTEwYy00OGEzLTg3NDYtN2ZlZDZjZWU1ZDA3IiwidXNlcl9pZGVudGlmaWVyIjoiMGYwMmU5YmItZTEwYy00OGEzLTg3NDYtN2ZlZDZjZWU1ZDA3IiwidXNlcm5hbWUiOiJkaXZha2FyLnNAaWFtbmVvLmFpIiwiZW1haWwiOiJkaXZha2FyLnNAaWFtbmVvLmFpIiwiYXV0aGVudGljYXRpb25fdHlwZSI6IjIiLCJzaWQiOiJBMEZBRDI2NEJGRTk2RDM5NDUxQTI4ODYyRUNDMDg1MiIsImp0aSI6IjE2Q0MyMTNCRUQxNTU2OTMwNkQyRDEzQTY0MzgwQTAyIn0.FIfoCb8oYavGQgjzzzbrrJogAQGhOLB5h5undER1-PjWDirRr8HoqKs2eJFYqkeUy95kkB08fNN88cAQ12ukv9LnhEgZlyH-_lRRv5nTr3WNA2VZAUAbjWJelYtwt8nw2s0QLyJhzkW7GK0mQ5Ovjkbhc3HGZNS1pSd81q4_yqrNTUmuEphag62ObhFjzd51ywZRz_5Dw5mRYDvDsL8Kl4dEcKvcqVg2AhRB48N1TV_nEjHWaMzBypXs6YcG9E4ERbXr2boImcOs77EIPy2j_vdvjP8oZeTqnftw0oRwcfLgeHExUdQGM5nUZ8mvkCZJwcx3056Lcl0RB5Zp0ThBjQ'; // Replace with your token


// Automate Keka Clock-In
async function clockInKeka(payload) {
  try {
    console.log(payload);
    
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

  const locationAddress = await getCurrentLocation();
//   const currentLocation =  getCurrentLocation();
  // console.log("Current Location:", currentLocation);
  // if (currentLocation) {
  //   console.log("Latitude:", currentLocation.latitude);
  //   console.log("Longitude:", currentLocation.longitude);
  // } else {
  //   console.log("Could not retrieve location.");
  // }
  const payload = {
    // "timestamp": "2024-12-20T16:14:54.232Z",
    timestamp: new Date().toISOString(),
    attendanceLogSource: 1,
    locationAddress,
    manualClockinType: 1,
    note: "",
    originalPunchStatus: 1
  }
  // console.log(payload);
  

  if (locationAddress && isLocationMatch(locationAddress, predefinedLocation)) {
    console.log("Location matched. Attempting to clock in...");
    await clockInKeka(payload);
    
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
