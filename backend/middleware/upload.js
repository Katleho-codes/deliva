import multer from "multer";

// store in memory, we'll stream straight to OBS
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG and WebP allowed"));
        }
        cb(null, true);
    },
});

export default upload;
