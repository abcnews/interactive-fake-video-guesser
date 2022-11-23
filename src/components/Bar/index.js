const { h, Component } = require('preact');
const styles = require('./styles.scss').default;
const colours = require('../../colours');

class Bar extends Component {
  render() {
    const { options } = this.props;

    return (
      <div className={styles.base}>
        {options.map((option, index) => {
          return (
            <div
              className={styles.bar}
              style={{ width: option.percentage + '%', background: colours[index] }}
              title={`${option.percentage.toFixed(1)}% ${option.name}`}
            />
          );
        })}
      </div>
    );
  }
}

module.exports = Bar;
