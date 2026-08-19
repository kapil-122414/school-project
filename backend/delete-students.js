const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://kapilk:kapil123@cluster0.zd4jead.mongodb.net/School_data?appName=Cluster0";
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 30000,
      family: 4,
    });
    console.log('Connected to DB: School_data');
    
    const db = mongoose.connection.db;
    const instituteId = new mongoose.Types.ObjectId('6a85610bcef07b19bb5372d2');
    
    // Check students collection
    const students = await db.collection('students').find({ institute: instituteId }).toArray();
    console.log('\nStudents collection:');
    students.forEach(s => console.log('  -', s.name, '_id:', s._id, 'status:', s.status, 'createdBy:', s.createdBy));
    
    // Check admissions collection
    const admissions = await db.collection('admissions').find({ institute: instituteId }).toArray();
    console.log('\nAdmissions collection:');
    admissions.forEach(a => console.log('  -', a._id, 'student:', a.student, 'status:', a.status, 'session:', a.academicInf?.session, 'rollNo:', a.academicInf?.rollNo));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDB();