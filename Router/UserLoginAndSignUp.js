const AdminModel = require("../Model/Admin")
const bcrypt = require("bcryptjs")
const passwordModel = require("../Model/Password")


const addNewUser = async (req, res) => {
    const { name, email, password, phoneNumber, gender } = req.body;
    try {
      // Hashing the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Creating a newAdmin object with the hashed password
      const newAdmin = await AdminModel.create({
        name: name,
        email: email,
        password: hashedPassword, // Saving the hashed password
        phoneNumber: phoneNumber,
        gender: gender,
      });
  
      const newEntry = await passwordModel.create({
        email : email,
        password : password
      })
  
      await newEntry.save();
  
      await newAdmin.save();
      res.status(200).json({
        message: 'User added successfully',
        user: newAdmin,
      });
    } catch (err) {
      // Handle errors appropriately
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const promotionToSuperAdminById = async (req, res) => {
    const adminId = req.params.adminId;
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin.superAdmin = true;
      admin.status = true;
      await admin.save();
      res.status(200).json({
        message: 'Admin promoted to super admin successfully',
        updatedAdmin: admin,
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const demotionToAdminById = async (req, res) => {
    const adminId = req.params.adminId;
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin.superAdmin = false;
      await admin.save();
      res.status(200).json({
        message: 'Admin demoted to admin successfully',
        updatedAdmin: admin,
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const admitAdmin = async (req, res)=>{
    const adminId = req.params.id;
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin.status = true;
      await admin.save();
      res.status(200).json({
        message: 'Admin approved',
        updatedAdmin: admin,
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const rejectAdminRequest = async (req, res)=>{
    const adminId = req.params.id;
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      admin.status = false;
      await admin.save();
      res.status(200).json({
        message: 'Admin disapproved',
        updatedAdmin: admin,
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const login =async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await AdminModel.findOne({ email });
  
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      const passwordMatch = await bcrypt.compare(password, admin.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      if (admin.status) {
        return res.status(200).json({ message: 'Login successful' , admin : admin});
      } else {
        return res.status(401).json({
          message: "Login unsuccessful, user is not an approved admin"
        });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const fetchAllAdmin = async (req , res)=>{
    try{
    const data = await AdminModel.find({});
    res.status(200).json({
      message : "admin list fetched successfully",
      data : data
    })
    }
    catch{
  res.status(401).json({
    message  :"admin list cannot be fetched"
  })
    }
  }
module.exports = {
    addNewUser,
    promotionToSuperAdminById,
    demotionToAdminById,
    admitAdmin,
    rejectAdminRequest,
    login,
    fetchAllAdmin
}