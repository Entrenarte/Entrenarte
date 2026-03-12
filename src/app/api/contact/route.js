import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializamos resend con la variable de entorno que va a estar en .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { nombre, email, mensaje } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Entrenarte Web <onboarding@resend.dev>',
      to: ['renngiann@gmail.com'], 
      reply_to: email, // El estudiante se comunica con el suyo, si el profe responde, lo hace a este email
      subject: `Nuevo mensaje de ${nombre} desde la web`,
      html: `
        <h2>Nuevo contacto desde Entrenarte</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email del remitente:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: 'Hubo un error enviando el correo' }, { status: 500 });
  }
}
