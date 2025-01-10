# Automotive Keywords and Hashtags CSV Generator

This script generates a CSV file containing the top 50 most searched automotive-related keywords and hashtags on Meta (Facebook & Instagram), Craigslist, and TikTok. The CSV file is generated every hour and emailed to specified recipients.

## Prerequisites

- Node.js installed on your machine
- A Gmail account with an App Password
- OpenAI API key

## Setup

1. Clone the repository or download the script files to your local machine.

2. Navigate to the project directory:

    ```sh
    cd /path/to/your/project
    ```

3. Install the required dependencies:

    ```sh
    npm install
    ```

4. Create a [.env](http://_vscodecontentref_/1) file in the project directory and add the following environment variables:

    ```plaintext
    GMAIL_USER="your_gmail_account@gmail.com"
    GMAIL_PASS="your_gmail_app_password"
    OPENAI_API_KEY="your_openai_api_key"
    ```

## Usage

1. To run the script manually, use the following command:

    ```sh
    node index.js
    ```

2. The script is scheduled to run every hour using `node-cron`. You can modify the schedule by updating the cron expression in the [index.js](http://_vscodecontentref_/2) file:

    ```javascript
    cron.schedule('0 * * * *', generateAndSendCSV);
    ```

3. The script will generate a CSV file containing the top 50 most searched automotive-related keywords and hashtags for Meta (Facebook & Instagram), Craigslist, and TikTok. The CSV file will be saved in the project directory with a timestamped filename (e.g., `output_1633024800000.csv`).

4. The generated CSV file will be emailed to the specified recipients. You can update the recipients in the `sendEmail` function in the [index.js](http://_vscodecontentref_/3) file:

    ```javascript
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'recipient1@example.com, recipient2@example.com, recipient3@example.com',
      subject: 'Automotive Keywords and Hashtags CSV',
      text: 'Please find the attached CSV file containing the latest automotive keywords and hashtags.',
      attachments: [
        {
          filename: 'output.csv',
          path: csvFilePath
        }
      ]
    };
    ```

## Code Overview

### Dependencies

- `axios`: For making HTTP requests to the OpenAI API.
- `json2csv`: For converting JSON data to CSV format.
- `fs`: For file system operations.
- `node-cron`: For scheduling the script to run at specified intervals.
- `nodemailer`: For sending emails with the generated CSV file.
- `dotenv`: For loading environment variables from a [.env](http://_vscodecontentref_/4) file.

### Functions

- `sendEmail(csvFilePath)`: Sends an email with the generated CSV file as an attachment.
- `promptChatGPT(prompt)`: Makes a POST request to the OpenAI API with the specified prompt and returns the response.
- `generateAndSendCSV()`: Generates the CSV file by fetching data from the OpenAI API, converts the data to CSV format, saves the file, and sends it via email.

### Scheduling

The script is scheduled to run every hour using `node-cron`. You can modify the schedule by updating the cron expression in the [index.js](http://_vscodecontentref_/5) file.

## Example Output

The generated CSV file will contain the following columns:

- Platform
- Rank
- Keyword
- Hashtag
- USA_CST
- Canada_CST

Example CSV content:

```csv
Platform,Rank,Keyword,Hashtag,USA_CST,Canada_CST
Meta (Facebook & Instagram),1,automotive parts,#automotiveparts,high,medium
Meta (Facebook & Instagram),2,automotive repairs,#automotiverepair,medium,low
...
Craigslist,1,automotive jobs,,medium,low
Craigslist,2,automotive paint,,high,medium
...
TikTok,1,walmart automotive,#automotiveshop,high,medium
TikTok,2,automotive industry,#automotivetechnician,medium,low
...
