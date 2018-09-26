const { h, Component } = require('preact');
const smoothscroll = require('smoothscroll');
const styles = require('./styles.scss');
const { Client } = require('../../poll-counter');
const Result = require('../Result');
const Loader = require('../Loader');

const client = new Client('interactive-fake-news-spotter');

class App extends Component {
  constructor(props) {
    super(props);

    this.onResize = this.onResize.bind(this);

    this.choose = this.choose.bind(this);
    this.getVideo = this.getVideo.bind(this);
    this.injectVideo = this.injectVideo.bind(this);

    this.getRollup = this.getRollup.bind(this);
    this.revealRollups = this.revealRollups.bind(this);

    this.showButtons = this.showButtons.bind(this);

    this.state = {
      areButtonsVisible: false,
      isPortrait: window.innerWidth <= 499,
      video: null,
      videoWidth: 0,
      videoHeight: 0,
      hasChosen: false,
      hasLoaded: false,
      options: props.config.options.map(option => {
        return {
          name: option,
          value: 0
        };
      }),
      hasBoth: false,
      hasNeither: false,
      choice: ''
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);

    // Just add empty values in until we load the real ones
    this.onResponse({});

    this.getVideoTimer = setTimeout(this.getVideo, 100);
    this.getRollupTimer = setTimeout(this.getRollup, 100);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);

