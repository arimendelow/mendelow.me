import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class NavBar extends Component {
	render() { 
		const buttonStyleFirst = "text-gray-700 hover:text-gray-500 no-underline";
		const buttonStyle = "text-gray-700 hover:text-gray-500 no-underline ml-4 md:ml-8";
		return (
			<div className="mx-auto px-6 sm:px-8 lg:px-12 xl:px-24 lg:max-w-2lg xl:max-w-6xl">
				<header className="py-8 text-center sm:pt-16 sm:pb-12 sm:flex sm:items-end sm:justify-between">
					<Link
						className="inline-flex items-baseline text-white no-underline text-2xl antialiased hover:translateY-1px hover:transition-1s"
						to="/"
					>
						<div className="text-blue-500 mr-0.5">Ari</div>
						<div className="font-bold text-yellow-500">Mendelow</div>
					</Link>
					<nav id="headerButtons" className="font-medium antialiased mt-4 sm:mt-0">
						<Link className={buttonStyleFirst} to="/about">About</Link>
						<Link className={buttonStyle} to="/contact">Contact</Link>
					</nav>
				</header>
			</div>
		);
	}
}

export default NavBar;