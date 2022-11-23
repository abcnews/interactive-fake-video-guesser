const { h, Component } = require('preact');
const styles = require('./styles.scss').default;

class Gauge extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // value is between 0 and 100
    // angle is between -180 and 0
    // -180 * value * 0.1

    return (
      <div className={styles.base}>
        <div className={styles.background} />
        <div className={styles.needle} style={{ transform: `rotate(${-180 * (this.props.value * 0.01)}deg)` }} />
        <div className={styles.knob} />
      </div>
    );
  }
}

module.exports = Gauge;
