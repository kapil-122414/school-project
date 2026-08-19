const Student = require("../models/student");
const Admission = require("../models/admission");
const mongoose = require("mongoose");
const institute = require("../models/institude_add");
const programModel = require("../models/addprogram");
const cloudinary = require("../config/cloudinary");
const createAvatar = require("../service/avatar.service");

const baseUrl = (req) => `${req.protocol}://${req.get("host")}`;

const formatStudent = (student, req) => {
  const obj = student.toObject ? student.toObject() : { ...student };
  if (obj.avatar?.url) {
    obj.avatar = {
      ...obj.avatar,
      url: `${baseUrl(req)}/api/student/image/${obj._id}`,
    };
  }
  return obj;
};

const formatAdmission = (admission, req) => {
  const obj = admission.toObject ? admission.toObject() : { ...admission };
  return obj;
};

const formatStudentDetail = (student, admission, req) => {
  return {
    name: student.name,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    image: student.avatar?.url
      ? `${baseUrl(req)}/api/student/image/${student._id}`
      : null,
    father: student.parentInf?.father || null,
    mother: student.parentInf?.mother || null,
    mobileNumber: student.parentInf?.mobileNumber || null,
    rollNo: admission?.academicInf?.rollNo || null,
    section: admission?.academicInf?.section?.sectionName || null,
    session: admission?.academicInf?.session || null,
    program: admission?.academicInf?.program?.program || null,
    programShortName: admission?.academicInf?.program?.shortName || null,
    fee: {
      feePlan: admission?.feeInf?.feePlan?.planName || null,
      totalfee: admission?.feeInf?.totalfee || "0",
      discount: admission?.feeInf?.discount || "0",
      payable: admission?.feeInf?.payable || "0",
    },
    status: student.status,
  };
};

