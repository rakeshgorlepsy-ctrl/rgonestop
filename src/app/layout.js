import '../index.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'RG OneStop - Customized Gifts & Printing Services',
  description: 'Discover premium customized gifts, polaroid photos, personalized chocolates, posters, and printing services at RG OneStop.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
