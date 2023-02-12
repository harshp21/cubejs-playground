import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { createHashHistory } from 'history';

import App from './App';
import {
  ExplorePage,
} from './pages';

const history = createHashHistory();

ReactDOM.render(
  <Router history={history}>
    <App>
      <Route
        key="build"
        path="/"
        component={(props) => {
          return (
              <ExplorePage {...props} />
          );
        }}
      />
    </App>
  </Router>,
  // eslint-disable-next-line no-undef
  document.getElementById('playground-root')
);
