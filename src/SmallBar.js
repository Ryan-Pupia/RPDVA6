
import React, { Component } from "react";

class SmallBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    console.log("Mounted")
    this.renderBars();
  }

  componentDidUpdate() {
    this.renderBars();
  }

  renderBars() {
    const model = this.props.model
    const data = this.props.data
    console.log("hello")
    console.log(data)
  }
  
  render() {
    return (
      <div className="SmallBar">
        Hello
      </div>
    );
  }
}

export default SmallBar;
