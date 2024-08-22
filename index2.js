const express = require("express");
const fs = require("fs");
const mammoth = require("mammoth");
const ResumeParser = require("simple-resume-parser");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const PORT = process.env.PORT || 3000;

const app = express();

const outputPath = "./uploads/extracted.txt";
const candiateResume = "./output/candidatesData.xls";

const regex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

const json2xls = require("json2xls");

// Set up Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Unique filename
  },
});
const upload = multer({ storage: storage });
let outputlist = [];

app.post("/resumeParsers", upload.array("resumes"), async (req, res) => {
  try {
    const resumes = req.files;
    for (const resume of resumes) {
      const pdfresume = new ResumeParser(outputPath);
      let phoneNumber = "";
      if (resume.mimetype == "application/pdf") {
        const dataBuffer = await pdfParse(resume.path);
        let text = dataBuffer.text;
        let match;
        while ((match = regex.exec(text)) !== null) {
          phoneNumber = match[0];
        }
        fs.writeFileSync(outputPath, text);
        const candidateDetails = await resumeToJson(pdfresume, phoneNumber);
        outputlist.push(candidateDetails);
      } else {
        const newdoc = new ResumeParser("./uploads/" + resume.originalname);
        let extract = await mammoth
          .extractRawText({ path: `./uploads/${resume.originalname}` })
          .then((result) => {
            while ((match = regex.exec(result.value)) !== null) {
              console.log(match[0]);
              phoneNumber = match[0];
            }
          })
          .catch((err) => {
            console.error("Error while extracting data:", err);
          });
        const candidateDetails = await resumeToJson(newdoc, phoneNumber);
        outputlist.push(candidateDetails);
      }
    }
    res.send(outputlist);
    const xls = json2xls(outputlist);
    fs.writeFileSync(candiateResume, xls, "binary");
    console.log("Excel file has been created successfully.");
  } catch (error) {
    console.error("Error while processing resumes:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function resumeToJson(resume, phoneNumber) {
  return new Promise((resolve, reject) => {
    resume
      .parseToJSON()
      .then((data) => {
        if (data && data.parts && data.parts.name && data.parts.email) {
          const reqObj = {
            name: data.parts.name,
            email: data.parts.email,
            phoneNumber: phoneNumber,
          };
          // outputlist.push(reqObj);
          resolve(reqObj); // Resolve the promise with the updated outputlist
        }
        reject("Required Details not found in Resume");
      })
      .catch((error) => {
        console.error("error in conversion ::" + error);
        reject(error); // Reject the promise if there's an error
      });
  });
}
