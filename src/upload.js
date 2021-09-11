const AWS = require("aws-sdk")
const s3= new AWS.S3();
var Jimp = require('jimp');
const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME

module.exports.handler= async(event)=>{
    console.log(event)

    const response = {
        isBase64Encoded:false,
        statusCode: 200,
        body: JSON.stringify({
        message:"Upload success"
        })
    }
    try{
     const parsedBody = JSON.parse(event.body);
     const base64File = parsedBody.file;
     const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
     if (parsedBody.x && parsedBody.y){
        const resizedFile=Jimp.read(decodedFile, (err, image) => {
            if (err){
                    return response = {
                        isBase64Encoded:false,
                        statusCode: 500,
                        body: JSON.stringify({
                            message:"Upload failed",err
                        })
            } 
        }
              image.resize(x,y)
                .getBase64(jimp.MIME_JPEG, function (err, src) {
                  return src;
                }) 
            })
        const decodeResizedFile=Buffer.from(resizedFile.replace(/^data:image\/\w+;base64,/, ""), "base64");
                    const params = {
                        Bucket:BUCKET_NAME,
                        Key:`images/${new Date().toISOString()}-resized.jpeg`,
                        Body: decodeResizedFile,
                        ContentType: "image/jpeg"
                        };
                        const uploadResult = await s3.upload(params).promise();
                        response.body= JSON.stringify({
                        message:"Upload success",uploadResult
                        })
     }else{
        const params = {
            Bucket:BUCKET_NAME,
            Key:`images/${new Date().toISOString()}.jpeg`,
            Body: decodedFile,
            ContentType: "image/jpeg"
            };
            const uploadResult = await s3.upload(params).promise();
            response.body= JSON.stringify({
            message:"Upload success",uploadResult
            })
     }
     
    
    }catch(err){
    console.log(err)
    response.body = JSON.stringify({
    message:"Upload failed",err
    })
    response.statusCode=500
    }
    return response;
}