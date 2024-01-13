const TestimonialModel  = require("../Model/Testimonial")

const getTestimonial = async (req , res)=>{
    try{
        const data = await TestimonialModel.find({}).limit(6);
        res.status(200).json({
            message : "Testimonial fetched Successfully",
            data : data
        })
    }
    catch (err){
        console.log(data)
        res.send("cannot be fetched")
    }
}

const addTestimonial = async (req, res)=>{
    const {author, message } = req.body
    try{
        const data =  await TestimonialModel.create({
            author : author,
            message : message
        })
        // data.save();
        res.status(200).json({
            message : "testimonial added",
            data : data
        })
    }
    catch(err){
        res.send("cannot be added" + err)
    }
}

const deleteTestimonial = async (req, res) => {
    const id = req.params.id;
    try {
      const data = await TestimonialModel.findOneAndDelete({ _id: id });
      if (!data) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      res.status(200).json({
        message: 'Deleted successfully',
        data: data,
      });
    } catch (err) {
      res.status(500).send('Unable to delete testimonial: ' + err);
    }
  };
  
const getTestimonialById =async (req, res) => {
    const id = req.params.id;
    try {
      const data = await TestimonialModel.find({ _id: id });
      if (!data) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      res.status(200).json({
        message: 'Fetched successfully',
        data: data,
      });
    } catch (err) {
      res.status(500).send('Unable to fetch testimonial: ' + err);
    }
  };

module.exports = {
    addTestimonial , 
    getTestimonial,
    getTestimonialById,
    deleteTestimonial
}