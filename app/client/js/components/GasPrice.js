import Slider, { createSliderWithTooltip } from 'rc-slider';
const SliderWithTooltip = createSliderWithTooltip(Slider);

class GasPrice extends React.Component {

  render() {

    const sl = this.props.safeLow
    const a = this.props.average

    const marks = {}

    if (sl != a) {
      marks[sl] = <strong>{sl}<br/>(safe low)</strong>
      marks[a] = <strong>{a}<br/>(average)</strong>
    } else {
      marks[sl] = <strong>{sl}<br/>(safe low & average)</strong>
    }

    let step = 0.1
    let max = Math.round(a + (a < 10 ? a / 2 : a/3))
    marks[max] = max

    return (<div style={{margin: '32px 8px 64px'}}>
      <SliderWithTooltip min={sl} marks={marks} step={step} included={false} onChange={this.props.handlePrice} defaultValue={a} max={max}/>
      </div>
    )


  }
}

export default GasPrice
