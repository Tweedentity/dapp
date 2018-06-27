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

    let odd = 10 * sl % 2;
    let step = 0.1
    let min
    if (sl < 2) {
      min = sl - 2 * step
    } else {
      min = sl - 5 * step
    }
    const max = a + (a - min)

    marks[min] = min
    marks[max] = max

    return (<div style={{margin: '32px 8px 64px'}}>
      <SliderWithTooltip min={min} marks={marks} step={step} included={false} onChange={this.props.handlePrice} defaultValue={a} max={max}/>
      </div>
    )


  }
}

export default GasPrice
