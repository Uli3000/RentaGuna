import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const { email, nombre, token } = datos

    // Enviar email
    await transport.sendMail({
        from: 'RentaGuna.com',
        to: email,
        subject: 'Confirma tu cuenta en RentaGuna.com',
        text: 'Confirma tu cuenta en RentaGuna.com',
        html:`
        <p>Hola ${nombre}, comprueba tu cuenta en RentaGuna.com</p>
        
        <p>Tu cuenta ya esta lista, solo debes confrimarla en el siguiente enlace:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar</a></p>
        <p>Si tu no creaste la cuenta, puedes ignorar este mensaje</p>`
    })
}

const emailOlvidePassword = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const { email, nombre, token } = datos

    // Enviar email
    await transport.sendMail({
        from: 'RentaGuna.com',
        to: email,
        subject: 'Restablece tu Contraseña en RentaGuna.com',
        text: 'Restablece tu Contraseña en RentaGuna.com',
        html:`
        <p>Hola ${nombre}, has solicitado reestablecer tu contraseña en RentGuna.com</p>
        
        <p>Para cambiar tu contraseña has click en el siguiente enlace:
        <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Cambiar Contraseña</a></p>
        <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje</p>`
    })
}

export {
    emailRegistro,
    emailOlvidePassword
}