const validateObjectId = (id, field) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${field}`);
  }
};

const getInstitute = async (userId) => {
  const inst = await institute.findOne({ createby: userId });
  if (!inst) throw new Error("Institute not found");
  return inst;
};

const getUserId = (req) => req.user?.Id || req.user?.id || req.user?._id;

const admissionNew = async (req, res) => {
  try {
    const userId = getUserId(req);
    console.log(userId);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const instituteFind = await getInstitute(userId);

    const data = { ...req.body };
    const jsonFields = ["academicInf", "feeInf", "parentInf"];
    for (const field of jsonFields) {
      if (typeof data[field] === "string") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch {
          return res
            .status(400)
            .json({ success: false, message: `Invalid JSON in ${field}` });
        }
      }
    }

    let student;
    const { studentId, ...studentData } = data;

    if (studentId) {
      validateObjectId(studentId, "studentId");
      student = await Student.findOne({
        _id: studentId,
        institute: instituteFind._id,
      });
      if (!student)
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
    } else {
      const { name, gender, dateOfBirth, avatar, parentInf } = studentData;
      if (!name?.trim())
        return res
          .status(400)
          .json({ success: false, message: "Student name is required" });
      if (
        !gender?.trim() ||
        !["Male", "Female", "Other"].includes(gender.trim())
      )
        return res
          .status(400)
          .json({ success: false, message: "Invalid gender" });
      if (!dateOfBirth?.trim())
        return res
          .status(400)
          .json({ success: false, message: "Date of birth is required" });

      let avatarData;
      if (req.file) {
        avatarData = { url: req.file.path, public_id: req.file.filename };
      } else if (avatar?.url) {
        avatarData = avatar;
      } else {
        avatarData = await createAvatar(
          name.trim(),
          new mongoose.Types.ObjectId().toString(),
        );
      }

      student = await Student.create({
        institute: instituteFind._id,
        name: name.trim(),
        gender: gender.trim(),
        dateOfBirth: new Date(dateOfBirth),
        avatar: avatarData,
        parentInf: parentInf || { father: "", mother: "", mobileNumber: "" },
        createdBy: userId,
      });
    }

    const { session, program, section, rollNo } = data.academicInf || {};
    if (!session?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Session is required" });
    if (!session.match(/^\d{4}(-\d{2,4})?$/))
      return res.status(400).json({
        success: false,
        message: "Invalid session format (e.g., 2025-26)",
      });
    validateObjectId(program, "program");

    const programDoc = await programModel.findById(program);
    if (!programDoc)
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });

    if (section && section !== "null" && section !== "undefined") {
      validateObjectId(section, "section");
    }

    const existingAdmission = await Admission.findOne({
      institute: instituteFind._id,
      student: student._id,
      "academicInf.session": session.trim(),
    });
    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: "Admission for this student in this session already exists",
      });
    }

    let finalRollNo = rollNo?.trim();
    if (!finalRollNo) {
      const rawInst = (
        instituteFind.instituteName ||
        instituteFind.instituteId ||
        "INS"
      )
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const instCode =
        rawInst.length >= 3 ? rawInst.slice(0, 3) : rawInst.padEnd(3, "X");
      const sessionYear = session.split("-")[0].replace(/[^0-9]/g, "");
      const rawProg = (programDoc.shortName || programDoc.program || "PRG")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const progCode =
        rawProg.length >= 3 ? rawProg.slice(0, 3) : rawProg.padEnd(3, "X");
      const prefix = `${instCode}${sessionYear}${progCode}`;

      const existing = await Admission.find({
        institute: instituteFind._id,
        "academicInf.rollNo": { $regex: new RegExp(`^${prefix}\\d+$`, "i") },
      }).select("academicInf.rollNo");

      let maxSeq = 0;
      for (const adm of existing) {
        const m = adm.academicInf?.rollNo?.match(
          new RegExp(`^${prefix}(\\d+)$`, "i"),
        );
        if (m && m[1]) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
      }
      finalRollNo = `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
    }

    const dupRoll = await Admission.findOne({
      institute: instituteFind._id,
      "academicInf.session": session.trim(),
      "academicInf.rollNo": finalRollNo,
    });
    if (dupRoll)
      return res.status(400).json({
        success: false,
        message: "Roll number already exists for this session",
      });

    const { feePlan, totalfee, discount, payable } = data.feeInf || {};
    if (feePlan) validateObjectId(feePlan, "feePlan");

    const admission = await Admission.create({
      institute: instituteFind._id,
      student: student._id,
      academicInf: {
        session: session.trim(),
        program,
        section: section || null,
        rollNo: finalRollNo,
      },
      feeInf: {
        feePlan: feePlan || null,
        totalfee: totalfee || "0",
        discount: discount || "0",
        payable: payable || "0",
      },
      status: data.status || "Active",
      createdBy: userId,
    });

    const populated = await Admission.findById(admission._id)
      .populate("student")
      .populate("academicInf.program", "program")
      .populate("academicInf.section", "sectionName")
      .populate("feeInf.feePlan", "planName");

    return res.status(201).json({
      success: true,
      message: "Admission created successfully",
      data: {
        student: formatStudent(populated.student, req),
        admission: formatAdmission(populated, req),
      },
    });
  } catch (error) {
    console.error("ADMISSION ERROR:", error);
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Duplicate entry" });
    return res.status(500).json({ success: false, message: error.message });
  }
};

