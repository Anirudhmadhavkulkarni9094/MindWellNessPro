const mongoose = require("mongoose");
const express = require('express')
const app = express();
const UserResponseModel = require("./Model/UserResponse")
const cors = require("cors")
app.use(cors())
mongoose.connect("mongodb+srv://anirudhkulkarni9094:TRb8AwPW6444ymuh@mindwellpro.h2ryfbt.mongodb.net/?retryWrites=true&w=majority").then(console.log("Connected successfully")).catch(Err=>console.log(Err))
app.use(express.json())
app.get("/", async (req , res)=>{
    const data = await UserResponseModel.find({});
    res.status(200).json({
        DataLength : data.length,
        data : data
    })
})

app.post('/UserResponse', async (req, res) => {
    try {
      const { name, email, age, responses ,questions} = req.body;
  
      // Assuming 'response' is an array of objects containing 'response' and 'text'
      const newResponse = {
        name: name,
        email: email,
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
  
app.listen(3001, ()=>{
    console.log("port running at 3000")
})

// anirudhkulkarni9094
// TRb8AwPW6444ymuh