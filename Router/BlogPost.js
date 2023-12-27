const BlogPost = require("../Model/Forum")

const getBlogsByCategory = async (req, res) => {
    try {
      const blogPosts = await BlogPost.find({ category: req.params.Category });
      res.json(blogPosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  const addBlogPost = async (req, res) => {
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
  }

  const deleteBlogPost = async (req, res) => {
    try {
      await BlogPost.findByIdAndDelete({ _id: req.params.id });
      res.json({ message: "Deleted blog post" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  const addCommentToBlog =  async (req, res) => {
    try {
      res.blogPost.comments.push({ text: req.body.text });
      await res.blogPost.save();
      res.status(201).json(res.blogPost);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
module.exports = {
    getBlogsByCategory,
    addBlogPost,
    deleteBlogPost,
    addCommentToBlog
}