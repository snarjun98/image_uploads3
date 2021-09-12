const AWS = require("aws-sdk")
const s3= new AWS.S3();
var Jimp = require('jimp');
const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME

module.exports.handler= async(event)=>{

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
         console.log("inside if")
        // const result= await Jimp.read(decodedFile, (err, image) => {
        //     console.log("inside jimp fun")
        //       image.resize(parsedBody.x,parsedBody.y)
        //         .getBase64(Jimp.AUTO)
                   
                
            // })
            // const result = await Jimp.read(decodedFile).then((image)=>{
            //    image.resize(parsedBody.x,parsedBody.y).getBuffer(Jimp.AUTO,async function(err,decodeResizedFile){
            //     console.log("decoded file",decodeResizedFile)
            //                 const params = {
            //                     Bucket:BUCKET_NAME,
            //                     Key:`images/${new Date().toISOString()}.jpeg`,
            //                     Body: decodeResizedFile,
            //                     ContentType: "image/jpeg"
            //                     };
            //                     const uploadResult = await s3.upload(params).promise();
            //                     response.body= JSON.stringify({
            //                     message:"Upload success",uploadResult
            //                     })
            //                     console.log(uploadResult)
            //                     return uploadResult
            //    })
            // })
            // const resizedImage = result.getBase64(Jimp.AUTO)
            // console.log(resizedImage);
            const image = await Jimp.read(decodedFile)
           const resizeImage= await image.resize(parsedBody.x, parsedBody.y);
            const resizeBuffer = await resizeImage.getBufferAsync(Jimp.AUTO);
             console.log("image",image)
             console.log("resizeImage",resizeImage)
             console.log("resizeBuffer",resizeBuffer)
             const params = {
                                    Bucket:BUCKET_NAME,
                                    Key:`images/${new Date().toISOString()}.jpeg`,
                                    Body: resizeBuffer,
                                    ACL:"public-read",
                                    ContentType: "image/jpeg"
                                    };
                                    const uploadResult = await s3.upload(params).promise()
                                    console.log(uploadResult)
                                    response.body= JSON.stringify({
                                    message:"Upload success",
                                    link: uploadResult.Location
                                    })   
            return response;
            }
        
     else{
        const params = {
            Bucket:BUCKET_NAME,
            Key:`images/${new Date().toISOString()}.jpeg`,
            Body: decodedFile,
            ContentType: "image/jpeg"
            };
            const uploadResult = await s3.upload(params).promise();
            response.body= JSON.stringify({
            message:"Upload success",
            link: uploadResult.Location
            })
            return response;
     }
    }catch(err){
    console.log(err)
    response.body = JSON.stringify({
    message:"Upload failed",err
    })
    response.statusCode=500
    return response;
    }
    
}