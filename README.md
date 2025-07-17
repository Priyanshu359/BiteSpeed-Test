This project is a backend API built using Node.js, Express, and MySQL to solve the Bitespeed Backend Task. The task involves identity resolution: given an email or phone number (or both), the API determines the user's primary identity and links related secondary records in the database.

The project is deployed at:

🔗 API Base URL: https://bitespeed-test-18zn.onrender.com

📦 Database: Hosted on freesqldatabase.com

How to Test via Postman
Open Postman.

Set the request type to POST.

URL:
https://bitespeed-test-18zn.onrender.com/identify

In the Body tab:
Select raw and choose JSON.

Enter a valid payload like:
```
{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}
```
Click Send.

🚀 Endpoint
POST /identify
Description: Accepts a phone number and/or email and returns the primary contact with all linked contact IDs.

✅ Request Body (JSON)
```json
{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}
```
You can send either:

Only email

Only phoneNumber

Or both

🔁 Sample Response
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2, 3]
  }
}
```
