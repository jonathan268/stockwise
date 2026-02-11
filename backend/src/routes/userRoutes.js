const express = require('express');
const router = express.Router();

const {
    getUser,
    getUserById,
    updateUser,
    deleteUser,
} = require ("../controllers/userController");

router.get("/", getUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
