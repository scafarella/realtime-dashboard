import React, {Component} from 'react';

class Top3 extends Component {
    render(){
        const firstName = this.props.value.length > 0?this.props.value[0].name:"";
        const firstValue = this.props.value.length > 0?Math.ceil((this.props.value[0].count/this.props.total)*100): 0;
        const secondName = this.props.value.length > 0?this.props.value[1].name: "";
        const secondValue = this.props.value.length > 0?Math.ceil((this.props.value[1].count/this.props.total)*100):0;
        const thirdName = this.props.value.length > 0?this.props.value[2].name:"";
        const thirdValue = this.props.value.length > 0?Math.ceil((this.props.value[2].count/this.props.total)*100): 0;
        const firstValuePerc = `${firstValue}%`;
        const thirdValuePerc = `${thirdValue}%`
        const secondValuePerc = `${secondValue}%`
        const divStyleFirst = {
            backgroundColor: 'red',
            width: firstValuePerc
        };


        const divStyleSecond = {
            backgroundColor: 'blue',
            width: secondValuePerc
        };

        const divStyleThird = {
            backgroundColor: 'green',
            width: thirdValuePerc
        };

        return (<div className="top3">
            <header>Top 3 checkout's type</header>
            <div>
                <ul>
                    <li>
                        <p className="bar" style={divStyleFirst}> {firstName} {firstValuePerc}</p>
                    </li>
                    <li>
                        <p className="bar" style={divStyleSecond}> {secondName} {secondValuePerc}</p>
                    </li>
                    <li>
                        <p className="bar" style={divStyleThird}> {thirdName} {thirdValuePerc}</p>
                    </li>
                </ul>
            </div>
            
            </div>)
    }
}

export default Top3;