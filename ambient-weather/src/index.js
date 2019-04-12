import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import 'semantic-ui-css/semantic.min.css';
import TopMenu from './top_menu';
import WeatherMap from './weather_map';

class AmbientWeather extends React.Component {
	
	render() {
		return (
			<div>
				<TopMenu />
				<WeatherMap />
			</div>
		);
	}
}

ReactDOM.render(<AmbientWeather />, document.getElementById('root'));