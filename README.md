# Automotive Keywords and Hashtags CSV Generator

This script generates a CSV file containing the top 50 most searched automotive-related keywords and hashtags on Meta (Facebook & Instagram), Craigslist, and TikTok. The CSV file is generated every 5 minutes and emailed to specified recipients.

## Prerequisites

- Node.js installed on your machine
- A Gmail account with an App Password

## Setup

1. Clone the repository or download the script files to your local machine.

2. Navigate to the project directory:

    ```sh
    cd /path/to/your/project
    ```

3. Install the required dependencies:

    ```sh
    npm install axios json2csv fs node-cron nodemailer
    ```

4. Update the script with your Gmail address and Gmail App Password:

Open .env and replace`'GMAIL_USER'` with your gmail address you want to use as sender gmail and `'GMAIL_PASS'` with your gmail App Password
Note: The gmail app password can be goten by going to google account management dashboard and searching "app password" and click on it and follow the wizard to generate your app password (if you wish to send the email from your gmail)



## Usage

To run the script, use the following command:

```sh
node index.js
