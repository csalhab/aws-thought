//load the seed data file

const AWS = require("aws-sdk");
const fs = require("fs");

//Again we'll use the aws-sdk to create the interface with DynamoDB. We'll also be using the file system package to read the users.json file, as shown in the following example:
AWS.config.update({
  region: "us-east-2",
  //endpoint: "http://localhost:8000", //commented out prepping for AWS deployment
});
const dynamodb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

//This is similar to the CreateThoughtsTable.js configuration, with one key distinction. We'll use the DocumentClient() class this time to create the dynamodb service object. This class offers a level of abstraction that enables us to use JavaScript objects as arguments and return native JavaScript types. This constructor helps map objects, which reduces impedance mismatching and speeds up the development process. We'll be using this class for most of the database calls in this project.

//In the next step, we'll use the fs package to read the users.json file and assign the object to the allUsers constant, as follows:
console.log("Importing thoughts into DynamoDB. Please wait.");
const allUsers = JSON.parse(
  fs.readFileSync("./server/seed/users.json", "utf8")
);

//Next we'll loop over the allUsers array and create the params object with the elements in the array, as follows:
allUsers.forEach((user) => {
  const params = {
    TableName: "Thoughts",
    Item: {
      username: user.username,
      createdAt: user.createdAt,
      thought: user.thought,
    },
  };

  //While still in the loop, we make a call to the database with the service interface object, dynamodb, as shown in the following code:

  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to add thought",
        user.username,
        ". Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("PutItem succeeded:", user.username);
    }
  });
  //In the preceding statement, we used the same pattern that we used to create the table, but this time we used the put method.
});