const allAdmissions = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const instituteFind = await getInstitute(userId);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const { search, program, section, session, status, studentId } = req.query;

    const filter = { institute: instituteFind._id };
    if (studentId) filter.student = studentId;
    if (search)
      filter["academicInf.rollNo"] = { $regex: search, $options: "i" };
    if (program) filter["academicInf.program"] = program;
    if (section) filter["academicInf.section"] = section;
    if (session) filter["academicInf.session"] = session;
    if (status) filter.status = status;

    const [total, admissions] = await Promise.all([
      Admission.countDocuments(filter),
      Admission.find(filter)
        .populate("student", "name avatar gender dateOfBirth parentInf")
        .populate("academicInf.program", "program")
        .populate("academicInf.section", "sectionName")
        .populate("feeInf.feePlan", "planName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: admissions.map((a) => ({
        student: formatStudent(a.student, req),
        admission: formatAdmission(a, req),
      })),
    });
  } catch (error) {
    console.error("ALL ADMISSIONS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const oneAdmission = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const { id } = req.params;
    validateObjectId(id, "admission ID");

    const instituteFind = await getInstitute(userId);

    const admission = await Admission.findOne({
      _id: id,
      institute: instituteFind._id,
    })
      .populate("student")
      .populate("academicInf.program", "program")
      .populate("academicInf.section", "sectionName")
      .populate("feeInf.feePlan", "planName");

    if (!admission)
      return res
        .status(404)
        .json({ success: false, message: "Admission not found" });

    return res.status(200).json({
      success: true,
      data: formatStudentDetail(admission.student, admission, req),
    });
  } catch (error) {
    console.error("ONE ADMISSION ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const { id } = req.params;
    validateObjectId(id, "admission ID");

    const instituteFind = await getInstitute(userId);

    const admission = await Admission.findOne({
      _id: id,
      institute: instituteFind._id,
    });
    if (!admission)
      return res
        .status(404)
        .json({ success: false, message: "Admission not found" });

    const data = { ...req.body };
    const jsonFields = ["academicInf", "feeInf"];
    for (const field of jsonFields) {
      if (typeof data[field] === "string") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch {
          return res
            .status(400)
            .json({ success: false, message: `Invalid JSON in ${field}` });
        }
      }
    }

    if (data.academicInf) {
      if (data.academicInf.session) {
        if (!data.academicInf.session.match(/^\d{4}(-\d{2,4})?$/))
          return res
            .status(400)
            .json({ success: false, message: "Invalid session format" });
        const dup = await Admission.findOne({
          _id: { $ne: id },
          institute: instituteFind._id,
          student: admission.student,
          "academicInf.session": data.academicInf.session.trim(),
        });
        if (dup)
          return res.status(400).json({
            success: false,
            message: "Admission for this session already exists",
          });
        admission.academicInf.session = data.academicInf.session.trim();
      }
      if (data.academicInf.program) {
        validateObjectId(data.academicInf.program, "program");
        admission.academicInf.program = data.academicInf.program;
      }
      if (data.academicInf.section !== undefined) {
        if (data.academicInf.section)
          validateObjectId(data.academicInf.section, "section");
        admission.academicInf.section = data.academicInf.section || null;
      }
      if (data.academicInf.rollNo !== undefined) {
        const rollNo = data.academicInf.rollNo.trim();
        const dupRoll = await Admission.findOne({
          _id: { $ne: id },
          institute: instituteFind._id,
          "academicInf.session": admission.academicInf.session,
          "academicInf.rollNo": rollNo,
        });
        if (dupRoll)
          return res
            .status(400)
            .json({ success: false, message: "Roll number already exists" });
        admission.academicInf.rollNo = rollNo;
      }
    }

    if (data.feeInf) {
      if (data.feeInf.feePlan) {
        validateObjectId(data.feeInf.feePlan, "feePlan");
        admission.feeInf.feePlan = data.feeInf.feePlan;
      }
      if (data.feeInf.totalfee !== undefined)
        admission.feeInf.totalfee = String(data.feeInf.totalfee);
      if (data.feeInf.discount !== undefined)
        admission.feeInf.discount = String(data.feeInf.discount);
      if (data.feeInf.payable !== undefined)
        admission.feeInf.payable = String(data.feeInf.payable);
    }

    if (data.status) admission.status = data.status;

    await admission.save();

    const populated = await Admission.findById(admission._id)
      .populate("student")
      .populate("academicInf.program", "program")
      .populate("academicInf.section", "sectionName")
      .populate("feeInf.feePlan", "planName");

    return res.status(200).json({
      success: true,
      message: "Admission updated successfully",
      data: {
        student: formatStudent(populated.student, req),
        admission: formatAdmission(populated, req),
      },
    });
  } catch (error) {
    console.error("UPDATE ADMISSION ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const promoteStudent = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const { studentId } = req.params;
    validateObjectId(studentId, "studentId");

    const instituteFind = await getInstitute(userId);

    const student = await Student.findOne({
      _id: studentId,
      institute: instituteFind._id,
    });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const currentAdmission = await Admission.findOne({
      student: studentId,
      institute: instituteFind._id,
      status: "Active",
    }).sort({ "academicInf.session": -1 });

    if (!currentAdmission)
      return res.status(404).json({
        success: false,
        message: "No active admission found to promote from",
      });

    const {
      session,
      program,
      section,
      rollNo,
      feePlan,
      totalfee,
      discount,
      payable,
    } = req.body;
    if (!session?.trim())
      return res
        .status(400)
        .json({ success: false, message: "New session is required" });
    if (!session.match(/^\d{4}(-\d{2,4})?$/))
      return res
        .status(400)
        .json({ success: false, message: "Invalid session format" });
    validateObjectId(program, "program");

    const programDoc = await programModel.findById(program);
    if (!programDoc)
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });

    if (section) validateObjectId(section, "section");
    if (feePlan) validateObjectId(feePlan, "feePlan");

    const existing = await Admission.findOne({
      institute: instituteFind._id,
      student: studentId,
      "academicInf.session": session.trim(),
    });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "Admission for this session already exists",
      });

    let finalRollNo = rollNo?.trim();
    if (!finalRollNo) {
      const rawInst = (
        instituteFind.instituteId ||
        instituteFind.instituteName ||
        "INS"
      )
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const instCode =
        rawInst.length >= 3 ? rawInst.slice(0, 3) : rawInst.padEnd(3, "X");
      const sessionYear = session.split("-")[0].replace(/[^0-9]/g, "");
      const rawProg = (programDoc.shortName || programDoc.program || "PRG")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const progCode =
        rawProg.length >= 3 ? rawProg.slice(0, 3) : rawProg.padEnd(3, "X");
      const prefix = `${instCode}${sessionYear}${progCode}`;

      const existingRolls = await Admission.find({
        institute: instituteFind._id,
        "academicInf.rollNo": { $regex: new RegExp(`^${prefix}\\d+$`, "i") },
      }).select("academicInf.rollNo");

      let maxSeq = 0;
      for (const adm of existingRolls) {
        const m = adm.academicInf?.rollNo?.match(
          new RegExp(`^${prefix}(\\d+)$`, "i"),
        );
        if (m && m[1]) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
      }
      finalRollNo = `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
    }

    const dupRoll = await Admission.findOne({
      institute: instituteFind._id,
      "academicInf.session": session.trim(),
      "academicInf.rollNo": finalRollNo,
    });
    if (dupRoll)
      return res
        .status(400)
        .json({ success: false, message: "Roll number already exists" });

    const newAdmission = await Admission.create({
      institute: instituteFind._id,
      student: studentId,
      academicInf: {
        session: session.trim(),
        program,
        section: section || null,
        rollNo: finalRollNo,
      },
      feeInf: {
        feePlan: feePlan || null,
        totalfee: totalfee || "0",
        discount: discount || "0",
        payable: payable || "0",
      },
      status: "Active",
      createdBy: userId,
    });

    currentAdmission.status = "Promoted";
    await currentAdmission.save();

    const populated = await Admission.findById(newAdmission._id)
      .populate("student")
      .populate("academicInf.program", "program")
      .populate("academicInf.section", "sectionName")
      .populate("feeInf.feePlan", "planName");

    return res.status(201).json({
      success: true,
      message: "Student promoted successfully",
      data: {
        student: formatStudent(populated.student, req),
        admission: formatAdmission(populated, req),
      },
    });
  } catch (error) {
    console.error("PROMOTE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const studentHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const { studentId } = req.params;
    validateObjectId(studentId, "studentId");

    const instituteFind = await getInstitute(userId);

    const student = await Student.findOne({
      _id: studentId,
      institute: instituteFind._id,
    });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const admissions = await Admission.find({
      student: studentId,
      institute: instituteFind._id,
    })
      .populate("academicInf.program", "program")
      .populate("academicInf.section", "sectionName")
      .populate("feeInf.feePlan", "planName")
      .sort({ "academicInf.session": -1 });

    return res.status(200).json({
      success: true,
      data: {
        student: formatStudent(student, req),
        admissions: admissions.map((a) => formatAdmission(a, req)),
      },
    });
  } catch (error) {
    console.error("STUDENT HISTORY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentImage = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id, "student ID");

    const student = await Student.findById(id).select("avatar");
    if (!student || !student.avatar?.url)
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    const avatarUrl = student.avatar.url;
    if (avatarUrl.startsWith("data:image/svg+xml;base64,")) {
      const base64Data = avatarUrl.replace("data:image/svg+xml;base64,", "");
      const imgBuffer = Buffer.from(base64Data, "base64");
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(imgBuffer);
    }

    const response = await fetch(avatarUrl);
    if (!response.ok)
      return res
        .status(response.status)
        .json({ success: false, message: "Failed to fetch image" });

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("GET IMAGE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudentImage = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const { id } = req.params;
    validateObjectId(id, "student ID");

    const instituteFind = await getInstitute(userId);

    const student = await Student.findOne({
      _id: id,
      institute: instituteFind._id,
    });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    if (!req.file)
      return res.status(400).json({
        success: false,
        message: "Please upload an image file (key: avatar)",
      });

    const oldPublicId = student.avatar?.public_id;
    if (oldPublicId && !oldPublicId.startsWith("avatar_")) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (e) {
        console.warn("Cloudinary cleanup error:", e.message);
      }
    }

    student.avatar = { url: req.file.path, public_id: req.file.filename };
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student photo updated successfully",
      data: formatStudent(student, req),
    });
  } catch (error) {
    console.error("UPDATE IMAGE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });

    const { id } = req.params;
    validateObjectId(id, "student ID");

    const instituteFind = await getInstitute(userId);

    const student = await Student.findOne({
      _id: id,
      institute: instituteFind._id,
    });
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const { name, gender, dateOfBirth, parentInf, status } = req.body;

    if (name !== undefined) {
      if (!name?.trim())
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty" });
      student.name = name.trim();
    }
    if (gender !== undefined) {
      if (!["Male", "Female", "Other"].includes(gender.trim()))
        return res
          .status(400)
          .json({ success: false, message: "Invalid gender" });
      student.gender = gender.trim();
    }
    if (dateOfBirth !== undefined) {
      student.dateOfBirth = new Date(dateOfBirth);
    }
    if (parentInf !== undefined) {
      student.parentInf = { ...student.parentInf, ...parentInf };
    }
    if (status !== undefined) {
      if (!["Active", "Inactive", "Suspended"].includes(status))
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      student.status = status;
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated",
      data: formatStudent(student, req),
    });
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const instituteFind = await getInstitute(userId);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const { search, status, gender } = req.query;

    const filter = { institute: instituteFind._id };
    if (search) filter.name = { $regex: search, $options: "i" };
    if (status) filter.status = status;
    if (gender) filter.gender = gender;

    const [total, students] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    const studentIds = students.map((s) => s._id);
    const admissions = await Admission.find({
      institute: instituteFind._id,
      student: { $in: studentIds },
      status: "Active",
    })
      .populate("academicInf.program", "program shortName")
      .populate("academicInf.section", "sectionName")
      .select(
        "student academicInf.session academicInf.rollNo academicInf.program academicInf.section",
      );

    const admissionMap = new Map();
    admissions.forEach((a) => admissionMap.set(a.student.toString(), a));

    const data = students.map((s) => {
      const adm = admissionMap.get(s._id.toString());
      return {
        name: s.name,
        image: s.avatar?.url
          ? `${baseUrl(req)}/api/student/image/${s._id}`
          : null,
        rollNo: adm?.academicInf?.rollNo || null,
        section: adm?.academicInf?.section?.sectionName || null,
        session: adm?.academicInf?.session || null,
        program: adm?.academicInf?.program?.program || null,
        programShortName: adm?.academicInf?.program?.shortName || null,
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("ALL STUDENTS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
