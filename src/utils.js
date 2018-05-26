export const description = {
    title: 'How many projects will be shipped out of ETHBuenosAires',
    description: 'A prediction market to determine the amount of completed projects that the 2018 ETHBuenosAires Hackathon will produce',
    resolutionDate: new Date("2018-05-27T10:00:00Z").toISOString(),
    lowerbound,
    upperbound,
    decimals: 0,
    unit: "projects"
}
export const options = {
    ethereum: "https://rinkeby.infura.io",
    ipfs: '',
    gnosisdb: 'https://db.gnosis.pm',
    defaultAccount: '0x069fd4784D1DEd8A63923e83fF73c44414240043'
}