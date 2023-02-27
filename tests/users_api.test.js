const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		const salt = 10
		const passwordHash = await bcrypt.hash('testy', salt)
		const user = new User({ username: 'testuser1', passwordHash})
		await user.save()
	})

	test('create succeeds with a fresh username', async() => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'username1',
			name: 'testtommy',
			password: 'testy'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('create fails with proper status code and message if username is taken', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: usersAtStart[0].username,
			name: 'Tommy User',
			password: 'testy'
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('expected `username` to be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('create fails with proper status code if user name is missing', async() => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			name: 'test name',
			password: 'testy'
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		
		expect(result.body.error).toContain('`username` is required')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('create fails with proper status code if password is missing', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			name: 'Test Guy',
			username: 'testy guy',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('`password` is required')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('create fails when username is less then three characters', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'abc',
			name: 'new use name',
			password: 'sekret',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('username must be 3 or more characters')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtStart.length).toHaveLength(usersAtEnd.length)
	})

	test('create fails when password is less then 3 characters', async () => {
		const usersAtStart = await helper.usersInDb()
	
		const newUser = {
			username: 'newguypapi',
			name: 'testy tombits',
			password: 'xyz',
		}
	
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	
		expect(result.body.error).toContain('password does not meet minimum length requirement of 3 characters')
	
		const usersAtEnd = await helper.usersInDb()
		expect(usersAtStart.length).toHaveLength(usersAtEnd.length)
	})
})

afterAll(async() => {
	await mongoose.connection.close()
})