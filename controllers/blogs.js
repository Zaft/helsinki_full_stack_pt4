const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
// const user = require('../models/user')

// const getTokenFromRequest = (request) => {
// 	const authorization = request.get('authorization')
// 	if (authorization && authorization.startWith('Bearer ')) {
// 		return authorization.replace('Bearer ', '')
// 	}
// 	return null
// }

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog
		.find({}).populate('user', {username: 1, name:1})
	response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog
		.findById(request.params.id).populate('user', {username:1, name:1})
	if (blog) {
		response.json(blog)
	} else {
		response(404).end()
	}
})
  
blogsRouter.post('/', async (request, response) => {
	const body = request.body
	if (!body.title || !body.url) {
		return response.status(400).json({ error: 'title and url are required'})
	}

	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid'})
	}
	const user = await User.findById(request.user)

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: !body.likes ? 0 : body.likes,
		user: user._id,
	})

	console.log('post blog', blog)

	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()

	response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
	const { title, author, url, likes} = request.body

	const updatedBlog = await Blog.findByIdAndUpdate(
		request.params.id,
		{ 
			title: title, 
			author: author,
			url: url,
			likes: likes 
		},
		{ new: true, runValidators: true, context: 'query'})

	response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {

	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid'})
	}
	const user = request.user
	const blog = await Blog.findById(request.params.id)

	console.log('delete blog user', user.toString())
	console.log('delete blog blog', blog.user.toString())

	if (!(blog.user.toString() === user.toString())) {
		return response.status(401).json({ error: 'unable to delete this blog post'})
	}

	await Blog.findByIdAndRemove(request.params.id)
	response.status(204).end()
})

module.exports = blogsRouter