const { h, Component } = require('preact');

class Rollup extends Component {
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    if (!this.props.node) return;

    this.base.appendChild(this.props.node);
  }

  componentWillUnmount() {
    const { node } = this.props;

    if (node && this.base.contains(node)) {
      this.base.removeChild(node);
    }
  }

  render() {
    return <div className="u-richtext" style={{ textAlign: 'left' }} />;
  }
}

module.exports = Rollup;
