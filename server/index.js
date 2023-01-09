const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "dc5e384ea5b03dac650fd87ca60efce6fde1e300": 100,
  "36d068f3933a7bd318b724ea1977589f7b70bf39": 50,
  "76c90c852c0dfc102a9ae958afa46f660b01ae08": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { signature, recoveryBit, hashedMessage, recipient, amount } = req.body;
  const publicKey = await secp.recoverPublicKey(hashedMessage, signature, recoveryBit);
  const sender = getAddress(publicKey);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function getAddress(publicKey) {
  const slicedPublicKey = publicKey.slice(1);
  const hash = keccak256(slicedPublicKey);
  return hash.slice(-20);
}
