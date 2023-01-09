import { useState } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import secp from 'ethereum-cryptography/secp256k1';

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    // Sign the send amount
    const messageBytes = utf8ToBytes("sendAmount");
    const hashedMessage = keccak256(messageBytes);
    console.log('private key:', privateKey);
    console.log('message bytes:', messageBytes);
    console.log('hashed message:', hashedMessage);

    try { 
      const [signature, recoveryBit] = await secp.sign(hashedMessage, privateKey, {recovered: true});
    } catch (err) {
      alert(err)
    }

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: signature,
        recoveryBit: recoveryBit,
        hashedMessage: hashedMessage,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
