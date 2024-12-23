require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../../../models/User')

const loginUser = async (req, res) => {
  const { name, email, roll, password, confirmPassword } = req.body

  if (!name || !email || !roll || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill in all fields' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send({ message: 'No user Found' })
    }

    const userPassword = user.passwordHash
    const isValidPassword = await bcrypt.compare(password, userPassword)

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
    )

    res.status(200).send({
      message: 'User Logged In Successfully',
      data: user,
      token: token,
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error finding user', error: error.message })
  }
}

module.exports = { loginUser }
