import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 'tu_clave_de_resend_va_aqui') {
      return NextResponse.json({ error: 'Servicio de email no configurado' }, { status: 503 });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { nombre, email, mensaje } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Entrenarte Web <onboarding@resend.dev>',
      to: ['renngiann@gmail.com'], 
      reply_to: email,
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
