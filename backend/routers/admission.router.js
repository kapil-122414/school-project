const express = require("express");
const router = express.Router();
const auth = require("../middelware/auth.middleware");
const upload = require("../middelware/upload.middleware");

const {
  admissionNew,
  allAdmissions,
  oneAdmission,
  updateAdmission,
  promoteStudent,
  studentHistory,
  getStudentImage,
  updateStudentImage,
  updateStudent,
  getAllStudents,
} = require("../controllers/admission.controller");

router.post("/admission", auth, upload.single("avatar"), admissionNew);
router.get("/admissions", auth, allAdmissions);
router.get("/admission/:id", auth, oneAdmission);
router.patch("/admission/:id", auth, updateAdmission);
router.post("/promote/:studentId", auth, promoteStudent);
router.get("/history/:studentId", auth, studentHistory);

router.get("/students", auth, getAllStudents);
router.patch("/student/:id", auth, updateStudent);

router.get("/student/image/:id", getStudentImage);
router.patch("/student/image/:id", auth, upload.single("avatar"), updateStudentImage);

module.exports = router;