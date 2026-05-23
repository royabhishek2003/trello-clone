const multer = require('multer');

// Use memory storage to process files before sending to S3
const storage = multer.memoryStorage();

// File size limits (25MB)
const limits = {
  fileSize: 25 * 1024 * 1024,
  files: 10 // Max 10 files per request
};

// Accept most standard file types for a Trello clone
const fileFilter = (req, file, cb) => {
  // Prevent potentially dangerous executables
  const dangerousMimeTypes = [
    'application/x-msdownload',
    'application/x-executable',
    'application/x-sh',
    'application/javascript',
    'text/html'
  ];

  if (dangerousMimeTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }

  // Prevent dangerous file extensions
  const dangerousExtensions = /\.(exe|sh|bat|cmd|js|html)$/i;
  if (dangerousExtensions.test(file.originalname)) {
    return cb(new Error('File extension not allowed'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter
});

module.exports = upload;
