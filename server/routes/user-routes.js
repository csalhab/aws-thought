//import express and use the Router() to create the routes, as follows:
const express = require("express");
const router = express.Router();

//Configure the service interface object as follows:
const AWS = require("aws-sdk");
const awsConfig = {
  region: "us-east-2",
  //endpoint: "http://localhost:8000", //commented out prepping for AWS deployment
};
AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = "Thoughts";
/*
In the preceding code, we're using some familiar configuration assignments to connect with the local DynamoDB instance. The endpoint property in awsConfig points to the local DynamoDB instance. We use the DocumentClient class to use native JavaScript objects to interface with the dynamodb service object. We're also setting the table value to "Thoughts".
*/
/*
Why did we not lock the version number for the DocumentClient class like we did for the DynamoDB class?
While DynamoDB class had two versions, DocumentClient has only one, so there is no need to lock the version number for DocumentClient.
*/

//The route to get all the thoughts of a user should look like the following code block:

//The first route needs the GET method at the /api/users/ endpoint. We'll be retrieving all the users' thoughts from the Thoughts table. See the following code for an example:
router.get("/users", (req, res) => {
  const params = {
    TableName: table,
  };
  //In the preceding statement, we assign "Thoughts" to the TableName property in the params object.

  //Next, we'll pass the params object into the DynamoDB call, as follows:
  // Scan return all items in the table
  dynamodb.scan(params, (err, data) => {
    if (err) {
      res.status(500).json(err); // an error occurred
    } else {
      res.json(data.Items);
    }
  });
  //In the preceding statement, we'll use the scan method to return all the items of the table. We also added a status code in case there was an internal error with retrieving the data from the table. Notice that the data in the table is actually in the Items property of the response, so data.Items was returned.
});

//Create the GET Route to Access All Thoughts from a User
//We need to get all the thoughts for a specific user to populate the user's profile page. We'll get to the profile page by selecting the name of a user on the homepage.

//Let's begin by creating the endpoint using the GET method. Place this route under the previously created route, but before the module.exports expression. Make sure that module.exports remains the last line of this file. See the following code for an example:
router.get("/users/:username", (req, res) => {
  console.log(`Querying for thought(s) from ${req.params.username}.`);
  //});

  //In the preceding route, we'll use query parameters to pass the username from the client to the server. We'll capture the query parameter with the req.params object.

  //Next we'll declare params to define the query call to DynamoDB. We'll use the username retrieved from req.params to provide a condition for the query, because we're only interested in one user. The goal is to find all the thoughts from this user. Begin by declaring params, as shown in the following expression:
  const params = {
    TableName: table,
    KeyConditionExpression: "#un = :user",
    ExpressionAttributeNames: {
      "#un": "username",
      "#ca": "createdAt",
      "#th": "thought",
      "#img": "image", //added the image attribute alias
    },
    ExpressionAttributeValues: {
      ":user": req.params.username,
    },
    ProjectionExpression: "#un, #th, #ca, #img", // add the image to the database response
    ScanIndexForward: false,
  };

  //The KeyConditionExpression property specifies the search criteria.
  //Similar to the WHERE clause in SQL, the KeyConditionExpression property is used to filter the query with an expression.
  //As the name suggests, we can use expressions by using comparison operators such as <, =, <=, and BETWEEN to find a range of values.
  //We need to retrieve all the thoughts from a specific user, so we used the = operator to specify all items that pertain to a single username. The #un and :user symbols are actually aliases that represent the attribute name and value. The #un represents the attribute name username. This is defined in the ExpressionAttributeNames property. While attribute name aliases have the # prefix, the actual value of this key is up to us. DynamoDB suggests using aliases as a best practice to avoid a list of reserved words from DynamoDB that can't be used as attribute names in the KeyConditionExpression. Because words such as time, date, user, and data can't be used, abbreviations or aliases can be used in their place as long as the symbol # precedes it.

  /*
For the same reason, the attribute values can also have an alias, which is preceded by the : symbol. The attribute values also have a property that defines the alias relationship. In this case, the ExpressionAttributeValues property is assigned to req.params.username, which was received from the client. To reiterate, we're using the username selected by the user in the client to determine the condition of the search. This way, the user will decide which username to query.

Next is the ProjectExpression property. This determines which attributes or columns will be returned. This is similar to the SELECT statement in SQL, which identifies which pieces of information is needed. In the preceding code statement, we specify that the thoughts and createdAt attributes should be returned. We didn't add the username, because this value is part of the condition criteria; therefore, this info is redundant and won't be rendered.

Last is the ScanIndexForward property. This property takes a Boolean value. The default setting is true, which specifies the order for the sort key, which will be ascending. The sort key was assigned to the createdAt attribute when we first created the table. Because we want the most recent posts on top, we set the ScanIndexForward property to false so that the order is descending.

Now that the params object is set, we have all the information we need to make the database call to the Thoughts table. Let's use the service interface object, dynamodb, and the query method to retrieve the user's thoughts from the database, by running the following function call:
  */

  dynamodb.query(params, (err, data) => {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Query succeeded.");
      res.json(data.Items);
    }
  });
}); // closes the route for router.get(users/:username)

// Create new user at /api/users
router.post("/users", (req, res) => {
  console.log("hit post!");
  const params = {
    TableName: table,
    Item: {
      username: req.body.username,
      createdAt: Date.now(),
      thought: req.body.thought,
      image: req.body.image,
    },
  };
  //In the preceding route, notice that we set the params object to the form data of the ThoughtForm, which we can access with req.body. Also notice that we use the JavaScript native Date object to set the value of the createdAt property. This is so that we know when this thought from the user was posted. Remember that we used the createdAt property as the sort key, which will help us sort the thoughts chronologically when we want to render them in the profile page.

  // database call
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.json({ Added: JSON.stringify(data, null, 2) });
    }
  });
}); // ends the route for router.post('/users')
//Notice that because we're using the DocumentClient() class to instantiate the service object, dynamodb, the request and response from the database are native JavaScript objects. This greatly simplifies the code and improves the developer experience by sidestepping any impedance mismatch.

//Next, we need to add the following expression to expose the endpoints:
module.exports = router;
