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
  const database = new sdk.Databases(client);
  const functions = new sdk.Functions(client);
  const storage = new sdk.Storage(client);
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

  console.log(req)

  const data = JSON.parse(req.variables['APPWRITE_FUNCTION_DATA']);

  console.log(data)
  
  var mailOptions = {
      from: req.variables['SENDER_EMAIL_ID'],
      to: data.mailTo,
      subject: 'Update: Food Pickup Request',
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
                .status-container {
                  margin-top: 20px;
                  padding: 10px;
                  background-color: #fff;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .status-heading {
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .status-message {
                  margin-bottom: 10px;
                }
              </style>
            </head>
            <body>
              <h1>Food Pickup Request Update</h1>
              <div class="status-container">
                <h2 class="status-heading">Status: ${data.status}</h2>
                <p class="status-message">Your request for Pickup Id : ${data.pickupId} has been ${data.status.toLowerCase()} by the Food provider.</p>
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
            error: error,
            data: data
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
