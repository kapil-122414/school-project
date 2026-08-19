const mongoose = require('mongoose');
require('dotenv').config();

async function checkRollNos() {
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
    
    const admissions = await db.collection('admissions').find({ institute: instituteId }).toArray();
    
    console.log('\nAll Admissions:');
    admissions.forEach(a => {
      console.log(`  - _id: ${a._id}`);
      console.log(`    student: ${a.student}`);
      console.log(`    rollNo: ${a.academicInf?.rollNo}`);
      console.log(`    session: ${a.academicInf?.session}`);
      console.log(`    program: ${a.academicInf?.program}`);
      console.log(`    status: ${a.status}`);
      console.log('');
    });
    
    // Check for duplicates
    const rollNoMap = new Map();
    admissions.forEach(a => {
      const key = `${a.academicInf?.session}-${a.academicInf?.rollNo}`;
      if (!rollNoMap.has(key)) rollNoMap.set(key, []);
      rollNoMap.get(key).push(a._id);
    });
    
    console.log('\nDuplicate check (session-rollNo):');
    let hasDuplicates = false;
    rollNoMap.forEach((ids, key) => {
      if (ids.length > 1) {
        console.log(`  DUPLICATE: ${key} -> ${ids.join(', ')}`);
        hasDuplicates = true;
      }
    });
    
    if (!hasDuplicates) {
      console.log('  No duplicates found ✅');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRollNos();