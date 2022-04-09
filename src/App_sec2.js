import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

/*
* window.ethereumにアクセスできることを確認します。
*/
export default function App() {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します */
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0xC1Bc750E9DDbEEb524A9422FDae8221197445e39";
  const contractABI = abi.abi;
  console.log("currentAccount: ", currentAccount);


  /* window.ethereumにアクセスできることを確認します */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /* ユーザーのウォレットへのアクセスが許可されているかどうかを確認します */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // connectWalletメソッドを実装
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // wave count function
  const wave = async() => {
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log("Signer", signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Get total wave count...", count.toNumber());
        const waveTxn = await wavePortalContract.wave();
        console.log("Minting...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Minted -- ", waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Get total wave count...", count.toNumber());
      }
      else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error){
      console.log(error);
    }
  }
/*
* WEBページがロードされたときに下記の関数を実行します。
*/
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="hand-wave">👋</span> WELCOME!
        </div>

        <div className="bio">
        イーサリアムウォレットを接続して、メッセージを作成したら、<span role="img" aria-label="hand-wave">👋</span>を送ってください<span role="img" aria-label="shine">✨</span>
        </div>


        {/* waveボタンにwave関数を連動させる。*/}
        <button className="waveButton" onClick={wave}>
          Wave at Me  
        </button>       
        {/* ウォレットコネクトのボタンを実装 */}
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
        )}
        {currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Wallet Connected
        </button>
        )}
      </div>
    </div>
  );
}
