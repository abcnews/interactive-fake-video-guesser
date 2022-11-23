const { h, Component } = require('preact');
const styles = require('./styles.scss').default;

class Result extends Component {
  render() {
    const { percentage, label, isChosen, className, style } = this.props;

    let is = 'video is';
    if (label === 'both' || label === 'neither') {
      is = 'are';
    }

    return (
      <div
        className={[styles.base, isChosen ? styles.isChosen : null, className].filter(c => c).join(' ')}
        style={style}>
        <div>
          <span className={styles.percentage}>{percentage.toFixed(1).replace('.0', '')}%</span> said {label} {is} fake
        </div>
        <div className={styles.track}>
          <div className={styles.bar} style={{ width: percentage + '%' }} />
        </div>
      </div>
    );
  }
}

Result.defaultProps = {
  percentage: 0,
  label: 'left',
  style: {},
  isChosen: false
};

module.exports = Result;
