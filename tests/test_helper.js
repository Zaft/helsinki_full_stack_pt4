const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
	{
		_id: '5a422a851b54a676234d17f7',
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
		user: '5a422a851b54a676234d17f9',
		__v: 0
	},
	{
		_id: '5a422aa71b54a676234d17f8',
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5,
		user: '5a422a851b54a676234d17f9',
		__v: 0
	},
	{
		_id: '5a422b3a1b54a676234d17f9',
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		likes: 12,
		user: '5a422a851b54a676234d17f9',
		__v: 0
	},
	{
		_id: '5a422b891b54a676234d17fa',
		title: 'First class tests',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
		likes: 10,
		user: '5a422a851b54a676234d17f9',
		__v: 0
	},
	{
		_id: '5a422ba71b54a676234d17fb',
		title: 'TDD harms architecture',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
		likes: 0,
		user: '5a422a851b54a676234d17f9',
		__v: 0
	},
	{
		_id: '5a422bc61b54a676234d17fc',
		title: 'Type wars',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
		likes: 2,
		user: '5a422a851b54a676234d17f9',
		__v: 0
	}  
]

const initialUsers = [
	{
		_id: '63f8fa484cabf90aaf9d012b',
		username: 'username1',
		name: 'Tommy Tester',
		passwordHash: '$2b$10$FqnCN.twUtf8/0fxR0t3qeO/dpZchXM3mmZzUT/KLyW/75KtMawAq',
		blogs: [],
		__v: 0
	},
]

const nonExistingId = async () => {
	const blog = new Blog({ content: 'willremovethissoon' })
	await blog.save()
	await blog.remove()
  
	return blog._id.toString()
}
  
const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(user => user.toJSON())
}

// Note this method would have to be called after users populate in db
const createTestUser = async () => {
	const saltRounds = 10
	const password = 'testy'
	const passwordHash = await bcrypt.hash(password, saltRounds)

	const user = new User({
		username: initialUsers[0].username,
		name: initialUsers[0].name,
		passwordHash,
	})
	return await user.save()
}
  
module.exports = {
	initialBlogs, 
	initialUsers,
	nonExistingId, 
	blogsInDb, 
	usersInDb,
	createTestUser
}