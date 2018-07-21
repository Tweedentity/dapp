const Utils = require('../utils')
import Slider, {createSliderWithTooltip} from 'rc-slider';

const SliderWithTooltip = createSliderWithTooltip(Slider);

class GasPrice extends React.Component {

  render() {

    const gasInfo = {}
    for (let k in this.props.gasInfo) {
      if ('safeLow,average,fast'.split(',').indexOf(k) !== -1) {
        gasInfo[k] = this.props.gasInfo[k] / 10
      }
    }

    const step = 0.1
    const marks = {}

    let defValue = Utils.bestPrice(gasInfo)

    marks[defValue] = <span><strong>{defValue}</strong></span>

    const format = spec => {
      const val = gasInfo[spec]
      let captions = []
      let br
      for (let k in gasInfo) {
        if (k === spec) {
          captions.push(spec)
        } else if (gasInfo[k] === val) {
          captions.push(k)
        }
      }
      marks[val] = <span><strong>{val}</strong><br/><span style={{fontSize: '70%'}}>{
        captions.map(spec2 => <div key={spec + spec2}>{spec2}</div>)
      }</span></span>
    }

    for (let k in gasInfo) {
      format(k)
    }

    return (<div style={{margin: '32px 8px 64px'}}>
        <SliderWithTooltip
          min={gasInfo.safeLow}
          marks={marks}
          step={step}
          included={false}
          onChange={this.props.handlePrice}
          defaultValue={defValue}
          max={gasInfo.fast}
        />
      </div>
    )


  }
}

export default GasPrice
