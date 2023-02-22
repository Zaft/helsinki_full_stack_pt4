const blogsRouter = require('express').Router()
// const { response } = require('../app')
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
	response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	if (blog) {
		response.json(blog)
	} else {
		response(404).end()
	}
})
  
blogsRouter.post('/', async (request, response) => {
	const body = request.body
	// console.log('post blog', body)
	if (!body.title || !body.url) {
		return response.status(400).end()
	}

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes
	})

	const savedBlog = await blog.save()
	response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
	const { title, author, url, likes} = request.body

	const updatedBlog = await Blog.findByIdAndUpdate(
		request.params.id,
		{ title, author, url, likes},
		{ new: true, runValidators: true, context: 'query'})

	response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
	await Blog.findByIdAndRemove(request.params.id)
	response.state(204).end()
})

module.exports = blogsRouter