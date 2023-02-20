const http = require('http')
const app = require('./app') // the actual Express application



const Blog = mongoose.model('Blog', blogSchema)

app.use(cors())
app.use(express.json())



const PORT = 3003
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})