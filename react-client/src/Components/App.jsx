import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { broswerHistory } from 'react-router';
import NavBar from './HeaderComponent/NavBar';
import Home from './Home';
import About from './About';
import Contact from './Contact';

class App extends Component {
	render() { 
		return (
			<Router>
				<NavBar />
				<Route name="home" exact path="/" component={Home} />
				<Route name="about" path="/about" component={About} />
				<Route mame="contact" path="/contact" component={Contact} />
			</Router>
		);
	}
}
 
export default App;