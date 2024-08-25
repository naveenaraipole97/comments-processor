const express = require('express');
const router = express.Router();
const { getCommentById, getAllComments, createComment, updateComment, deleteComment } = require('../controllers/commentsController');

// Define routes
router.get('/:transcriptId/:commentId', getCommentById);
router.get('/:transcriptId', getAllComments);
router.post('/', createComment);
router.put('/:transcriptId/:commentId', updateComment);
router.delete('/:transcriptId/:commentId', deleteComment);

module.exports = router;
