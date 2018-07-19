const alternatingCaseToObject = require('@abcnews/alternating-case-to-object');

module.exports.loadGuessers = () => {
  if (!window.__GUESSERS__) {
    // #guesserQUESTIONoneOPTIONSleftORrightORbothORneither
    window.__GUESSERS__ = [].slice
      .call(document.querySelectorAll('a[name^="guesser"]'))
      .map(anchor => {
        // Load some options from the anchor for possible answers
        const config = alternatingCaseToObject(anchor.getAttribute('name').replace('guesser', ''));
        config.options = [config.options].concat(config.or).map(option => {
          return option.slice(0, 1).toUpperCase() + option.slice(1).toLowerCase();
        });
        delete config.or;

        const mountNode = createMountNode(anchor);

        // Grab the text just below the anchor
        let nextElement;
        // TODO: Make rollup and option
        // if (config.rollup) {
        nextElement = anchor.nextElementSibling;
        nextElement.parentNode.removeChild(nextElement);
        // }

        return {
          config,
          anchor,
          mountNode,
          rollup: nextElement
        };
      })
      .filter(a => a);
  }
  return window.__GUESSERS__;
};

/**
 * Create a node to mount the guesser onto
 * @param {HTMLElement} anchor
 * @param {string?} className
 */
function createMountNode(anchor, className) {
  const mountNode = document.createElement('div');
  mountNode.className = className || '';
  anchor.parentNode.insertBefore(mountNode, anchor);

  return mountNode;
}
