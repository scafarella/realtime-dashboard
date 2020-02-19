import React, {Component} from 'react';

class Toggle extends Component {
    constructor(props) {
        super(props);
    }

    render(){
    return <a className="toggle" onClick={(e) => this.props.onToggle(e)}>{this.props.mode} Report</a>
    }
}

export default Toggle;