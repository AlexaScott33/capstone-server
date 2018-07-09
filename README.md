# [WPL Rugby Commentators](https://wpl-rugby-commentators.netlify.com/)

## View the Frontend code here:
https://github.com/AlexaScott33/capstone-client

## Running Locally

* Clone this repository: `git clone https://github.com/AlexaScott33/capstone-server.git`

* Move into the project directory: `cd capstone-server/`
* Install the dependencies: `npm install`
* Connect to MongoDB:
    * in a new terminal window, run: `mongod`
* Run the development task: `npm start`
    * Starts a server running at http://localhost:8080

## Resources

### Users

* POST (/users)
    * Register new user <br />
        requires: username, password <br />
        responds with username, password

### Auth

* POST (/login)
    * Login existing user <br />
        requires: username, password <br />
        responds with authToken

### Matches

* GET (/matches)
    * Get all matche
        requires: authToken <br />
        responds with all matches
        populates all comments

* GET (/matches/:id)
    * Get single match by id
        requires: authToken, match id (req.params.id) <br />
        responds with details for single match

* GET (/matches/:id/comments)
    * Get all comments for single match
        requires: authToken, match id (req.params.id) <br />
        responds with all comments for specific match
        populates associated user for each comment   

* POST (/matches/:id/comments)
    * Creates new comment for specific match
        requires: authToken, match id (req.params), content (req.body), user id (req.user) <br />
        responds with all comments for specific match

## Schemas

### User

<img width="433" alt="screen shot 2018-07-09 at 3 15 32 pm" src="https://user-images.githubusercontent.com/35544816/42478838-0f0587e8-838b-11e8-93ff-1215d0b3af77.png">

### Match

<img width="573" alt="screen shot 2018-07-09 at 3 15 41 pm" src="https://user-images.githubusercontent.com/35544816/42478875-2ea9c65e-838b-11e8-8f37-3ee9c873eaf7.png">

### Comment

<img width="691" alt="screen shot 2018-07-09 at 3 15 49 pm" src="https://user-images.githubusercontent.com/35544816/42478888-3f1c68e8-838b-11e8-8b7b-6f44bfb2c284.png">