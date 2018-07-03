'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Match = require('../models/match');
const Comment = require('../models/comment');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/matches/:id/comments', (req, res) => {
  const { id } = req.params;

  Match.findOne( { _id: id } )
    .select('comments')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        model: 'User'
      }
    })
    .then(results => {
      res.json(results);
    });
});

/* ========== GET/READ SINGLE ITEMS ========== */
// router.get('/matches/:id/comments/:commentId', (req, res) => {
//   const { id } = req.params;
//   const { commentId } = req.params;
//   console.log('commentId', commentId);

//   Match.findOne( { _id: id } )
//     .then((match) => {
//       const commentbyId = match.comments.find((id) => id === commentId);
//       console.log('LOOOOK', commentbyId);
//       return commentbyId;
//     })
//     // .select('comments')
//     // .populate({
//     //   path: 'comments',
//     //   populate: {
//     //     path: 'userId',
//     //     model: 'User'
//     //   }
//     // })
//     .then(results => {
//       res.json(results);
//     });
// });

/* ========== POST/CREATE NEW ITEMS ========== */
router.post('/matches/:id/comments', (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const newItem = { content, userId };

  /***** Never trust users - validate input *****/
  if (!content) {
    const err = new Error('Please fill out the form to leave a comment');
    err.status = 400;
    return next(err);
  }

  Match.findById(id)
    .then((match) => {
      Comment.create(newItem)
        .then((comment) => {
          match.comments.push(comment);
          match.save()
            .then((result) => {
              Match.findById(id)
                .populate({
                  path: 'comments',
                  populate: {
                    path: 'userId',
                    model: 'User'
                  }
                })
                .then(comments => {
                  res.json(comments);
                });
            });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

/* ========== PUT/EDIT ITEMS ========== */
// router.put('/matches/:id/comments/:commentId', (req, res, next) => {
//   const { id } = req.params;
//   const { commentId } = req.params;
//   console.log('req.params', commentId);
//   const { content } = req.body;
//   const userId = req.user.id;

//   const updatedItem = { content, userId };

//   /***** Never trust users - validate input *****/
//   // if (!content) {
//   //   const err = new Error('Please fill out the form to leave a comment');
//   //   err.status = 400;
//   //   return next(err);
//   // }

//   // console.log(match.comments.length);
      

//   // const commentById = match.comments.find((id) => id === commentId);
//   // console.log(commentById);
//   // res.json(match);

//   Match.findById(id)
//     .then((match) => {
//       for(let i = 0; i < match.comments.length; i++) {
//         console.log('looping thru array', match.comments[i]);
//         if(match.comments[i] === req.params.commentId) {
//           const commentById = match.comments[i];
//           console.log('found it', match.comments[i]);
//           return commentById;
//         }
//       }
//     })
//     .then((comment) => {
//       console.log(comment);
//     });
  

//   // Match.findById(id)
//   //   .then((match) => {
//   //     console.log(match)
//   //   })
//   //     Comment.findById(commentId)
//   //     .then((comment) => {
//   //       console.log('this should match commentId', comment);
//   //     })
//   //     Comment.updateOne(updatedItem)
//   //       .then((comment) => {
//   //         match.comments.push(comment);
//   //         match.save()
//   //           .then((result) => {
//   //             Match.findById(id)
//   //               .populate({
//   //                 path: 'comments',
//   //                 populate: {
//   //                   path: 'userId',
//   //                   model: 'User'
//   //                 }
//   //               })
//   //               .then(comments => {
//   //                 res.json(comments);
//   //               });
//   //           });
//   //       });
//   //   })
//   //   .catch(err => {
//   //     console.error(err);
//   //     res.status(500).json({message: 'Internal server error'});
//   //   });
// });

/* ========== DELETE/SINGLE ITEM ========== */
// router.delete('/matches/:id/comments/:commentId', (req, res) => {
//   const { id } = req.params;
//   const { commentId } = req.params;

//   Match.findOne( { _id: id } )
//     .then((match) => {
//       Comment.findByIdAndRemove(commentId);
//     })
//     // .select('comments')
//     // .populate({
//     //   path: 'comments',
//     //   populate: {
//     //     path: 'userId',
//     //     model: 'User'
//     //   }
//     // })
//     .then(results => {
//       console.log(results);
//       res.json(results);
//     });
// });


module.exports = router;