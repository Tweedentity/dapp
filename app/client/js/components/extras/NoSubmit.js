const {Button} = ReactBootstrap

class NoSubmit extends React.Component {

  render() {

    return (
      <Button
        type="submit"
        style={{display: 'none'}}
        onClick={e => {
          e.preventDefault()
        }}>Set</Button>
    )
  }

}

export default NoSubmit
