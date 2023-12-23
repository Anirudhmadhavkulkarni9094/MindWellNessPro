const mongoose = require("mongoose");
const express = require('express')
const app = express();
const UserResponseModel = require("./Model/UserResponse")
const cors = require("cors")
const sendEmailWithCode = require("./sendEmailWithCode/sendEmailWithCode");
const reportModel = require("./Model/Report");
const axios = require("axios");
const QuestionModel = require("./Model/Question");
const ForumModel = require("./Model/Forum")
app.use(cors())


mongoose.connect("mongodb+srv://anirudhkulkarni9094:TRb8AwPW6444ymuh@mindwellpro.h2ryfbt.mongodb.net/?retryWrites=true&w=majority").then(console.log("Connected successfully")).catch(Err=>console.log(Err))
app.use(express.json())
app.get("/UserResponse", async (req , res)=>{
    const data = await UserResponseModel.find({});
    
    res.status(200).json({
        DataLength : data.length,
        data : data
    })
})

app.get("/UserResponse/:mail", async (req, res) => {
  const mail  = req.params.mail; // Access the mail parameter from the request
  try {
    const data = await UserResponseModel.find({ email: mail.toLowerCase() });
    res.json(data)
  } catch (error) {
    console.error('Error fetching user responses:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getReports/:mail/:id" ,  async (req , res)=>{
  const mail = req.params.mail;
  const uniqueId  = req.params.id;
const report = await reportModel.findOne({ $and: [{ uniqueId: uniqueId }, { email: mail.toLowerCase() }] });
  res.send(report.sentiment_scores);
})


app.delete("/UserResponse/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deletedResponse = await UserResponseModel.findByIdAndDelete(id);
      console.log("response deleted")
    if (!deletedResponse) {
      return res.status(404).json({ message: "User response not found" });
    }

    res.status(200).json({ message: "User response deleted successfully", deletedResponse });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user response", error: error.message });
    console.log("response cannot be deleted")
  }
});

app.post('/UserResponse', async (req, res) => {
  try {
    const { name, email, age, responses, questions } = req.body;
    const newResponse = {
      name: name,
      email: email.toLowerCase(),
      age: age,
      responses: responses,
      questions: questions
    };

    // Save user response to the database
    const newData = await UserResponseModel.create(newResponse);
    newData.save();

    // Making a GET request to sentiment analysis service after saving the user response
    axios.get(`https://sentimentanalysis-rdb8.onrender.com/senti/sentimentAnalysis/0/${email}`)
      .then(sentimentResponse => {
        const {
          'unique id': uniqueId,
          name,
          email,
          suggestions,
          sentiments_scores,
          status
        } = sentimentResponse.data;

        // Construct sentiment object from the provided scores
        const sentimentScores = sentiments_scores.map(sentiment => ({
          label: sentiment.label,
          score: sentiment.score
        }));

        const newReport = new reportModel({
          uniqueId: uniqueId,
          name: name,
          email: email,
          suggestions: suggestions,
          sentiment_scores: sentimentScores, // Use sentiment_scores field
          status: status
        });

        // Save sentiment analysis report to the database
        return newReport.save();
      })
      .then(() => {
        res.status(201).json({ message: 'Data added successfully', data: newData });
      })
      .catch(error => {
        console.error('Error fetching or saving sentiment analysis report:', error);
        res.status(500).json({ message: 'Error processing sentiment analysis' });
      });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/getReport', async (req, res) => {
  try {
    const { uniqueId , email} = req.body;
    const report = await reportModel.findOne({ $and: [{ uniqueId: uniqueId }, { email: email.toLowerCase() }] });
    if (report == null) {
      console.log("report not found")
      return res.status(200).json({ data: 'Report not found' });
    }
   
    res.status(200).json({ data :  report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(404).json({ data : 'Internal server error' });
  }
});





app.delete("/deleteAllReports" , async (req,res)=>{

  reportModel.deleteMany({}).then(() => {
    console.log('All records deleted successfully');
    res.status(200).json({
      message : "all records deleted"
    })
  })
  .catch((error) => {
    console.error('Error deleting records:', error);
  });
})
app.delete("/deleteAllResponse" , async (req,res)=>{

  UserResponseModel.deleteMany({}).then(() => {
    console.log('All records deleted successfully');
    res.status(200).json({
      message : "all records deleted"
    })
  })
  .catch((error) => {
    console.error('Error deleting records:', error);
  });
})
  
  


  app.post("/reports/:mail" , async (req, res) => {
    const userEmailAddress = req.params.mail; // Replace this with the user's email
    const result = await sendEmailWithCode(userEmailAddress)
      res.status(200).json({
        UniqueId : result.code
      })
});



app.get('/questions', async (req, res) => {
  try {
    const questions = await QuestionModel.find({});
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Example of adding a question
app.post('/questions', async (req, res) => {
  try {
    const { Question  , Category} = req.body; // Assuming you pass the question in the request body
    const newQuestion = await QuestionModel.create({ Question: Question  , Category : Category});
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

app.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await QuestionModel.findOneAndDelete({ _id: id });

    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully', deletedQuestion });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

app.get("/Forum/:category" , async (req, res)=>{
  const category = req.params.category;
  const data = await ForumModel.find({category : category })
  res.status(200).json({
    data : data
  })
});

app.post("/forum", async (req, res) => {
  try {
    const { title, author , content, category } = req.body; // Remove 'await' here

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

const BlogPost = require('./Model/Forum');

// GET all blog posts
app.get('/blog-posts/:Category', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find({category : req.params.Category});
        res.json(blogPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new blog post
app.post('/blog-posts', async (req, res) => {
  console.log(req.body)
  const blogPost = new BlogPost({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      name: req.body.name,
      category  : req.body.category 
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
app.get('/blog-posts/:id', getBlogPost, (req, res) => {
    res.json(res.blogPost);
});

// Middleware function to get a specific blog post by ID
async function getBlogPost(req, res, next) {
    let blogPost;
    try {
        blogPost = await BlogPost.findById(req.params.id);
        if (blogPost == null) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.blogPost = blogPost;
    next();
}

// DELETE a blog post
app.delete('/blog-posts/:id', getBlogPost, async (req, res) => {
    try {
        await res.blogPost.remove();
        res.json({ message: 'Deleted blog post' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment to a blog post
app.post('/blog-posts/:id/comment', getBlogPost, async (req, res) => {
    try {
        res.blogPost.comments.push({ text: req.body.text });
        await res.blogPost.save();
        res.status(201).json(res.blogPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



app.get("/getReport" , async (req , res)=>{
  try{
    const reports = await reportModel.find({}); 
    res.status(200).json({
      message : "data fetched successfully",
      data : reports
    })
  }
  catch(Err){
    res.status(401).json({
      message : "Data cannot be fetched"
    })
  }
})

app.delete("/deleteReport/:id", async (req, res)=>{
  try{
  const report = await reportModel.findOneAndDelete({uniqueId : req.params.id});
  res.status(201).json({
    message : "data deleted successfully",
    data : report
  })
}
catch(err){
  res.json({
    message : err
  })
}
})

app.listen(3001, ()=>{
    console.log("port running at 3001")
})

// anirudhkulkarni9094
// TRb8AwPW6444ymuh