const sdk = require("node-appwrite");
const nodemailer = require('nodemailer')

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
  const client = new sdk.Client();

  // You can remove services you don't use
  const account = new sdk.Account(client);
  const functions = new sdk.Functions(client);
  const users = new sdk.Users(client);

  if (
    !req.variables['APPWRITE_FUNCTION_ENDPOINT'] ||
    !req.variables['APPWRITE_FUNCTION_API_KEY']
  ) {
    console.warn("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    client
      .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
      .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
      .setKey(req.variables['APPWRITE_FUNCTION_API_KEY'])
      .setSelfSigned(true);
  }

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: req.variables['SENDER_EMAIL_ID'],
        pass: req.variables['EMAIL_APP_PASSWORD']
    }
  })

  const data = JSON.parse(req.variables['APPWRITE_FUNCTION_DATA']);

  console.log(data)
  
  var mailOptions = {
      from: req.variables['SENDER_EMAIL_ID'],
      to: data.mailTo,
      subject: 'Welcome to Our Platform : HungerZero!',
      html: `
    <html>
      <head>
        <style>
          /* Define your CSS styles here */
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333;
          }
          h1 {
            color: #ff6600;
          }
          p {
            font-size: 16px;
          }
          .container {
            margin-top: 20px;
            padding: 10px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .welcome-message {
            margin-bottom: 10px;
          }
          .user-details {
            margin-bottom: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to Our Platform!</h1>
        <div class="container">
          <p class="welcome-message">Congratulations! You have successfully registered on our platform.</p>
          <p class="user-details">Here are your registration details:</p>
          <ul>
            <li><strong>Name:</strong> ${data.name}</li>
            <li><strong>Email:</strong> ${data.mailTo}</li>
            <!-- Add more user details if needed -->
          </ul>
          <p>Thank you for joining us. We're excited to have you on board!</p>
        </div>
      </body>
    </html>
      ` 
  }

  transporter.sendMail(mailOptions, function(error, info) {
      if(error){
          console.log(error)
          res.json({
            areDevelopersAwesome: true,
            send: "fail",
            error: error
          });
      }else{
          console.log('Eamil sent: ' + info.response)
          res.json({
            areDevelopersAwesome: true,
            send: "success"
          });
      }
  })
};
