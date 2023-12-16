// routes/blogPosts.js

const express = require('express');
const router = express.Router();
const BlogPost = require('../Model/Forum');

// GET all blog posts
router.get('/blog-posts', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find();
        res.json(blogPosts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new blog post
router.post('/blog-posts', async (req, res) => {
    const blogPost = new BlogPost({
        title: req.body.title,
        content: req.body.content
    });

    try {
        const newBlogPost = await blogPost.save();
        res.status(201).json(newBlogPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET a specific blog post
router.get('/blog-posts/:id', getBlogPost, (req, res) => {
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
router.delete('/blog-posts/:id', getBlogPost, async (req, res) => {
    try {
        await res.blogPost.remove();
        res.json({ message: 'Deleted blog post' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment to a blog post
router.post('/blog-posts/:id/comment', getBlogPost, async (req, res) => {
    try {
        res.blogPost.comments.push({ text: req.body.text });
        await res.blogPost.save();
        res.status(201).json(res.blogPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Increment likes for a blog post
router.put('/blog-posts/:id/like', getBlogPost, async (req, res) => {
    try {
        res.blogPost.likes++;
        await res.blogPost.save();
        res.json(res.blogPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
