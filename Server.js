const mongoose = require("mongoose");
const express = require('express')
const app = express();
const UserResponseModel = require("./Model/UserResponse")
const cors = require("cors")
const sendEmailWithCode = require("./sendEmailWithCode/sendEmailWithCode");
const reportModel = require("./Model/Report");
const QuestionModel = require("./Model/Question");
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



app.post('/UserResponse', async (req, res) => {
    try {
      const { name, email, age, responses ,questions} = req.body;
  
      // Assuming 'response' is an array of objects containing 'response' and 'text'
      const newResponse = {
        name: name,
        email: email.toLowerCase(),
        age: age,
        responses: responses,
        questions : questions
      };
  
      const newData = await UserResponseModel.create(newResponse);
      res.status(201).json({ message: 'Data added successfully', data: newData });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
  


  app.post("/reports/:mail" , async (req, res) => {
    const userEmailAddress = req.params.mail; // Replace this with the user's email
    const result = await sendEmailWithCode(userEmailAddress)
    const newData = new reportModel({
      uniqueId : result.code,
      name : "Anirudh",
      email : "Anirudhkulkarni9094@gmail.com",
      data : []
    })

    try{
      newData.save();
      res.status(200).json({
        UniqueId : result.code,
        data : []
      })
    }
    catch(err){
      res.send(err);
    }
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

app.listen(3001, ()=>{
    console.log("port running at 3000")
})

// anirudhkulkarni9094
// TRb8AwPW6444ymuh