const express = require("express");
const fs = require("fs");
const mammoth = require("mammoth");
const ResumeParser = require("simple-resume-parser");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const PORT = process.env.PORT || 1031;
const json2xls = require("json2xls");
const app = express();
const outputPath = "./public/resumes/extracted.txt";
const candiateResume = "./public/output/candidatesData.xls";
const compiledData = "./public/output/compiledData.xls";

const regex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/resumes/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
let compiledDataRecords = [];
app.post("/resumeParsers", upload.array("resumes"), async (req, res) => {
  try {
    let outputlist = [];
    const resumes = req.files;
    for (const resume of resumes) {
      const pdfresume = new ResumeParser(outputPath);
      let phoneNumber = "";
      let filename = resume.filename;
      if (resume.mimetype == "application/pdf") {
        const dataBuffer = await pdfParse(resume.path);
        let newText = dataBuffer.text;
        let text = newText.replace(/\n/g, " ");

     //   let text = newText;
        let match;
        while ((match = regex.exec(text)) !== null) {
          phoneNumber = match[0];
        }
        fs.writeFileSync(outputPath, text);
        const candidateDetails = await resumeToJson(
          pdfresume,
          phoneNumber,
          filename
        );
        outputlist.push(candidateDetails);
        compiledDataRecords.push(candidateDetails);
      } else {
        const newdoc = new ResumeParser(
          "./public/resumes/" + resume.originalname
        );
        let extract = await mammoth
          .extractRawText({ path: `./public/resumes/${resume.originalname}` })
          .then((result) => {
            while ((match = regex.exec(result.value)) !== null) {
              phoneNumber = match[0];
            }
          })
          .catch((err) => {
            console.error("Error while extracting data:", err);
          });
        const candidateDetails = await resumeToJson(
          newdoc,
          phoneNumber,
          filename
        );
        outputlist.push(candidateDetails);
        compiledDataRecords.push(candidateDetails);
      }
    }
    res.send(outputlist);
    const xls = json2xls(outputlist);
    const xlscompiled = json2xls(compiledDataRecords);
    fs.writeFileSync(candiateResume, xls, "binary");
    fs.writeFileSync(compiledData, xlscompiled, "binary");
  } catch (error) {
    console.error("Error while processing resumes:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function resumeToJson(resume, phoneNumber, filename) {
  return new Promise((resolve, reject) => {
    resume
      .parseToJSON()
      .then((data) => {
        if (data && data.parts && data.parts.name && data.parts.email) {
          const reqObj = {
            Name: data.parts.name,
            Contact_Number: phoneNumber,
            Email_ID: data.parts.email,
            Document_Name: filename,
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