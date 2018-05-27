import React from 'react'
import Gnosis from '@gnosis.pm/pm-js'

const withGnosis = (options) => (Component) =>
  class GnosisWrapper extends React.Component {
    constructor(props) {
      super(props)
  
      this.state = {
        gnosis: undefined,
      }
    }

    async componentDidMount() {
      const gnosisInstance = await Gnosis.create(options)
 
      console.log(gnosisInstance)
      this.setState({ gnosis: gnosisInstance })
    }
  
    render() {
      if (!this.state.gnosis) {
        return null
      }
  
      return <Component gnosis={this.state.gnosis} {...this.props} />
    }
  }

export default withGnosis