//This file has a singular purpose: to return a configured params object. We'll use a package called uuid that will generate a unique 36-character alphanumeric string, which we'll use as the image file names.

const { v4: uuidv4 } = require("uuid");

const params = (fileName) => {
  const myFile = fileName.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const imageParams = {
    Bucket: "user-images-229fe91c-b0dd-4804-8da6-2f4b65a62d0b",
    Key: `${uuidv4()}.${fileType}`,
    Body: fileName.buffer,
  };

  return imageParams;
};
/*
In the preceding function expression, the params function receives a parameter called fileName, which this function will receive as an argument from the Express route.

Once we store the reference to the fileType, we'll declare imageParams.

We must define three properties of imageParams. The Bucket, Key, and Body properties to connect to S3. We'll assign the Bucket with the name of the S3 bucket we created previously. Next we'll assign the Key property, which is the name of this file. We use the uuidv4() to ensure a unique file name. We'll also add the file extension from fileType. Next is the Body property, which we assign the buffer property of the image. This is the temporary storage container of the image file. Once the buffer has been used, the temporary storage space is removed by multer.
*/

//All that's left is to add the module.exports expression to expose the imageParams. Add the following statement at the bottom of the params-config.js file:
module.exports = params;
