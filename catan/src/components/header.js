import React from 'react';
import { Button, Navbar, Header, Brand, Toggle, Collapse, Nav, NavItem, MenuItem, NavDropdown } from 'react-bootstrap';

class HeaderBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Navbar inverse collapseOnSelect className="header-bar">
        <div className="title">KATANNN!!!</div>
        <div className="playerCount">
          <Button
            className="minus-btn"
            onClick={() => this.props.onChange(0)}
				>-</Button>
          <div>{`${this.props.players.length} players`}</div>
          <Button
            className="plus-btn"
            onClick={() => this.props.onChange(1)}
				>+</Button>
        </div>
        <div className="winPoint">
          <Button
            className="minus-btn"
            onClick={() => this.props.onClick('winPoint', this.props.winPoint - 1)}
				>-</Button>
          <div>{`${this.props.winPoint} points`}</div>
          <Button
            className="plus-btn"
            onClick={() => this.props.onClick('winPoint', this.props.winPoint + 1)}
				>+</Button>
        </div>
      </Navbar>
    );
  }
}

module.exports = HeaderBar;
