const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are admin-only
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router.put('/:id/reset-password', resetPassword);
router.put('/:id/toggle-status', toggleUserStatus);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
