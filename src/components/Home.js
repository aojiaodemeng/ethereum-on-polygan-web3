import React, { useEffect, useState } from 'react';
import './index.css';
import Web3 from 'web3';
import { POLYGON_CHAIN_ID, USDC_CONTRACT_ADDRESS } from './constants';
import ERC20ABI from './abi-erc20.json'

export const Home = () => {
    let web3 = new Web3(window.ethereum);;
    const [isInstalled, setIsInstalled] = useState(false);
    const [info, setInfo] = useState(null);
    useEffect(() => {
        const installed = typeof window.ethereum !== 'undefined';
        setIsInstalled(installed);

        console.log(installed ? 'MetaMask is installed!' : 'you should install MetaMask!')
    },[])
    const onInstallMMBtnClick = () => {
       window.open("https://metamask.io/")
    }

    const onConnectClick = async () => {
        // 首次connect会调用起MetaMask Notification面板，询问是否connect with MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        // 检测network是否是Polygon，默认是1，对应Ethereum，Polygon是137
        const chainId = window.ethereum.networkVersion;
        // console.log("window.ethereum.networkVersion:",chainId, typeof chainId);
        if (chainId !== POLYGON_CHAIN_ID) {
            window.alert("Current network is not Polygon, plz change it~")
        } else {
            // 利用window.ethereum 对象获取帐号信息
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            // 利用 web3 获取帐号信息，返回账户地址列表
            const accountAddresses = await web3.eth.getAccounts();
            // 默认获取第一个账户
            const accountAds = accountAddresses[0];
            let contractIns = new web3.eth.Contract(ERC20ABI, USDC_CONTRACT_ADDRESS);
            const info = await web3.eth.call({
                to: accountAds,
                data: contractIns.methods.balanceOf(accountAds).encodeABI()
            })
            const amount = Number(web3.utils.fromWei(info, 'ether')).toFixed(2)
            setInfo(amount)
        };
        
    };
    
    const isConnected = window.ethereum && window.ethereum.isConnected() && window.ethereum.enable();

    return (
        <div className="home">
            <div className="metaMaskInsInfo">
                监测到您的chrome浏览器{isInstalled ? '已经' : '还没有'}安装 MetaMask 应用。
                { isInstalled && isConnected && '并已经建立连接～' }
                {
                    isInstalled && !isConnected &&
                    <button className="metaMaskInsBtn" onClick={onConnectClick}>Click here to Connect to MetaMask</button>
                }
                {
                    !isInstalled && 
                    <button className="metaMaskInsBtn" onClick={onInstallMMBtnClick}>Click here to install MetaMask</button>
                }
            </div>
            {
                isConnected && info &&
                <div className="metaMaskInfo">
                    Polygon balance为：{info} USDC<br/>
                </div>
            }
        </div>
    )
}