declare namespace Google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken(): void;
      }

      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }): TokenClient;
    }
  }
}

interface Window {
  google?: typeof Google;
}
