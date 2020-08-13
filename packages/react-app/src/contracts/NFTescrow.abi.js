module.exports = [{"constant":false,"inputs":[{"name":"operator","type":"address"},{"name":"from","type":"address"},{"name":"tokenID","type":"uint256"},{"name":"data","type":"bytes"}],"name":"onERC721Received","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenID","type":"uint256"}],"name":"_transferNFT","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getFlowAddress","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"flowAddress","type":"string"}],"name":"_updateFlowAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"flowAddresses","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"tokenDetails","outputs":[{"name":"nftContract","type":"address"},{"name":"seller","type":"address"},{"name":"tokenId","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_from","type":"address"},{"indexed":false,"name":"_tokenID","type":"uint256"},{"indexed":false,"name":"_received","type":"bool"},{"indexed":false,"name":"_flowAddress","type":"string"}],"name":"_ERC721update","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_ethAddress","type":"address"},{"indexed":false,"name":"_flowAddress","type":"string"}],"name":"_flowAddressUpdated","type":"event"}]