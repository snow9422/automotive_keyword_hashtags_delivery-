# Automotive Keywords and Hashtags CSV Generator

This script generates a CSV file containing the top 50 most searched automotive-related keywords and hashtags on Meta (Facebook & Instagram), Craigslist, and TikTok. The CSV file is generated every hour and emailed to specified recipients.

## Prerequisites

- Node.js installed on your machine.
- A Gmail account with an App Password.
- OpenAI API key.

## Setup

1. **Clone the Repository**  
   Clone the repository or download the script files to your local machine.

2. **Navigate to the Project Directory**  
   Open a terminal and navigate to the project directory:
   ```sh
   cd /path/to/your/project
   ```

3. **Install Dependencies**  
   Install the required dependencies by running:
   ```sh
   npm install
   ```

4. **Create a `.env` File**  
   Create a `.env` file in the project directory and add the following environment variables:
   ```plaintext
   GMAIL_USER="your_gmail_account@gmail.com"
   GMAIL_PASS="your_gmail_app_password"
   OPENAI_API_KEY="your_openai_api_key"
   ```

5. **Run the Script Manually**  
   To run the script manually, use the following command:
   ```sh
   node index.js
   ```

## Usage

### Scheduled Execution
The script is scheduled to run every hour using `node-cron`. You can modify the schedule by updating the cron expression in the `index.js` file:
```javascript
cron.schedule('0 * * * *', generateAndSendCSV);
```

### CSV File Generation
The script generates a CSV file containing the top 50 most searched automotive-related keywords and hashtags for Meta (Facebook & Instagram), Craigslist, and TikTok. The CSV file is saved in the project directory with a timestamped filename (e.g., `output_1633024800000.csv`).

### Emailing the CSV File
The generated CSV file is emailed to the specified recipients. You can update the recipients in the `sendEmail` function in the `index.js` file:
```javascript
const mailOptions = {
  from: process.env.GMAIL_USER,
  to: 'recipient1@example.com, recipient2@example.com, recipient3@example.com',
  subject: 'Automotive Keywords and Hashtags CSV',
  text: 'Please find the attached CSV file containing the latest automotive keywords and hashtags.',
  attachments: [
    {
      filename: 'output.csv',
      path: csvFilePath,
    },
  ],
};
```

## Troubleshooting

- Ensure that your `.env` file contains the correct Gmail credentials and OpenAI API key.
- Check the console output for any error messages and resolve them accordingly.
- Verify that the required dependencies are installed by running:
  ```sh
  npm install
