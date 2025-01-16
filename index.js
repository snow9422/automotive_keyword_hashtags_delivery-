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
    pass: process.env.GMAIL_PASS,
  },
  debug: true, // Enable debug output
  logger: true, // Log SMTP communication
});

// Function to send email
const sendEmail = async (csvFilePath) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'tobirammar@gmail.com, basiuk94n@gmail.com, chris@chriswhaley.com',
    subject: 'Automotive Keywords and Hashtags CSV',
    text: 'Please find the attached CSV file containing the latest automotive keywords and hashtags.',
    attachments: [
      {
        filename: 'output.csv',
        path: csvFilePath,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to fetch data from ChatGPT and generate CSV
async function generateAndSendCSV() {
  const prompt = `
    Generate the top 30 most searched automotive-related keywords and hashtags for Meta (Facebook & Instagram), Craigslist, and TikTok.
    Include the following fields:
    - "Meta": [{"Keyword": "...", "Hashtag": "...", "USA_CST": "...", "Canada_CST": "..."}, ...]
    - "Craigslist": [{"Keyword": "...", "USA_CST": "...", "Canada_CST": "..."}, ...]
    - "TikTok": [{"Keyword": "...", "Hashtag": "...", "USA_CST": "...", "Canada_CST": "..."}, ...]
    Notes:
    1. Provide exactly 30 entries per platform.
    2. Use "high", "medium", or "low" for USA_CST and Canada_CST values.
    3. Return only valid JSON. Do not include ellipses or additional text in your response.
    Please make sure you fill the response with automotive-specific keywords tailored for the automotive industry.
    Ensure the keywords are closely tied to the automotive sector and not too broad like 'cars' or 'trucks'.
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // Replace with the specific model you want to use
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = JSON.parse(response.data.choices[0].message.content);
    console.log(data);

    if (!data.Meta || !data.Craigslist || !data.TikTok) {
      console.error('Invalid API response structure');
      return;
    }

    const metaData = data.Meta.map((item, index) => ({
      Platform: 'Meta (Facebook & Instagram)',
      Rank: index + 1,
      Keyword: item.Keyword,
      Hashtag: item.Hashtag,
      USA_CST: item.USA_CST,
      Canada_CST: item.Canada_CST,
    }));

    const craigslistData = data.Craigslist.map((item, index) => ({
      Platform: 'Craigslist',
      Rank: index + 1,
      Keyword: item.Keyword,
      Hashtag: '',
      USA_CST: item.USA_CST,
      Canada_CST: item.Canada_CST,
    }));

    const tiktokData = data.TikTok.map((item, index) => ({
      Platform: 'TikTok',
      Rank: index + 1,
      Keyword: item.Keyword,
      Hashtag: item.Hashtag,
      USA_CST: item.USA_CST,
      Canada_CST: item.Canada_CST,
    }));

    const combinedData = [...metaData, ...craigslistData, ...tiktokData];

    const fields = ['Platform', 'Rank', 'Keyword', 'Hashtag', 'USA_CST', 'Canada_CST'];
    const parser = new Parser({ fields });
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
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Schedule the task to run every hour
cron.schedule('0 * * * *', generateAndSendCSV);

// Run once immediately for testing
generateAndSendCSV();
