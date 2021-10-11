import { render } from 'react-dom';
import { App } from './App';

const renderApp = (): void => {
  const url = new window.URL(window.location.href);
  render(App({ url }), document.getElementById('root'));
};

window.addEventListener('popstate', renderApp);
renderApp();
