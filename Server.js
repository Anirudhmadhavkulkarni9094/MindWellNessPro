const mongoose = require("mongoose");
const express = require('express')
const app = express();
const UserResponseModel = require("./Model/UserResponse")
const cors = require("cors")
const sendEmailWithCode = require("./sendEmailWithCode/sendEmailWithCode");
const reportModel = require("./Model/Report");
const axios = require("axios");
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
    const newData = await UserResponseModel.create(newResponse);

    // Making a GET request to sentiment analysis service after saving the user response
    axios.get(`https://sentimentanalysis-o04m.onrender.com/senti/sentimentAnalysis/${email}`)
      .then(sentimentResponse => {
       const {'unique id': uniqueId, name , email , suggestions,sentiment , score , status} = sentimentResponse.data;
        const newReport = new reportModel({
          uniqueId: uniqueId,
          name:name,
          email : email,
          suggestions : suggestions , 
          sentiment : sentiment,
          score : score , 
          status : status
        })
        newReport.save();

      })
      .catch(error => {
        console.error('Error fetching sentiment analysis:', error);
      });
    res.status(201).json({ message: 'Data added successfully', data: newData });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/getReport', async (req, res) => {
  try {
    
    const { uniqueId , email} = req.body;
    
    // Assuming 'reportModel' represents your MongoDB model for reports
    const report = await reportModel.find({ $and: [{ uniqueId: uniqueId }, { email: email.toLowerCase() }] });


    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete("/deleteAllReports" , async (req,res)=>{

  reportModel.deleteMany({}).then(() => {
    console.log('All records deleted successfully');
  })
  .catch((error) => {
    console.error('Error deleting records:', error);
  });
})
  
  


  app.post("/reports/:mail" , async (req, res) => {
    const userEmailAddress = req.params.mail; // Replace this with the user's email
    const result = await sendEmailWithCode(userEmailAddress)
    // const newData = new reportModel({
    //   uniqueId : result.code,
    //   name : "Anirudh",
    //   email : "Anirudhkulkarni9094@gmail.com"
    // })

    // try{
    //   newData.save();
      res.status(200).json({
        UniqueId : result.code
      })
    // }
    // catch(err){
    //   res.send(err);
    // }
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
    console.log("port running at 3001")
})

// anirudhkulkarni9094
// TRb8AwPW6444ymuh