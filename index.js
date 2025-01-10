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
const generateAndSendCSV = async () => {
  async function promptChatGPT(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4', // Replace with the specific model you want to use, e.g., 'gpt-3.5-turbo'
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000, // Adjust based on your needs
          temperature: 0.7 // Adjust the creativity level
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Correctly interpolate the API key
            'Content-Type': 'application/json'
          }
        }
      );

      // Print the response data
      console.log('Response:', response.data.choices[0].message.content);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return null;
    }
  }

  // Your specific prompt
  const prompt = ```
Generate the top 50 most searched automotive-related keywords and hashtags for Meta (Facebook & Instagram), Craigslist, and TikTok. Use the exact format below and make sure your extend each data for each of the platforms i.e meta, craigslist and tiktok to 50 keyword, hashtags and cta frequency each
make sure there are mostly automotive related terms, cars is to broad dive deeper into the automotive space
{
  "Meta": [
    {
      "Keyword": "automotive parts",
      "Hashtag": "#automotiveparts",
      "USA_CST": "high",
      "Canada_CST": "medium"
    },
    {
      "Keyword": "automotive repairs",
      "Hashtag": "#automotiverepair",
      "USA_CST": "medium",
      "Canada_CST": "low"
    },
    ...
  ],
  "Craigslist": [
    {
      "Keyword": "automotive jobs",
      "USA_CST": "medium",
      "Canada_CST": "low"
    },
    {
      "Keyword": "automotive paint",
      "USA_CST": "high",
      "Canada_CST": "medium"
    },
    ...
  ],
  "TikTok": [
    {
      "Keyword": "walmart automotive",
      "Hashtag": "#automotiveshop",
      "USA_CST": "high",
      "Canada_CST": "medium"
    },
    {
      "Keyword": "automotive industry",
      "Hashtag": "#automotivetechnician",
      "USA_CST": "medium",
      "Canada_CST": "low"
    },
    ...
  ]
}
Notes:

Provide exactly 50 "automotive related "keywords and hashtags per platform.
Include both Keyword and Hashtag for Meta and TikTok entries.
Include USA_CST (Customer Search Trend) and Canada_CST (Customer Search Trend) for each entry. Use values: high, medium, or low.
Ensure accurate representation of search trends based on platform usage and regional interest.
```
  // Call the function
  const data = await promptChatGPT(prompt);

  if (!data) {
    console.error('Failed to get data from ChatGPT');
    return;
  }

  const parsedData = JSON.parse(data);

  if (!parsedData.Meta || !parsedData.Craigslist || !parsedData.TikTok) {
    console.error('Invalid API response structure');
    return;
  }

  const metaData = parsedData.Meta.map((item, index) => ({
    Platform: 'Meta (Facebook & Instagram)',
    Rank: index + 1,
    Keyword: item.Keyword,
    Hashtag: item.Hashtag,
    USA_CST: item.USA_CST,
    Canada_CST: item.Canada_CST
  }));

  const craigslistData = parsedData.Craigslist.map((item, index) => ({
    Platform: 'Craigslist',
    Rank: index + 1,
    Keyword: item.Keyword,
    Hashtag: '',
    USA_CST: item.USA_CST,
    Canada_CST: item.Canada_CST
  }));

  const tiktokData = parsedData.TikTok.map((item, index) => ({
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
};

// Schedule the task to run every hour
cron.schedule('0 * * * *', generateAndSendCSV);
