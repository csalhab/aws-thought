//To begin we'll need to create a route, process the image file, and upload to the S3 bucket. We'll include express, multer, and aws-sdk at the top of the image-upload.js file, as follows:
const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const paramsConfig = require("../utils/params-config");

//We'll use the package multer to provide the middleware for handling multipart/form-data, primarily used for uploading files. The multer package will add a file property on the req object that contains the image file uploaded by the form, as we shall soon see.

//With multer we'll create a temporary storage container that will hold the image files until it is ready to be uploaded to the S3 bucket. Under the imported constants that we just created, add the following statement:
const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

//Next we'll declare the upload object, which contains the storage destination and the key, image, using the following expression:
// image is the key!
const upload = multer({ storage }).single("image");

//We'll use the preceding function, upload, to store the image data from the form data received by the POST route. We'll use the single method to define this upload function will only receive one image. We'll also define the key of image object as image.

//Next, we'll instantiate the service object, s3, to communicate with the S3 web service, which will allow us to upload the image to the S3 bucket. See the following code for an example:
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
});
//We locked the version number as a precautionary measure in case the default S3 version changes. This way the code we write has a lower chance of breaking due to default version changes to the API.

//Create the Image Upload Route
//With all the necessary dependencies set up now, create the route in the following statement:
router.post("/image-upload", upload, (req, res) => {
  console.log("post('/api/image-upload'", req.file);

  // set up params config:
  const params = paramsConfig(req.file);
  //In the preceding expression, we retrieved the image file object, req.file, from the route using multer. We assigned the returned object from the paramsConfig function to the params object.

  // set up S3 service call
  //Next, use the s3 service interface object we instantiated previously with the aws-sdk package to call the upload() method—as shown in the following S3 service call:
  s3.upload(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    res.json(data); //send the data retrieved from S3 back to the client
    //The data will contain the image file's metadata, including the URL, bucket name, file name, and more.
  });
});
//Note that the preceding endpoint will be located at localhost:3000/api/image-upload. We'll use a POST method to securely transfer the request body. We include the upload function as the second argument to define the key and storage destination. In the route's function block we need to configure params, so that the S3 will know the bucket name as well as the image's file name.

//so that all this can be exposed
module.exports = router;
