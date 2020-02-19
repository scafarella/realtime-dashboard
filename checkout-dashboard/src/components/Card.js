import React, {Component} from 'react';

class Card extends Component {
    render(){
        return <div className="card">
            <header>{this.props.description}</header>
            <div>{this.props.value}</div>
            </div>
    }
}

export default Card;