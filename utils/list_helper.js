const totalLikes = (blogs) => {
	const reducer = (sum, blog) => {
		// console.log('sum, blog', sum, blog)
		return sum + blog.likes
	}
	return blogs.length === 0
		? 0
		: blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
	if (blogs.length === 0) return null
	// const favorite = Math.max(...blogs.map(blog => blog.likes))
	const favorite = blogs.reduce((prev, current) => {
		return (prev.likes > current.likes) ? prev : current
	})
	return {
		title: favorite.title,
		author: favorite.author,
		likes: favorite.likes
	}
}

// returns the author with the most blogs
const mostBlogs = (blogs) => {
	if (blogs.length === 0) return null
	const authorBlogs = blogs.reduce((blog, {author}) => {
		// console.log('reduce author', author)
		blog[author] = blog[author] || 0
		blog[author] += 1
		return blog
	}, {})

	const mostBlogs = Object.keys(authorBlogs).map((key) => {
		return [key, authorBlogs[key]]
	}
	).sort((a, b) => b[1] - a[1])[0]

	return {
		'author': mostBlogs[0],
		'blogs': mostBlogs[1]
	}
}

// returns the author with the most overall likes
const mostLikes = (blogs) => {
	if (blogs.length === 0) return null

	const authorLikes = blogs.reduce((blog, {author, likes}) => {
		blog[author] = blog[author] || 0
		blog[author] += likes
		return blog
	}, {})
	// console.log('authorLikes', authorLikes)

	const mostLikes = Object.keys(authorLikes).map((key) => {
		return [key, authorLikes[key]]
	}).sort((a, b) => b[1] - a[1])[0]

	// console.log('most Likes', mostLikes)
	return {
		author: mostLikes[0],
		likes: mostLikes[1]
	}
}
  
module.exports = {
	totalLikes,
	favoriteBlog,
	mostBlogs, 
	mostLikes,
}