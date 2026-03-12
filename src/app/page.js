import { redirect } from 'next/navigation';

export default function Home() {
  // Por ahora redirigimos directamente al login. 
  // Más adelante verificaremos si ya está logueado para mandarlo al dashboard.
  redirect('/login');
}
