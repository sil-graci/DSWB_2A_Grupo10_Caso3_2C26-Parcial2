import express from "express";

const router = express.Router();

router.get("/vista", (req, res) => {
  res.render("reservas");
});

export default router;