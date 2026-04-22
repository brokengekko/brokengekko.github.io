import React from 'react';
import { Button, Navbar } from 'react-bootstrap';

class PaletteMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { draggedItem: null };
  }
  onDragStart(e, index) {
    this.setState({ draggedItem: index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  }
  onDragOver(e, index) {
    e.preventDefault();
    const draggedOverItem = index;
    if (this.state.draggedItem === draggedOverItem || this.state.draggedItem === null) return;
    let items = [...this.props.items];
    let draggedColor = items[this.state.draggedItem];
    items.splice(this.state.draggedItem, 1);
    items.splice(draggedOverItem, 0, draggedColor);
    
    this.props.onChange(items);
    this.setState({ draggedItem: draggedOverItem });
  }
  onDragEnd() {
    this.setState({ draggedItem: null });
  }
  render() {
    return (
      <div className="palette-menu">
        {this.props.items.map((color, idx) => (
          <div
            key={color}
            className="palette-item"
            onDragOver={e => this.onDragOver(e, idx)}
          >
            <div
              className={`palette-color-block ${color}`}
              draggable
              onDragStart={e => this.onDragStart(e, idx)}
              onDragEnd={() => this.onDragEnd()}
            >
              <div className="grip-dots" />
            </div>
          </div>
        ))}
      </div>
    );
  }
}

class HeaderBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isPaletteOpen: false, newOrder: props.players.map(p => p.color) };
  }
  componentWillReceiveProps(nextProps) {
    if (!this.state.isPaletteOpen) {
      this.setState({ newOrder: nextProps.players.map(p => p.color) });
    }
  }
  togglePalette() {
    if (this.state.isPaletteOpen) {
      this.props.onReorder(this.state.newOrder);
      this.setState({ isPaletteOpen: false });
    } else {
      this.setState({ isPaletteOpen: true, newOrder: this.props.players.map(p => p.color) });
    }
  }
  closePalette() {
    if (!this.state.isPaletteOpen) return;
    this.props.onReorder(this.state.newOrder);
    this.setState({ isPaletteOpen: false });
  }
  componentDidMount() {
     document.addEventListener("mousedown", this.handleClickOutside.bind(this));
  }
  componentWillUnmount() {
     document.removeEventListener("mousedown", this.handleClickOutside.bind(this));
  }
  handleClickOutside(e) {
     if (this.containerNode && !this.containerNode.contains(e.target)) {
         this.closePalette();
     }
  }
  render() {
    return (
      <Navbar inverse collapseOnSelect className="header-bar">
        <div className="title-section" style={{display: 'flex', alignItems: 'center', flex: '1 1 33.33%'}} ref={n => this.containerNode = n}>
           <div className="title" style={{flex: 'none'}}>Uber Katan</div>
           <div className="palette-container">
              <button className="palette-icon-btn" onClick={this.togglePalette.bind(this)}>
                  <div className="icon-mask" style={{WebkitMaskImage: "url('./src/images/palette.svg')", maskImage: "url('./src/images/palette.svg')", backgroundColor: "#2c3e50"}} />
              </button>
              {this.state.isPaletteOpen && 
                 <PaletteMenu 
                   items={this.state.newOrder} 
                   onChange={newOrder => this.setState({ newOrder })} 
                 />
              }
           </div>
        </div>
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
          <div className="winPoint-badge">{`${this.props.winPoint} points`}</div>
        </div>
      </Navbar>
    );
  }
}

module.exports = HeaderBar;
