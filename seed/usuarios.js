import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre:'ulises',
        email: 'ulises3@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios