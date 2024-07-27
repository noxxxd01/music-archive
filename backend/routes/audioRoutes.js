import express from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import Track from "../models/trackSchema.js";

const router = express.Router();

// Configure multer to use memory storage and check file types
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "audio") {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== ".mp3") {
        return cb(new Error("Only MP3 files are allowed for audio"), false);
      }
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files["audio"] || !req.files["thumbnail"]) {
        return res
          .status(400)
          .json({ error: "Both audio (MP3) and thumbnail files are required" });
      }

      if (!req.body.title || !req.body.artist) {
        return res.status(400).json({ error: "Title and artist are required" });
      }

      // Upload audio file to Cloudinary
      const audioFile = req.files["audio"][0];
      const audioResult = await cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "audio_uploads" },
          (error, result) => {
            if (error) {
              throw error;
            }
            return result;
          }
        )
        .end(audioFile.buffer);

      // Upload thumbnail file to Cloudinary
      const thumbnailFile = req.files["thumbnail"][0];
      const thumbnailResult = await cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "thumbnail_uploads" },
          (error, result) => {
            if (error) {
              throw error;
            }
            return result;
          }
        )
        .end(thumbnailFile.buffer);

      // Create and save track in MongoDB
      const track = new Track({
        title: req.body.title,
        artist: req.body.artist,
        thumbnail: thumbnailResult.secure_url,
        audioUrl: audioResult.secure_url,
      });

      await track.save();

      res.status(201).json({ message: "Track uploaded successfully", track });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred during upload" });
    }
  }
);

// Fetch all tracks
router.get("/tracks", async (req, res) => {
  try {
    const tracks = await Track.find();
    res.status(200).json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching tracks" });
  }
});

// Route to fetch a single track by ID
router.get("/tracks/:id", async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    res.status(200).json(track);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the track" });
  }
});

export default router;