    clearTimeout(this.getVideoTimer);
    clearTimeout(this.getRollupTimer);
  }

  onResize() {
    this.setState({ isPortrait: window.innerWidth <= 499 });
  }

  getVideo() {
    let video = this.base.parentElement.previousElementSibling;
    if (!video || video.className.indexOf('Video') === -1 || video.offsetHeight < 100) {
      clearTimeout(this.getVideoTimer);
      this.getVideoTimer = setTimeout(this.getVideo, 100);
    } else {
      let videoWidth = video.offsetWidth;
      let videoHeight = video.offsetHeight;

      // Videos are a weird res on mobile
      if (this.state.isPortrait) {
        let sizer = video.querySelector('*[class^="u-sizer"]');
        // videoHeight = (sizer.offsetWidth / 65) * 108;
        videoHeight = (sizer.offsetWidth / 1090) * 1744;
        sizer.style.setProperty('height', videoHeight + 'px');
      }

      if (video.querySelector('video').paused) {
        video.querySelector('video').addEventListener('play', e => {
          this.showButtons();
        });
      } else {
        this.showButtons();
      }

      video.parentElement.removeChild(video);
      this.setState(state => ({ video, videoWidth, videoHeight }));
    }
  }

  showButtons() {
    this.setState({ areButtonsVisible: true });
  }

  injectVideo(element) {
    if (!element) return;

    element.appendChild(this.state.video);
  }

  getRollup() {
    const { config } = this.props;

    if (!config.rollup) return;

    this.rollups = [];
    let element = this.base.parentElement.nextElementSibling; // this is the guesser anchor tag, ignore it
    for (var i = 0; i < config.rollup; i++) {
      element = element.nextElementSibling;

      // Before and after hasn't loaded yet.
      if (element.tagName === 'A') {
        this.getRollupTimer = setTimeout(this.getRollup, 100);
        return;
      }

      this.rollups.push(element);
      element.style.setProperty('max-height', '0');
      element.style.setProperty('margin-bottom', '0px');
      element.style.setProperty('transition', 'opacity 0.5s ease 0s');
      element.style.setProperty('opacity', 0);
    }
  }

  revealRollups() {
    if (!this.rollups) return;

    this.rollups.forEach(element => {
      element.style.removeProperty('margin-bottom');
      element.style.removeProperty('max-height');
      element.style.setProperty('opacity', 1);
    });
  }

  choose(choice) {
    this.setState({ hasChosen: true, choice });

    smoothscroll(this.base.offsetTop - 10, 400, () => {
      client.increment({ question: this.props.config.question, answer: choice }, (err, question) => {
        if (err) return console.log('Err:', err);
        this.onResponse(question.value, true);
      });
    });
  }

  onResponse(response, hasLoaded) {
    hasLoaded = hasLoaded || this.state.hasLoaded;

    let hasBoth = false;
    let hasNeither = false;

    // Work out how many votes there were for an option
    let options = this.props.config.options.map((option, index) => {
      if (option === 'both') {
        hasBoth = true;
      }
      if (option === 'neither') {
        hasNeither = true;
      }

      return {
        name: option,
        value: response[option] || this.state.options[index].value || 0
      };
    });

    const total = options.reduce((sum, option) => {
      return sum + option.value;
    }, 0);

    // Work out each option as a perctange of total votes
    options = options.map(option => {
      option.percentage = total === 0 ? 100 / options.length : (option.value * 100) / total;
      return option;
    });

    this.setState(() => ({ options, hasLoaded, hasBoth, hasNeither }));

    this.revealRollups();
  }

  render() {
    const { areButtonsVisible, options, choice } = this.state;
    let ui;

    let leftLabel = options[0].name;
    let rightLabel = options[1].name;
    if (this.state.isPortrait) {
      leftLabel = leftLabel === 'left' ? 'top' : leftLabel;
      rightLabel = rightLabel === 'right' ? 'bottom' : rightLabel;
    }

    if (this.state.hasChosen) {
      let leftTop = `${this.state.videoHeight - 40}px`;
      let rightTop = `${this.state.videoHeight - 40}px`;
      let bothTop = '50%';
      let neitherTop = '50%';

      if (this.state.isPortrait) {
        leftTop = `40px`;
        rightTop = `${this.state.videoHeight - 45}px`;
        bothTop = `${this.state.videoHeight / 2}px`;
        neitherTop = `${this.state.videoHeight + 50}px`;
      }

      ui = (
        <div className={styles.response}>
          {!this.state.hasLoaded && <Loader className={styles.loader} />}

          {this.state.hasLoaded && (
            <div>
              <div className={styles.results}>
                <Result
                  className={styles.leftResult}
                  style={{ top: leftTop }}
                  percentage={options[0].percentage}
                  label={leftLabel}
                  isChosen={options[0].name === choice}
                />
                <Result
                  className={styles.rightResult}
                  style={{ top: rightTop }}
                  percentage={options[1].percentage}
                  label={rightLabel}
                  isChosen={options[1].name === choice}
                />

                {(this.state.hasBoth || this.state.hasNeither) && (
                  <div className={styles.bothAndNeither}>
                    {options.map(option => {
                      if (option.name === 'both') {
                        return (
                          <Result
                            className={styles.bothResult}
                            style={{ top: bothTop }}
                            percentage={option.percentage}
                            label={option.name}
                            isChosen={option.name === choice}
                          />
                        );
                      } else if (option.name === 'neither') {
                        return (
                          <Result
                            className={styles.neitherResult}
                            style={{ top: neitherTop }}
                            percentage={option.percentage}
                            label={option.name}
                            isChosen={option.name === choice}
                          />
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      let leftButtonTop = `${this.state.videoHeight - 48}px`;
      let rightButtonTop = `${this.state.videoHeight - 48}px`;
      let bothButtonTop = '0px';
      let neitherButtonTop = '0px';

      if (this.state.isPortrait) {
        leftButtonTop = `40px`;
        rightButtonTop = `${this.state.videoHeight - 35}px`;
        bothButtonTop = `${this.state.videoHeight / 2}px`;
        neitherButtonTop = `${this.state.videoHeight + 40}px`;
      }

      ui = (
        <div className={styles.options}>
          <button
            className={styles.leftButton}
            onClick={() => this.choose(options[0].name)}
            style={{ top: leftButtonTop, visibility: areButtonsVisible ? 'visible' : 'hidden' }}>
            {leftLabel} is fake
          </button>
          <button
            className={styles.rightButton}
            onClick={() => this.choose(options[1].name)}
            style={{ top: rightButtonTop, visibility: areButtonsVisible ? 'visible' : 'hidden' }}>
            {rightLabel} is fake
          </button>
          {(this.state.hasBoth || this.state.hasNeither) && (
            <div className={styles.bothAndNeither}>
              {options.map(option => {
                if (option.name === 'both') {
                  return (
                    <button
                      className={styles.bothButton}
                      style={{ top: bothButtonTop, visibility: areButtonsVisible ? 'visible' : 'hidden' }}
                      onClick={() => this.choose(option.name)}>
                      {option.name} are fake
                    </button>
                  );
                } else if (option.name === 'neither') {
                  return (
                    <button
                      className={styles.neitherButton}
                      style={{ top: neitherButtonTop, visibility: areButtonsVisible ? 'visible' : 'hidden' }}
                      onClick={() => this.choose(option.name)}>
                      {option.name} are fake
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>
      );
    }

    if (!this.state.video) return <div />;

    return (
      <div className={`${styles.base2} ${this.state.isPortrait ? styles.scaled : ''}`}>
        <div ref={this.injectVideo} />
        {ui}
      </div>
    );
  }
}

module.exports = App;
