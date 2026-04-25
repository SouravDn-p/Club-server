import multer, { Options } from 'multer';

const memoryStorage = multer.memoryStorage();

export const imageMulterOptions: Options = {
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
};

export const pdfMulterOptions: Options = {
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
};

// Accepts images (poster1, poster2) AND PDFs (pdf field) — used by film-notes
export const filmNoteMulterOptions: Options = {
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';

    if (!isImage && !isPdf) {
      return cb(new Error('Only image or PDF files are allowed'));
    }
    cb(null, true);
  },
};
