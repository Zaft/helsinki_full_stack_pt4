const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
	await Blog.deleteMany({})
	console.log('cleared')
	const blogObjects = helper.initialBlogs
		.map(blog => new Blog(blog))
	const promiseArray = blogObjects.map(blog => blog.save())
	await Promise.all(promiseArray)
})

test('blogs are returns as json', async () => {
	await api
		.get('api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
}, 100000)

test('a valid blog is added', async () => {
	const newBlog = {
		author: 'Tom Bomb',
		url: 'http://www.tombomb.com/blog1',
		likes: 4
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const response = await api.get('/api/blogs')
	// TODO: Validate propeties are being create correctly

	expect(response.body).toHaveLength(helper.initialBlogPosts.length + 1)
})

test('test unique identifier is name id', async () => {
	const newBlog = {
		author: 'Tom Bomb',
		url: 'http://www.tombomb.com/blog1',
		likes: 4
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const response = await api.get('/api/blogs')
	expect(response.body).toBeDefined('id')
})

test('likes property is initialized to zero when not provided', async () => {
	const blog = {
		author: 'Tom Bomb',
		url: 'http://www.tombomb.com/blog1',
	}

	const newBlog = await api
		.post('/api/blogs')
		.send(blog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	console.log('post newNote', newBlog)
	// TODO: confirm that the likes property has a value of 0
	expect(newBlog).toBeDefined('')
})

test('server responds with 400 status if title or url are missing from request', async () => {
	const blog = {
		author: 'Test Tom',
		likes: 5
	}

	// we are expecting a 400 response due to missing fields
	const newBlog = await api
		.post('/api/blog')
		.send(blog)
		.expect(400)
	console.log('newBlog ', newBlog)    
})

test('number of likes can be updated for an existing blog post', async () => {
	const updatedBlog = {
		author: helper.initialBlogs[0].author,
		title: helper.initialBlogs[0].title,
		url: helper.initialBlogs[0].url,
		likes: helper.initialBlogs[0].likes + 3
	}
    
	const result = await api
		.put('/api/blog/')
		.send(updatedBlog)
	console.log('Update blog test', result)
})

afterAll(async() => {
	await mongoose.connection.close()
})