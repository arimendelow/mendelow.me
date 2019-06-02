import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'

class NavBar extends Component {
	render() {
		return (
			<div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-24 lg:max-w-2lg xl:max-w-6xl">
				<header className="py-8 text-center sm:pt-16 sm:pb-12 sm:flex sm:items-end sm:justify-between">
					<NavLink
						className="inline-flex items-baseline text-white no-underline text-2xl antialiased hover:translateY-1px hover:transition-1s"
						to="/"
					>
						<div className="text-blue-500 mr-1">Ari</div>
						<div className="font-bold text-yellow-500">Mendelow</div>
					</NavLink>
					<nav id="headerButtons" className="font-medium antialiased mt-4 sm:mt-0">
						<NavLink className="nav-btn" to="/about" activeClassName="active">About</NavLink>
						<NavLink className="nav-btn" to="/contact" activeClassName="active">Contact</NavLink>
					</nav>
				</header>
			</div>
		);
	}
}

export default NavBar;