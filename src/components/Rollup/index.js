const { h, Component } = require('preact');

class Rollup extends Component {
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    if (!this.props.nodes) return;

    this.props.nodes.forEach(node => {
      this.base.appendChild(this.props.node);
    });
  }

  componentWillUnmount() {
    const { nodes } = this.props;

    if (!nodes) return;

    nodes.forEach(node => {
      if (this.base.contains(node)) {
        this.base.removeChild(node);
      }
    });
  }

  render() {
    return <div className="u-richtext" style={{ textAlign: 'left' }} />;
  }
}

module.exports = Rollup;
