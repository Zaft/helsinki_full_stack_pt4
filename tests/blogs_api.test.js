const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
	await Blog.deleteMany({})
	await User.deleteMany({})
	console.log('cleared')
	const blogObjects = helper.initialBlogs
		.map(blog => new Blog(blog))
	const userObjects = helper.initialUsers
		.map(user => new User(user))
		
	const promiseArray = blogObjects.map(blog => blog.save())

	promiseArray.concat(userObjects.map(user => user.save()))
	
	await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
}, 100000)


test('test unique identifier is name id', async () => {
	const blogsAtEnd = await helper.blogsInDb()
	blogsAtEnd.forEach(blog => expect(blog.id).toBeDefined())
})

describe('creation of blogs', () => {
	
	test('likes property is initialized to zero when not provided', async () => {
		
		const usersInDb = await helper.usersInDb()
		const password = 'testy'
		const testUser = {
			username: usersInDb[0].username,
			password: password
		}
		
		const loginResponse = await api
			.post('/api/login')
			.send(testUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		
		const token = `bearer ${loginResponse.body.token}`

		const newBlog = {
			author: 'Tom Bomb',
			title: 'Tom Bomb Blog 1',
			url: 'http://www.tombomb.com/blog1',
			user: usersInDb[0].id
		}
		
		await api
			.post('/api/blogs')
			.send(newBlog)
			.set({ Authorization: token })
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

		const blog = blogsAtEnd.pop()
		expect(blog.author).toEqual(newBlog.author)
		expect(blog.title).toEqual(newBlog.title)
		expect(blog.url).toEqual(newBlog.url)
		expect(blog.likes).toEqual(0)
		expect(blog.userId).toEqual(newBlog.userId)
	
		const user = await helper.usersInDb()
		expect(user[0].blogs.toString()).toContain(blog.id)
	})
	
	test('a valid blog is added', async () => {

		const usersInDb = await helper.usersInDb()
		const password = 'testy'
		const testUser = {
			username: usersInDb[0].username,
			password: password
		}
		
		const loginResponse = await api
			.post('/api/login')
			.send(testUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		
		const token = `bearer ${loginResponse.body.token}`
		
		const newBlog = {
			author: 'Tom Bomb',
			title: 'Tom Bomb Blog Post 1',
			url: 'http://www.tombomb.com/blog1',
			likes: 4,
			user: usersInDb[0].id
		}
	
		await api
			.post('/api/blogs')
			.send(newBlog)
			.set({ Authorization: token })
			.expect(201)
			.expect('Content-Type', /application\/json/)
	
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

		const blog = blogsAtEnd.pop()
		expect(blog.author).toEqual(newBlog.author)
		expect(blog.title).toEqual(newBlog.title)
		expect(blog.url).toEqual(newBlog.url)
		expect(blog.likes).toEqual(newBlog.likes)
		expect(blog.userId).toEqual(newBlog.userId)

		const user = await helper.usersInDb()
		
		expect(user[0].blogs.toString()).toContain(blog.id)

	}, 100000)

	test('creation fails when proper response when token is not provided', async () => {
		const usersInDb = await helper.usersInDb()
		const password = 'testy'
		const testUser = {
			username: usersInDb[0].username,
			password: password
		}
		
		const loginResponse = await api
			.post('/api/login')
			.send(testUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		
		const token = `bearer ${loginResponse.body.token}`
		
		const newBlog = {
			author: 'Tom Bomb',
			title: 'Tom Bomb Blog Post 1',
			url: 'http://www.tombomb.com/blog1',
			likes: 4,
			user: usersInDb[0].id
		}
	
		await api
			.post('/api/blogs')
			.send(newBlog)
			.set({ Authorization: '' })
			.expect(401)
			.expect('Content-Type', /application\/json/)
	
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
	})
})

describe('deletion of a blog', () => {
	test('succeeds with a status of 204 if id is valid', async() => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[0]

		// TODO: Update tests to pass with token based authentication
		const token = 'bearer <some token value here>'
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.setHeader('Authorization', token)
			.expect(204)

		const blogsAtEnd = await helper.blogsInDb()

		expect(blogsAtEnd).toHaveLength(
			helper.initialBlogs.length -1
		)
	})
})

describe('updating a blog', () => {
	test('updating likes', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const newLikesValue = 9
		let blogToUpdate = blogsAtStart[0]
		blogToUpdate.likes = newLikesValue

		await api
			.put(`/api/blogs/${blogToUpdate.id}`)
			.send(blogToUpdate)
			.expect(200)

		const blogsAtEnd = await helper.blogsInDb()
		const updatedBlog = blogsAtEnd[0]
		expect(updatedBlog.likes).toEqual(newLikesValue)
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
})

test('server responds with 400 status if title or url are missing from request', async () => {
	const blog = {
		author: 'Test Tom',
	}

	// we are expecting a 400 response due to missing fields
	await api
		.post('/api/blogs')
		.send(blog)
		.expect(400)
})

afterAll(async() => {
	await mongoose.connection.close()
})