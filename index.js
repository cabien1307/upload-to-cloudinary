const express = require("express");
const cloudinary = require("cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const fs = require('fs');

const app = express();


app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const {
    CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, 'public/uploads')
    // },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const upload = multer({ storage });

// upload.array("images") ------ images is a name of key form-data
app.post("/images", upload.array("images"), async (req, res) => {
    try {
        let files = req.files;
        const urls = []
        if (!files)
            return res.status(400).json({ message: "No picture attached!" });

        for (const file of files) {
            const { path } = file;
            const newPath = await cloudinary.v2.uploader.upload(path, {
                resource_type: "auto",
                folder: "Images"
            })
            urls.push(newPath)
            // unlink file in temps directory
            fs.unlinkSync(path)
        }

        res.status(200).json({
            message: 'images uploaded successfully',
            data: urls
        })

        // other case
        //     let multiplePicturePromise = pictureFiles.map((picture) =>
        //         cloudinary.v2.uploader.upload(picture.path)
        //     );
        // // await all the cloudinary upload functions in promise.all, exactly where the magic happens
        //      let imageResponses = await Promise.all(multiplePicturePromise);
        //         res.status(200).json({ images: imageResponses });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`App listen at port ${PORT}`)
)
