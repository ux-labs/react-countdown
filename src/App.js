import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    const localStorageValues = this.getFromLocalStorage('5:00', 'default');
    this.state = {
      value: localStorageValues.initialValue,
      initial: localStorageValues.initialValue,
      theme: localStorageValues.theme,
      color: 'white',
      counting: false
    };
    this.audioRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSwapTheme = this.handleSwapTheme.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  getFromLocalStorage(time, theme) {
    if (!localStorage.initialValue || !localStorage.theme) {
      this.setFromLocalStorage(time, theme);
    }
    return { initialValue: localStorage.initialValue, theme: localStorage.theme };
  }

  setFromLocalStorage(time, theme = 'default') {
    if (time) {
      localStorage.initialValue = time;
    }
    if (theme) {
      localStorage.theme = theme;
    }
    return { time, theme };
  }
  
  handleReset(event) {
    this.setState({ 
      color: 'white',
      value: this.state.initial
    });
    this.stopCounter();
    this.audioRef.current.pause();
  }
  
  handleKeyUp(event) {
    let eventKey = event.key;
    let value = event.target.value;
    let invalid = event.target.validity.patternMismatch;
    if (eventKey === "Enter" || eventKey === "Tab" || invalid) {
      return;
    }
    this.setState({ initial: value });
    this.stopCounter();
    this.setFromLocalStorage(value);
  }


  handleChange(event) {
    let value = event.target.value;
    this.setState({ value: value });
  }
  
  handleSubmit(event) {
    if (this.state.counting) {
      this.stopCounter();
    } else {
      this.startCounter();
    }
    event.preventDefault();
  }
  
  handleSwapTheme(event) {
    const newTheme = this.state.theme==='default'?'safari':'default';
    this.setState({theme: newTheme});
    this.setFromLocalStorage( null, newTheme);
  }

  startCounter() {
    this.setState({ counting: true });
    this.timerID = setInterval(
      () => this.decrement(),
      1000
    );
  }

  stopCounter() {
    this.setState({ counting: false });
    clearInterval(this.timerID);
  }

  async playAudio() {
    try {
      await this.audioRef.current.play();
    } catch(err) {
      console.warn("Error: " + err);
    }
  }

  soundAlarm(count) {
    let bip = this.state.theme==='default' ? 'bip' : Math.floor(Math.random() * 9) + 1;
    let final =  this.state.theme ==='default' ? 'alarm' : 'final';
    this.audioRef.current.src = "./sound/" + (count > 0 ? bip : final) + ".mp3"
    return this.playAudio();
  }

  decrement() {
    let initial = this.state.initial;
    let displayed = this.state.value;
    let minutes = displayed.split(":")[0] || 0;
    let seconds = displayed.split(":")[1] || 0;

    let current = ((+minutes * 60) + +seconds);  
    let total = +(initial.split(":")[0] || 0) * 60 + +(initial.split(":")[1] || 0);
    let percent = current / total * 100;

    if (percent < 40) {
      this.setState({color: 'yellow'});
    } 
    if (percent < 15) {
      this.setState({color: 'red'});
    }
    
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      this.soundAlarm(minutes+1);
    }
    if (minutes < 0) {
      this.stopCounter();
      displayed = "0:00";
      setTimeout(()=> { this.handleReset()}, 10000);
    } else {
      displayed = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }
    this.setState({value: displayed});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className={this.state.value==='0:00'?'animated':''}>
      <input type="text" id="visor" 
        style={{color: this.state.color}}
        value={this.state.value}
        onChange={this.handleChange}
        onKeyUp={this.handleKeyUp}
        placeholder="0:00"
        maxLength="5" 
        pattern="[0-6]?[0-9]+:?[0-6]?[0-9]?"
        title="Insira um valor no formato minutos : segundos ou um número de minutos. Exemplo: 5:30 ou 5."
        required />
        <div className="controles">
          <button type="button" id="theme" className={this.state.theme} onClick={this.handleSwapTheme}></button>
          <button type="submit" id="start" className={this.state.value==='0:00'?`invisivel`:``}>{this.state.counting?`Pausar`:`Iniciar`}</button>
          <button type="button" id="reset" onClick={this.handleReset} className={this.state.initial === this.state.value?`invisivel`:``}>{`Voltar para ` + this.state.initial}</button>
        </div>
        <audio id="sound" ref={this.audioRef} src="./sound/bip.mp3"></audio>
      </form>
    );
  }
}

export default App;
