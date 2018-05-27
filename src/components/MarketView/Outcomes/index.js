import React from 'react'

import CategoricalOutcome from './Categorical'
import ScalarOutcome from './Scalar'

const Outcomes = ({ market }) => {
  const { type, outcomes = ["SHORT", "LONG"] } = market
  return (
    <div>
      {type === 'SCALAR' ? <ScalarOutcome market={market} /> : <CategoricalOutcome market={market} />}
    </div>
  )
}

export default Outcomes