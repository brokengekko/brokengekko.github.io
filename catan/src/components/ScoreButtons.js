import React from 'react';
import { Button } from 'react-bootstrap';

const ScoreButtons = props => {
	return (
		<div
			className={`icon-mask ${props.index < props.playerState[props.scoreItem] ? props.playerState.color : 'grey'}`}
			style={{ WebkitMaskImage: `url('${props.imgSrc}')`, maskImage: `url('${props.imgSrc}')` }}
		/>
		);
};

export default ScoreButtons;
