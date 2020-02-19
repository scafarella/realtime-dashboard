import React, { Component } from 'react';
import fetch from 'node-fetch';
import io from 'socket.io-client';

import Header from './components/Header';
import Card from './components/Card';
import Top3 from './components/Top3';
import Toggle from './components/Toggle';

const socket = io.connect('http://127.0.0.1:3000');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: "daily",
      stats: null,
    };
    this.onToggle = this.onToggle.bind(this);
  }

  componentDidMount(){
    fetch('/stats')
    .then((response) => {
      response.json()
      .then((stats) => {
        this.setState({
          stats,
        })
      })
    })

    socket.on('stats', (stats) => {
      console.log("stats", stats);
      this.setState({
        stats,
      })
    });
  }

  onToggle(e) {
    e.preventDefault();
    const current = this.state.mode;
    let next;
    if(current ==='daily') {
      next = 'weekly';
    } else {
      next = 'daily';
    }
    this.setState({
      mode: next,
    });
  }
  render() {
    const mode = this.state.mode;
    const submittedCheckout = this.state.stats?this.state.stats[mode].submittedCheckout: 0;
    const errorCheckout = this.state.stats?this.state.stats[mode].errorCheckout: 0;
    const totalCheckout = this.state.stats?this.state.stats[mode].totalCheckout: 0;
    const top3 = this.state.stats?this.state.stats[mode].top3: [];
    return (
        <div>
          <Header />
          <div>
            <Toggle mode={mode} onToggle={this.onToggle} />
            <div className="card-container">
              <Card mode={mode} description="TOTAL CHECKOUTS" value={totalCheckout} />
              <Card mode={mode} 
                description="SUBMITTED CHECKOUTS" 
                value={submittedCheckout} />
              <Card mode={mode} description="ERROR CHECKOUTS" value={errorCheckout}/>
            </div>
            <div className="graph-containers">
              <Top3 mode={mode} value={top3} total={totalCheckout} />
            </div>
          </div>
        </div>
    );
  }
}

export default App;