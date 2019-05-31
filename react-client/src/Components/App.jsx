import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { broswerHistory } from 'react-router';
import HomePage from './HomePage';
import NavBar from './HeaderComponent/NavBar';

class App extends Component {
	render() { 
		return (
			<Router>
				<React.Fragment>
					<NavBar />
					<Route name="home" exact path="/" component={HomePage} />
				</React.Fragment>
			</Router>
		);
	}
}
 
export default App;