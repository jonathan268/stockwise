const express = require("express");
const router = express.Router();

const {
    getFournisseur,
    getFournisseurById,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,

} = require("../controllers/fournisseurController");

router.get("/", getFournisseur);
router.get("/:id", getFournisseurById);
router.post("/", createFournisseur);
router.put("/:id", updateFournisseur);
router.delete("/:id", deleteFournisseur);

module.exports = router;