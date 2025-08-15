import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
        cb(null, file.originalname); // ✅ Save as original filename (OK)
    },
}); 

const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // ✅ Normalize extension
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return cb(new Error(`Unsupported file type: ${ext}`), false); // ✅ Corrected argument order
    }
    cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // ✅ 50 MB
    fileFilter,
});

export default upload;
