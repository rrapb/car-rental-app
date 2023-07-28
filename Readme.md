## Car Rental Application
This repository contains a simple Car Rental application built with Node.js, Express.js, and MongoDB. The application provides basic functionalities for user registration, user login, accessing user profile, and querying rental cars based on various parameters. The application uses validation with Joi to ensure that incoming data follows specific requirements.
	
## Prerequisites
To run this application, you need to have the following installed on your system:

- Node.js (https://nodejs.org)
- MongoDB (https://www.mongodb.com/)
	
## Getting Started
Follow the steps below to start and test the application:

```bash
Clone the repository:
git clone https://github.com/your-username/car-rental-app.git
cd car-rental-app

Start the application:
node rent
The server will run on http://localhost:3000.

```
Testing the Application

```
The application exposes the following endpoints: 

(Examples)
POST /register: Register a new user. Send a POST request to /register with the following JSON data:
{
  "fullName": "Behamics US",
  "email": "behamics@test.com",
  "username": "behamics",
  "password": "behamicstest"
}

POST /login: Log in as an existing user. Send a POST request to /login with the following JSON data:
{
  "username": "behamics",
  "password": "behamicstest"
}
Upon successful login, you will receive a JSON response containing a JWT token.

GET /my-profile: Access user profile. Send a GET request to /my-profile with the JWT token obtained
from the login response in the Authorization header.

GET /rental-cars: Query rental cars based on parameters. Send a GET request to /rental-cars with optional query parameters:

year: Filter cars by year (e.g., /rental-cars?year=2020).
color: Filter cars by color (e.g., /rental-cars?color=red).
steeringType: Filter cars by steering type (e.g., /rental-cars?steeringType=manual).
numberOfSeats: Filter cars by the number of seats (e.g., /rental-cars?numberOfSeats=4).
