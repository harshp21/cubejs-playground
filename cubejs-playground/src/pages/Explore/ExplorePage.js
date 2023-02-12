import cubejs from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { fetch } from 'whatwg-fetch';
import PlaygroundQueryBuilder from '../../PlaygroundQueryBuilder';

export default function ExplorePage() {
  const { push, location } = useHistory();

  const [apiUrl, setApiUrl] = useState(null);
  const [playgroundContext, setPlaygroundContext] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/playground/context');
      const result = await res.json();

      setPlaygroundContext(result);
    })();
  }, []);

  useLayoutEffect(() => {
    if (playgroundContext) {
      const basePath = playgroundContext.basePath || '/cubejs-api';
      let apiUrl =
        playgroundContext.apiUrl ||
        window.location.href.split('#')[0].replace(/\/$/, '');
      apiUrl = `${apiUrl}${basePath}/v1`;

      setApiUrl(apiUrl);

      window['__cubejsPlayground'] = {
        ...window['__cubejsPlayground'],
        apiUrl,
        headers: {
          'x-selected-site': 'site1'
        }
      };
    }
  }, [playgroundContext]);

  const params = new URLSearchParams(location.search);
  const query = (params.get('query') && JSON.parse(params.get('query'))) || {};

  return (
    <CubeProvider>
      <PlaygroundQueryBuilder
        query={query}
        setQuery={(q) => push(`/build?query=${JSON.stringify(q)}`)}
        apiUrl={apiUrl}
        cubejsApi={cubejs(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMXBrU3pWdGRtaENaR2xyV2s5YVFqY3lYMTh5VFdKQ1NVb3hMVWsxZEVwVFRqaGtUalZJVFRKd1ZUSkxUMnhTVXpreWN6UTJiMWR5UVZkMFEyNW5TZz09IiwiY2xhaW1zIjp7InR5cGUiOiJpbiIsImNnIjpudWxsLCJmbiI6IkpvZSIsImxuIjoiRG9lIiwiY2hubHMiOiJkZXYtd3d3LnVzLmNvbSIsInBlciI6bnVsbCwicm9sZXMiOiJBTkFMWVRJQ1NfU1VQRVJfQURNSU4iLCJvcmdJZCI6Im9yZzEiLCJzaXRlcyI6InNpdGUxLHNpdGUyLHNpdGUzIn0sImlzcyI6IkF1dGhlbnRpY2F0aW9uUHJvZmlsZSIsImlhdCI6MTY3NTk0MzczMiwiZXhwIjoxNjc2MDMwMTMyfQ._CBEpc5mDKCD7_EQAAt-Z29iClENhAuKb0gZgs4-XyQ',
          {
            apiUrl: '/cubejs-api/v1',
            headers: {
              'x-selected-site': 'site1'
            }
          }
        )}
      headers={{
        'x-selected-site': 'site1'
      }}
      />
    </CubeProvider>
  );
}
