const { h, Component } = require('preact');
const styles = require('./styles.scss');
const { Client } = require('../../poll-counter');
const Rollup = require('../Rollup');
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

    this.state = {
      isPortrait: window.innerWidth <= window.innerHeight,
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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    clearTimeout(this.getVideoTimer);
  }

  onResize() {
    if (window.innerWidth <= window.innerHeight && !this.state.isPortrait) {
      this.setState({ isPortrait: true });
    }
  }

  getVideo() {
    let video = this.base.parentElement.previousElementSibling;
    if (!video || video.className.indexOf('Video') === -1) {
      clearTimeout(this.getVideoTimer);
      this.getVideoTimer = setTimeout(this.getVideo, 100);
    } else {
      let videoWidth = video.offsetWidth;
      let videoHeight = video.offsetHeight;
      video.parentElement.removeChild(video);
      this.setState(state => ({ video, videoWidth, videoHeight }));
    }
  }

  injectVideo(element) {
    if (!element) return;

    element.appendChild(this.state.video);
  }

  choose(choice) {
    this.setState({ hasChosen: true, choice });

    client.increment({ question: this.props.config.question, answer: choice }, (err, question) => {
      if (err) return console.log('Err:', err);
      this.onResponse(question.value, true);
    });
  }

  onResponse(response, hasLoaded) {
    hasLoaded = hasLoaded || this.state.hasLoaded;

    let hasBoth = false;
    let hasNeither = false;

    // Work out how many votes there were for an option
    let options = this.props.config.options.map(option => {
      if (option === 'both') {
        hasBoth = true;
      }
      if (option === 'neither') {
        hasNeither = true;
      }

      return {
        name: option,
        value: response[option] || 0
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
  }

  render() {
    const { options, choice } = this.state;
    let ui;

    let leftLabel = options[0].name;
    let rightLabel = options[1].name;
    if (this.isPortrait) {
      leftLabel = leftLabel === 'left' ? 'top' : leftLabel;
      rightLabel = rightLabel === 'right' ? 'bottom' : rightLabel;
    }

    if (this.state.hasChosen) {
      let leftTop = `${this.state.videoHeight - (this.state.hasBoth ? 180 : 80)}px`;
      let rightTop = `${this.state.videoHeight - (this.state.hasBoth ? 180 : 80)}px`;
      let bothTop = `${this.state.videoHeight - 80}px`;

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
                  isChosen={leftLabel === choice}
                />
                <Result
                  className={styles.rightResult}
                  style={{ top: rightTop }}
                  percentage={options[1].percentage}
                  label={rightLabel}
                  isChosen={rightLabel === choice}
                />

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
                        percentage={option.percentage}
                        label={option.name}
                        isChosen={option.name === choice}
                      />
                    );
                  }
                })}
              </div>

              <Rollup nodes={this.props.rollup} />
            </div>
          )}
        </div>
      );
    } else {
      let leftButtonTop = `${this.state.videoHeight - (this.state.hasBoth ? 130 : 60)}px`;
      let rightButtonTop = `${this.state.videoHeight - (this.state.hasBoth ? 130 : 60)}px`;
      let bothButtonTop = `${this.state.videoHeight - 60}px`;

      // TODO: if mobile then left is now videoHeight / 2 - 40? and right is videoHeight - 40

      ui = (
        <div className={styles.options}>
          <button className={styles.leftButton} onClick={() => this.choose(leftLabel)} style={{ top: leftButtonTop }}>
            {leftLabel} is fake
          </button>
          <button
            className={styles.rightButton}
            onClick={() => this.choose(rightLabel)}
            style={{ top: rightButtonTop }}>
            {rightLabel} is fake
          </button>

          {options.map(option => {
            if (option.name === 'both') {
              return (
                <button
                  className={styles.bothButton}
                  style={{ top: bothButtonTop }}
                  onClick={() => this.choose(option.name)}>
                  {option.name} are fake
                </button>
              );
            } else if (option.name === 'neither') {
              return (
                <div className={styles.neitherButtonWrapper}>
                  <button className={styles.neitherButton} onClick={() => this.choose(option.name)}>
                    {option.name} are fake
                  </button>
                </div>
              );
            }
          })}
        </div>
      );
    }

    if (!this.state.video) return <div />;

    return (
      <div className={styles.base}>
        <div ref={this.injectVideo} />
        {ui}
      </div>
    );
  }
}

module.exports = App;
