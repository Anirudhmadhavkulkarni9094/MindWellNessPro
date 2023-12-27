const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const UserResponseModel = require("./Model/UserResponse");
const cors = require("cors");
const sendEmailWithCode = require("./sendEmailWithCode/sendEmailWithCode");
const reportModel = require("./Model/Report");
const axios = require("axios");
const QuestionModel = require("./Model/Question");
const ForumModel = require("./Model/Forum");
const passwordModel = require("./Model/Password");
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://anirudhkulkarni9094:TRb8AwPW6444ymuh@mindwellpro.h2ryfbt.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(console.log("Connected successfully"))
  .catch((Err) => console.log(Err));
app.use(express.json());

app.get("/UserResponse", async (req, res) => {
  const data = await UserResponseModel.find({});

  res.status(200).json({
    DataLength: data.length,
    data: data,
  });
});

app.delete("/DeleteUserResponse/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await UserResponseModel.findByIdAndDelete(id);
    if (!data) {
      return res.status(404).json({ message: "User response not found" });
    }
    res.status(200).json({ message: "User response deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/UserResponse/:mail", async (req, res) => {
  const mail = req.params.mail; // Access the mail parameter from the request
  try {
    const data = await UserResponseModel.find({ email: mail.toLowerCase() });
    res.json(data);
  } catch (error) {
    console.error("Error fetching user responses:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getReports/:mail/:id", async (req, res) => {
  const mail = req.params.mail;
  const uniqueId = req.params.id;
  const report = await reportModel.findOne({
    $and: [{ uniqueId: uniqueId }, { email: mail.toLowerCase() }],
  });
  res.send(report.sentiment_scores);
});

app.delete("/UserResponse/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deletedResponse = await UserResponseModel.findByIdAndDelete(id);
    console.log("response deleted");
    if (!deletedResponse) {
      return res.status(404).json({ message: "User response not found" });
    }

    res
      .status(200)
      .json({ message: "User response deleted successfully", deletedResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user response", error: error.message });
    console.log("response cannot be deleted");
  }
});

app.post("/UserResponse", async (req, res) => {
  try {
    const { name, email, age, responses, questions } = req.body;
    const newResponse = {
      name: name,
      email: email.toLowerCase(),
      age: age,
      responses: responses,
      questions: questions,
    };

    // Check if data with the provided email exists, then delete it
    const existingData = await UserResponseModel.findOneAndDelete({ email: email });

    console.log(existingData); // Log the deleted data if found

    // Save user response to the database
    const newData = await UserResponseModel.create(newResponse);
    newData.save();

    // Making a GET request to sentiment analysis service after saving the user response
    axios
      .get(
        `https://sentimentanalysis-rdb8.onrender.com/senti/sentimentAnalysis/0/${email}`
      )
      .then((sentimentResponse) => {
        const {
          "unique id": uniqueId,
          name,
          email,
          suggestions,
          sentiments_scores,
          status,
        } = sentimentResponse.data;

        // Construct sentiment object from the provided scores
        const sentimentScores = sentiments_scores.map((sentiment) => ({
          label: sentiment.label,
          score: sentiment.score,
        }));

        const newReport = new reportModel({
          uniqueId: uniqueId,
          name: name,
          email: email,
          suggestions: suggestions,
          sentiment_scores: sentimentScores, // Use sentiment_scores field
          status: status,
        });

        // Save sentiment analysis report to the database
        return newReport.save();
      })
      .then(() => {
        res
          .status(201)
          .json({ message: "Data added successfully", data: newData });
      })
      .catch((error) => {
        console.error(
          "Error fetching or saving sentiment analysis report:",
          error
        );
        res
          .status(500)
          .json({ message: "Error processing sentiment analysis" });
      });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/getReport", async (req, res) => {
  try {
    const { uniqueId, email } = req.body;
    const report = await reportModel.findOne({
      $and: [{ uniqueId: uniqueId }, { email: email.toLowerCase() }],
    });
    if (report == null) {
      console.log("report not found");
      return res.status(200).json({ data: "Report not found" });
    }

    res.status(200).json({ data: report });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(404).json({ data: "Internal server error" });
  }
});

app.delete("/deleteAllReports", async (req, res) => {
  reportModel
    .deleteMany({})
    .then(() => {
      console.log("All records deleted successfully");
      res.status(200).json({
        message: "all records deleted",
      });
    })
    .catch((error) => {
      console.error("Error deleting records:", error);
    });
});

app.delete("/deleteAllResponse", async (req, res) => {
  UserResponseModel.deleteMany({})
    .then(() => {
      console.log("All records deleted successfully");
      res.status(200).json({
        message: "all records deleted",
      });
    })
    .catch((error) => {
      console.error("Error deleting records:", error);
    });
});

app.post("/reports/:mail", async (req, res) => {
  const userEmailAddress = req.params.mail; // Replace this with the user's email
  const result = await sendEmailWithCode(userEmailAddress);
  res.status(200).json({
    UniqueId: result.code,
  });
});

app.get("/questions", async (req, res) => {
  try {
    const questions = await QuestionModel.find({});
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Example of adding a question
app.post("/questions", async (req, res) => {
  try {
    const { Question, Category } = req.body; // Assuming you pass the question in the request body
    const newQuestion = await QuestionModel.create({
      Question: Question,
      Category: Category,
    });
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error("Error adding question:", err);
    res.status(500).json({ error: "Failed to add question" });
  }
});

app.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await QuestionModel.findOneAndDelete({ _id: id });

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res
      .status(200)
      .json({ message: "Question deleted successfully", deletedQuestion });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

app.get("/Forum/:category", async (req, res) => {
  const category = req.params.category;
  const data = await ForumModel.find({ category: category });
  res.status(200).json({
    data: data,
  });
});

app.post("/forum", async (req, res) => {
  try {
    const { title, author, content, category } = req.body; // Remove 'await' here

    const newData = new ForumModel({
      title,
      author,
      category,
      content,
    });

    await newData.save();

    res.status(200).json({
      message: "Data added successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Data cannot be uploaded",
      error: err.message, // Include the error message for debugging
    });
  }
});

const BlogPost = require("./Model/Forum");
const ComplaintModel = require("./Model/Complaint");
const AdminModel = require("./Model/Admin");

// GET all blog posts
app.get("/blog-posts/:Category", async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({ category: req.params.Category });
    res.json(blogPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new blog post
app.post("/blog-posts", async (req, res) => {
  console.log(req.body);
  const blogPost = new BlogPost({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    name: req.body.name,
    category: req.body.category,
  });

  try {
    const newBlogPost = await blogPost.save();
    res.status(201).json(newBlogPost);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

// GET a specific blog post
app.get("/blog-posts/:id", getBlogPost, (req, res) => {
  res.json(res.blogPost);
});

// Middleware function to get a specific blog post by ID
async function getBlogPost(req, res, next) {
  let blogPost;
  try {
    blogPost = await BlogPost.findById(req.params.id);
    if (blogPost == null) {
      return res.status(404).json({ message: "Blog post not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.blogPost = blogPost;
  next();
}

// DELETE a blog post
app.delete("/blog-posts/:id", async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete({ _id: req.params.id });
    res.json({ message: "Deleted blog post" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment to a blog post
app.post("/blog-posts/:id/comment", getBlogPost, async (req, res) => {
  try {
    res.blogPost.comments.push({ text: req.body.text });
    await res.blogPost.save();
    res.status(201).json(res.blogPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/getReport", async (req, res) => {
  try {
    const reports = await reportModel.find({});
    res.status(200).json({
      message: "data fetched successfully",
      data: reports,
    });
  } catch (Err) {
    res.status(401).json({
      message: "Data cannot be fetched",
    });
  }
});

app.delete("/deleteReport/:id", async (req, res) => {
  try {
    const report = await reportModel.findOneAndDelete({
      uniqueId: req.params.id,
    });
    res.status(201).json({
      message: "data deleted successfully",
      data: report,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

app.post("/addComplaint", async (req, res) => {
  try {
    const data = await ComplaintModel.create(req.body);
    res.status(201).json({ message: "Complaint added successfully", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/complaint/:Status", async (req, res) => {
  try {
    const data = await ComplaintModel.find({ status: req.params.Status });
    res.status(200).json({
      message: "complaint fetched successfully",
      data: data,
    });
  } catch (err) {
    res.status(200).json({
      message: "complaints cannot be fetched",
    });
  }
});
app.delete("/complaint/:id", async (req, res) => {
  try {
    const data = await ComplaintModel.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json({
      message: "complaint deleted successfully successfully",
    });
  } catch (err) {
    res.status(200).json({
      message: "complaints cannot be fetched",
    });
  }
});
app.patch("/complaint/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint status updated successfully",
      data: updatedComplaint,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update complaint status",
      error: err.message,
    });
  }
});




app.post('/register', async (req, res) => {
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
});

app.put('/promote-to-superadmin/:adminId', async (req, res) => {
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
});
app.put('/demote-to-superadmin/:adminId', async (req, res) => {
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
});

app.put("/approveLogin/:id" , async (req, res)=>{
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
})
app.put("/disapproveLogin/:id" , async (req, res)=>{
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
})


// Assuming AdminModel is your Mongoose model for administrators

app.post('/login', async (req, res) => {
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
});

app.get("/getAdmin" , async (req , res)=>{
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
})


app.listen(3001, () => {
  console.log("port running at 3001");
});

// anirudhkulkarni9094
// TRb8AwPW6444ymuh
