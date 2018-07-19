require('es6-promise/auto');
require('isomorphic-fetch');

const { h, render } = require('preact');
const { loadGuessers } = require('./loader');

const PROJECT_NAME = 'fake-guesser';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  loadGuessers().forEach(guesser => {
    const App = require('./components/App');
    render(<App config={guesser.config} rollup={guesser.rollup} />, guesser.mountNode, guesser.mountNode.firstChild);
  });
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require('./components/ErrorBox');
      render(<ErrorBox error={err} />, root, root.firstChild);
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
