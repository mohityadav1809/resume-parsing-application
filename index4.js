const fs = require("fs");
const pdf = require("pdf-parse");
const nlp = require("compromise");


const resumeText = "John Doe is a software engineer with over 5 years of experience...";
const names = extractNames(resumeText);
console.log('Names found:', names);
const filePath = "D:/Projects/resume-parser/public/resumes/MY.pdf";

const extractDetails = (text) => {
  const doc = nlp(text);
  const name = doc.match("Name: [A-Z][a-z]+ [A-Z][a-z]+").out("text");
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phone = text.match(
    /(?:\+?(\d{1,3}))?[\s.-]?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/i
  );

  return {
    name: name ? name.replace("Name: ", "").trim() : "Not Found",
    email: email ? email[0] : "Not Found",
    phone: phone ? phone[0] : "Not Found",
  };
};

const dataBuffer = fs.readFileSync(filePath);

pdf(dataBuffer)
  .then((data) => {
    const text = data.text;
    const details = extractDetails(text);
    console.log("Extracted details:", details);
  })
  .catch((error) => {
    console.error("Error parsing PDF:", error);
  });
