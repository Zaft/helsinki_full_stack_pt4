# Notes on Running Tests with Jest

The following command only run the tests found in tests/blogs_api.test.js
`npm test -- tests/blogs_api.test.js`

the -t option can be used for running tests with a specific name:
`npm test -- -t 'blogs are returns as json'`

The paramter can refer to the name of the test of the describe block
`npm test -- -t '<name of describe block>`
