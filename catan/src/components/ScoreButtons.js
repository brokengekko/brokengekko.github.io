import React from 'react';
import { Button } from 'react-bootstrap';

const ScoreButtons = props => {
	return (
		<img className={`score-img ${props.index < props.playerState[props.scoreItem] ? props.playerState.color : 'grey'}`} src={props.imgSrc } />
		);
};

export default ScoreButtons;
