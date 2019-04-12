import React from 'react';
import { Menu } from 'semantic-ui-react';

export default class TopMenu extends React.Component {
	render() {
		return (
			<Menu color='yellow' inverted className='topmenu'>
				<Menu.Item header>Oahu Weather</Menu.Item>
				<Menu.Item position='right'>Lightbulb</Menu.Item>
			</Menu>
		);
	}
}