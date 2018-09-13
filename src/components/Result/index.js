const { h, Component } = require('preact');
const styles = require('./styles.scss');

class Result extends Component {
  render() {
    const { percentage, label, isChosen, className, style } = this.props;

    let the = 'the ';
    let is = 'video is';
    if (label === 'both' || label === 'neither') {
      the = '';
      is = 'are';
    }

    return (
      <div
        className={[styles.base, isChosen ? styles.isChosen : null, className].filter(c => c).join(' ')}
        style={style}>
        <div>
          {percentage.toFixed(1).replace('.0', '')}% think {the}
          {label} {is} fake
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