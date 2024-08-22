const fs = require("fs");

const data = "Hello, world!";
const filePath = "example.txt";

try {
  fs.writeFileSync(filePath, data);
  console.log("Data has been written to the file synchronously.");
} catch (error) {
  console.error("Error writing to file:", error);
}
