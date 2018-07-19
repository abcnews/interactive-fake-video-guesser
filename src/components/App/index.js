const { h, Component } = require('preact');
const color = require('color');
const styles = require('./styles.scss');
const { Client } = require('../../poll-counter');
const Bar = require('../Bar');
const Rollup = require('../Rollup');
const colours = require('../../colours');

const client = new Client('interactive-fake-news-spotter');

class App extends Component {
  constructor(props) {
    super(props);

    this.choose = this.choose.bind(this);

    this.state = {
      hasChosen: false,
      hasLoaded: false
    };
  }

  componentDidMount() {
    // Just add empty values in until we load the real ones
    this.onResponse({});
  }

  choose(choice) {
    this.setState({ hasChosen: true });

    client.increment({ question: this.props.config.question, answer: choice }, (err, question) => {
      if (err) return console.log('Err:', err);
      this.onResponse(question.value, true);
    });
  }

  onResponse(response, hasLoaded) {
    hasLoaded = hasLoaded || this.state.hasLoaded;

    // Work out how many votes there were for an option
    let options = this.props.config.options.map(option => {
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

    this.setState(() => ({ options, hasLoaded }));
  }

  render() {
    if (this.state.hasChosen) {
      const highestResponses = this.state.options.reduce((winners, current) => {
        if (winners.length === 0 || winners[0].value < current.value) {
          return [current];
        } else if (winners[0].value === current.value) {
          return winners.concat(current);
        }
        return winners;
      }, []);

      return (
        <div className={styles.base}>
          <Bar options={this.state.options} />

          <div className={styles.response}>
            {!this.state.hasLoaded && (
              <div className="u-richtext">
                <p>
                  <span className={styles.loading}>Comparing your answer to everybody else...</span>
                </p>
              </div>
            )}

            {this.state.hasLoaded && (
              <div>
                <div className={styles.results}>
                  {this.state.options.map((option, index) => {
                    return (
                      <span className={styles.result} style={{ color: color(colours[index]).darken(0.3) }}>
                        {option.percentage.toFixed(1)}% {option.name}
                      </span>
                    );
                  })}
                </div>

                <div className="u-richtext">
                  {highestResponses.length === this.state.options.length && (
                    <p>There is an even split between what people thought was fake.</p>
                  )}

                  {highestResponses.length < this.state.options.length && (
                    <p>
                      <strong>{Math.floor(highestResponses[0].percentage * highestResponses.length)}%</strong> chose{' '}
                      <strong>{highestResponses.map(r => r.name).join(' or ')}</strong> as being fake.
                    </p>
                  )}
                </div>

                <Rollup node={this.props.rollup} />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.options}>
        {this.props.config.options.map((option, index) => {
          const textColor = color(colours[index]).isDark() ? 'white' : 'black';

          return (
            <button
              className={styles[textColor]}
              style={{
                background: colours[index],
                color: textColor
              }}
              onClick={() => this.choose(option)}>
              {option}
            </button>
          );
        })}
      </div>
    );
  }
}

module.exports = App;
