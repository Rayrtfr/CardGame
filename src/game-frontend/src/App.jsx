import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { random_game_icp_01_backend } from 'declarations/random-game-icp-01-backend';

function App() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 初始化 AuthClient
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthed = await client.isAuthenticated();
      setIsAuthenticated(isAuthed);
    };
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    setLoading(true);

    await new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          setIsAuthenticated(true);
          setLoading(false);
          resolve(null);
        },
        onError: () => {
          setLoading(false);
          reject();
        },
      });
    });
  };

  const logout = async () => {
    if (!authClient) return;
    setLoading(true);
    await authClient.logout();
    setIsAuthenticated(false);
    setLoading(false);
  };

  const playGame = async (guess) => {
    setLoading(true);

    try {
      const response = await random_game_icp_01_backend.draw_card(guess);
      setResult(response);
    } catch (error) {
      setResult("Failed to play the game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>🃏 Higher or Lower Game</h1>
        {isAuthenticated ? (
          <button onClick={logout} className="auth-button" disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <button onClick={login} className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login with Internet Identity'}
          </button>
        )}
      </header>

      {isAuthenticated ? (
        <div className="game-container">
          <h2>Guess if the next card is higher or lower!</h2>
          <div className="choices">
            <button onClick={() => playGame("higher")} disabled={loading}>
              Higher
            </button>
            <button onClick={() => playGame("lower")} disabled={loading}>
              Lower
            </button>
          </div>
          <section className="result-section">
            {loading ? (
              <p>Loading...</p>
            ) : (
              result && <p>{result}</p>
            )}
          </section>
        </div>
      ) : (
        <div className="auth-prompt">
          <p>Please login with Internet Identity to access the game.</p>
        </div>
      )}
    </main>
  );
}

export default App;
