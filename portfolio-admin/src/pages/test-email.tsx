import { useState } from 'react';
import Head from 'next/head';

export default function TestEmail() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendTestEmail = async () => {
    setLoading(true);
    setStatus('');
    setError(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Email envoyé avec succès! Vérifiez votre boîte de réception.');
        console.log('Résultat:', data);
      } else {
        setError(`Erreur: ${data.error || 'Erreur inconnue'}`);
        console.error('Erreur:', data);
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test d'envoi d'email</title>
      </Head>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Test d'envoi d'email</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Cette page permet de tester l'envoi d'email via Resend. Cliquez sur le bouton ci-dessous pour envoyer un email de test.
            </p>
            <p className="text-sm text-gray-500">
              Email de destination: <span className="font-mono">{process.env.NEXT_PUBLIC_RESEND_EMAIL || 'Non défini'}</span>
            </p>
          </div>

          <button
            onClick={sendTestEmail}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer un email de test'}
          </button>

          {status && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              {status}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 