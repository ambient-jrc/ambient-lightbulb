import React from 'react';
import { Image } from 'semantic-ui-react';

export default class WeatherMap extends React.Component {
	render() {
		const img = "http://www.orangesmile.com/common/img_city_maps/oahu-hawaii-map-1.jpg";
		return (
			<Image fluid src={img} />
		);
	}
}