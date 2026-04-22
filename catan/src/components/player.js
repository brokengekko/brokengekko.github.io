import React from 'react';
import { Button } from 'react-bootstrap';
import ScoreButtons from '../components/ScoreButtons';
import meta from '../proto/meta';

const Player = props => (
  <div className="player-column">
    <div className="score-row player-card">
      <h1>{props.score}</h1>
    </div>

    <div className="score-row gold">
      <img className="score-icons" src="./src/images/gold.png" alt="gold" />
      <Button className="minus-btn" onClick={() => props.incrementerButton(props.playerState.color, 'gold', -1)}>-</Button>
      {props.playerState.gold}
      <Button className="plus-btn btn" onClick={() => props.incrementerButton(props.playerState.color, 'gold', 1)}>+</Button>
    </div>
    <hr />
    <div className="score-row roads">
      <img className={`score-img ${props.playerState.color}`} src="./src/images/road.svg" alt="road" />
      <Button className="minus-btn" onClick={() => props.incrementerButton(props.playerState.color, 'roads', -1)}>-</Button>
      {props.playerState.roads}
      <Button className="plus-btn btn" onClick={() => props.incrementerButton(props.playerState.color, 'roads', 1)}>+</Button>
    </div>

    <div className="score-button-row settlements">{meta.settlements.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'settlements', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/settlement.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="settlements"
			/>
      </Button>,
	)}</div>

    <div className="score-button-row cities">{meta.cities.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'cities', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/city.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="cities"
			/>
      </Button>,
	)}</div>

    <div className="score-button-row harbors">{meta.harbors.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'harbors', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/harbors.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="harbors"
			/>
      </Button>,
	)}</div>

    <div className="score-button-row knights">{meta.knights.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'knights', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/knights.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="knights"
			/>
      </Button>,
	)}</div>
    <hr />
    <div className="score-button-row fish">{meta.fish.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'fish', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/fish.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="fish"
			/>
      </Button>,
	)}</div>

    <div className="score-row spices">{meta.spices.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'spices', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/spices.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="spices"
			/>
      </Button>,
	)}</div>

    <div className="score-row pirates">{meta.pirates.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'pirates', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/pirates.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="pirates"
			/>
      </Button>,
	)}</div>
    <hr />
    <div className="score-button-row trade">{meta.trade.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'trade', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/trade.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="trade"
			/>
      </Button>,
	)}</div>

    <div className="score-button-row politics">{meta.politics.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'politics', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/politics.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="politics"
			/>
      </Button>,
	)}</div>

    <div className="score-button-row science">{meta.science.max.map((item, idx) =>
      <Button onClick={() => props.imgButton(props.playerState.color, 'science', item)}>
        <ScoreButtons
          className="score-button"
          imgSrc="./src/images/science.svg"
          key={idx}
          index={idx}
          playerState={props.playerState}
          scoreItem="science"
			/>
      </Button>,
	)}</div>
    <hr />
    <div className="score-row defenders">
      <img className="score-icons" src="./src/images/defenders.svg" alt="defenders" />
      <Button className="minus-btn" onClick={() => props.incrementerButton(props.playerState.color, 'defenders', -1)}>-</Button>
      {props.playerState.defenders}
      <Button className="plus-btn btn" onClick={() => props.incrementerButton(props.playerState.color, 'defenders', 1)}>+</Button>
    </div>

    <div className="oneOffs">
      <div className="score-row merchant">
        <Button onClick={() => props.oneOffButton(props.playerState.color, 'merchant')}>
          <ScoreButtons
            className="score-button"
            index={props.playerState.merchant * (-1)}
            imgSrc="./src/images/merchant.svg"
            playerState={props.playerState}
            scoreItem="merchant"
			/>
        </Button>
      </div>

      <div className="score-row constitution"><Button onClick={() => props.oneOffButton(props.playerState.color, 'constitution')}>
        <ScoreButtons
          className="score-button"
          index={props.playerState.constitution * (-1)}
          imgSrc="./src/images/constitution.svg"
          playerState={props.playerState}
          scoreItem="constitution"
			/>
      </Button>
      </div>

      <div className="score-row printer"><Button onClick={() => props.oneOffButton(props.playerState.color, 'printer')}>
        <ScoreButtons
          className="score-button"
          index={props.playerState.printer * (-1)}
          imgSrc="./src/images/printer.svg"
          playerState={props.playerState}
          scoreItem="printer"
			/>
      </Button>
      </div>

      <div className="score-row boot"><Button onClick={() => props.oneOffButton(props.playerState.color, 'boot')}>
        <ScoreButtons
          className="score-boot"
          index={props.playerState.boot * (-1)}
          imgSrc="./src/images/boot.svg"
          playerState={props.playerState}
          scoreItem="boot"
			/>
      </Button>
      </div>
    </div>
  </div>
	);

module.exports = Player;
