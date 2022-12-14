require("es6-promise/auto");
require("isomorphic-fetch");

const { h, render } = require("preact");
const { whenOdysseyLoaded } = require("@abcnews/env-utils");
import { selectMounts } from "@abcnews/mount-utils";

const { loadGuessers } = require("./loader");

/**
 * Transforms PL mount points back into Phase 1 style anchor tags.
 * Useful for porting old stories to support rendering in PL.
 * eg. <div id="hashname"></div> ----> <a name="hashname"> </a>
 */
function backtransformMounts() {
  const mounts = selectMounts();

  mounts.forEach((mount) => {
    const anchorEl = document.createElement("a");
    anchorEl.name = mount.id;
    anchorEl.innerHTML = " ";

    // replace element
    mount.parentNode.replaceChild(anchorEl, mount);
  });
}

const PROJECT_NAME = "fake-guesser";
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  backtransformMounts();

  // Dynamically load our original before and after code
  const scriptTag = document.createElement("script");
  scriptTag.setAttribute(
    "src",
    "https://www.abc.net.au/res/sites/news-projects/interactive-before-and-after/3.0.10/index.js"
  );
  document.head.appendChild(scriptTag);

  loadGuessers().forEach((guesser) => {
    const App = require("./components/App");
    render(
      <App config={guesser.config} rollup={guesser.rollup} />,
      guesser.mountNode,
      guesser.mountNode.firstChild
    );
  });
}

whenOdysseyLoaded
  .then(() => {
    init();
  })
  .catch((e) => console.error(e));

if (module.hot) {
  module.hot.accept("./components/App", () => {
    try {
      init();
    } catch (err) {
      const ErrorBox = require("./components/ErrorBox");
      render(<ErrorBox error={err} />, root, root.firstChild);
    }
  });
}

if (process.env.NODE_ENV === "development") {
  require("preact/devtools");
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
