const axios = require('axios');
const { Parser } = require('json2csv');
const fs = require('fs');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Function to send email
const sendEmail = (csvFilePath) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'tobirammar@gmail.com, basiuk94n@gmail.com, chris@chriswhaley.com',
    subject: 'Automotive Keywords and Hashtags CSV',
    text: 'Please find the attached CSV file containing the latest automotive keywords and hashtags.',
    attachments: [
      {
        filename: 'output.csv',
        path: csvFilePath
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Function to generate CSV and send email
const generateAndSendCSV = () => {
  axios.post('https://ai.quivox.org/api/quiva-x-advanced/generate-response', 
    {
      prompt: 'generate top 50* most searched automotive related keywords and hashtags on Meta(facebook&instagram), craigslist and tiktok. Please Make sure your response exactly matches this format:{"Meta":[{"Keyword":"automotive parts","Hashtag":"#automotiveparts","USA_CST":"high","Canada_CST":"medium"},{"Keyword":"automotive repairs","Hashtag":"#automotiverepair","USA_CST":"medium","Canada_CST":"low"},...],"Craigslist":[{"Keyword":"automotive jobs","USA_CST":"medium","Canada_CST":"low"},{"Keyword":"automotive paint","USA_CST":"high","Canada_CST":"medium"},...],"TikTok":[{"Keyword":"walmart automotive","Hashtag":"#automotiveshop","USA_CST":"high","Canada_CST":"medium"},{"Keyword":"automotive industry","Hashtag":"#automotivetechnician","USA_CST":"medium","Canada_CST":"low"},...]}',
      username: 'nueralmage'
    },
    {
      headers: {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im51ZXJhbG1hZ2UiLCJpYXQiOjE3MzIwMjg0Njd9.eD1-HnESzEGQIrc5d__LvZUdNMeCuEtUqPayIhfT5-8',
      }
    }
  )
  .then(response => {
    const data = response.data;
    console.log('Data:', data);

    const metaData = data.Meta.map((item, index) => ({
      Platform: 'Meta (Facebook & Instagram)',
      Rank: index + 1,
      Keyword: item.Keyword,
      Hashtag: item.Hashtag,
      USA_CST: item.USA_CST,
      Canada_CST: item.Canada_CST
    }));

    const craigslistData = data.Craigslist.map((item, index) => ({
      Platform: 'Craigslist',
      Rank: index + 1,
      Keyword: item.Keyword,
      Hashtag: '',
      USA_CST: item.USA_CST,
      Canada_CST: item.Canada_CST
    }));

    const tiktokData = data.TikTok.map((item, index) => ({
      Platform: 'TikTok',
      Rank: index + 1,
      Keyword: item.Keyword,
      Hashtag: item.Hashtag,
      USA_CST: item.USA_CST,
      Canada_CST: item.Canada_CST
    }));

    const combinedData = [...metaData, ...craigslistData, ...tiktokData];

    const fields = ['Platform', 'Rank', 'Keyword', 'Hashtag', 'USA_CST', 'Canada_CST'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(combinedData);

    const csvFilePath = `output_${Date.now()}.csv`;
    fs.writeFile(csvFilePath, csv, (err) => {
      if (err) {
        console.error('Error writing to CSV file', err);
      } else {
        console.log('CSV file has been saved successfully');
        sendEmail(csvFilePath);
      }
    });
  })
  .catch(error => {
    console.error(error);
  });
};

// Schedule the task to run every hour
cron.schedule('0 * * * *', generateAndSendCSV);
