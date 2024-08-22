const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = 'D:/Projects/resume-parser/public/resumes/MY.pdf';

const extractDetails = (text) => {
  // Simple regex-based extraction (can be improved)
  const name = text.match(/Name:\s*(.*)/i);
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phone = text.match(/(?:\+?(\d{1,3}))?[\s.-]?\(?\d{1,4}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/i);
  const skills = text.match(/Skills:\s*(.*)/i);
  const education = text.match(/Education:\s*(.*)/i);
  const experience = text.match(/Experience:\s*(.*)/i);

  return {
    name: name ? name[1].trim() : '',
    email: email ? email[1].trim() : '',
    phone: phone ? phone[1].trim() : '',
    skills: skills ? skills[1].trim() : '',
    education: education ? education[1].trim() : '',
    experience: experience ? experience[1].trim() : ''
  };
};

const dataBuffer = fs.readFileSync(filePath);

pdf(dataBuffer).then((data) => {
  const text = data.text;
  const details = extractDetails(text);
  console.log('Extracted details:', details);
}).catch((error) => {
  console.error('Error parsing PDF:', error);
});