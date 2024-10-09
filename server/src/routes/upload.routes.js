const express = require('express');
const isAuthenticated = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();
router.use(isAuthenticated);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg, and .jpeg format allowed!'));
        }
    },
});

// Error handling middleware for multer
function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
}

router.post('/upload', upload.single('file'), multerErrorHandler, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        res.status(200).send({
            imageUrl: `/uploads/${req.file.filename}`,
            message: 'Image uploaded successfully!',
        });
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
