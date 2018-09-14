const alternatingCaseToObject = require('@abcnews/alternating-case-to-object');

module.exports.loadGuessers = () => {
  if (!window.__GUESSERS__) {
    // #guesserQUESTIONoneOPTIONSleftORrightORbothORneither
    window.__GUESSERS__ = [].slice
      .call(document.querySelectorAll('a[name^="guesser"]'))
      .map(anchor => {
        // Load some options from the anchor for possible answers
        const config = alternatingCaseToObject(anchor.getAttribute('name').replace('guesser', ''));

        let options = [];
        options.push(config.left || 'left');
        options.push(config.right || 'right');

        if (config.both) {
          options.push('both');
        }
        if (config.neither) {
          options.push('neither');
        }

        config.options = options;

        config.videoNode = anchor.previousElementSibling;
        if (config.videoNode.tagName === 'P') {
          config.videoNode = config.videoNode.previousElementSibling;
        }

        return {
          config,
          anchor,
          mountNode: createMountNode(anchor, 'guesser')
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
