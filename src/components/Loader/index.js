const { h, Component } = require('preact');
const styles = require('./styles.scss').default;

class Loader extends Component {
  render() {
    return <div className={`${styles.base} ${this.props.className}`}>Loading</div>;
  }
}

module.exports = Loader;
