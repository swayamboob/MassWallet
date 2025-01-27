import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';
export const TransactionContext = React.createContext();
import Web3 from 'web3';
const { ethereum } = window;


const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionContract;

}
export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);
    const [QrResult, setQrResult] = useState();
    const [isScanning, setIsScanning] = useState(false);
    const [balance, setBalance] = useState("0");
    const [update,setUpdate]= useState(true);
    const handleChange = (e, name) => {

        if (name != "addressTo") {
            setFormData((prevState) => ({ ...prevState, ["addressTo"]: QrResult }))
            setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
        } else {
            setQrResult(e.target.value);
            setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
        }
        // console.log(formData);
    }
    const getAllTransaction = async () => {
        try {
            if (!ethereum) return alert("please install metamask");

            const transactionContract = getEthereumContract();
            const availableTransaction = await transactionContract.getAllTransaction();
            const structuredTransaction = availableTransaction.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }))
            setTransactions(structuredTransaction);
            console.log(structuredTransaction);
        } catch (error) {
            console.log(error);
        }
    }
    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("please install metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                //get all transaction();
                console.log(accounts[0]);
                const bal = await ethereum.request({
                    method: 'eth_getBalance',
                    params: [accounts[0], 'latest'],
                });
                setBalance(ethers.utils.formatEther(bal));
                // getAllTransaction();
            } else {
                console.log("No accounts found");
            }

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }



    }
    const checkIfTransactionExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }
    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("please install metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);

            console.log("account is :", accounts[0]);
            console.log(balance);
            location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }
    const fetchamount = async()=>{
        const bal = await ethereum.request({
            method: 'eth_getBalance',
            params: [currentAccount, 'latest'],
        });
        console.log("data is fetched");
        setBalance(ethers.utils.formatEther(bal));
    }
    const handleConfirmation =(confirmationNumber,receipt)=>{
        fetchamount();
    }
    ethereum.on('confirmation', handleConfirmation);
    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("please install metamask");
            //data from form:

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);
            setIsLoading(true)
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '21000', //21000 GWEI
                    value: parsedAmount._hex, //0.00001

                }]
            })
            // const transactionHash= await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);
            setIsLoading(false);
            // console.log(`Loading- ${transactionHash.hash}`);
            // await transactionHash.wait();
            // setTimeout(() => { setIsLoading(false) }, 1000)
            // console.log(`Success-${transactionHash.hash}`);
            // const transactionCount= await transactionContract.getTransactionCount();
            // setTransactionCount(transactionCount.toNumber());
            // location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionExist();
    }, []);
    setInterval(async()=>{
        const bal = await ethereum.request({
            method: 'eth_getBalance',
            params: [currentAccount, 'latest'],
        });
        const balval=ethers.utils.formatEther(bal);
        setBalance(balval);
        // console.log(balance);
    },3000)
    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading, QrResult, setQrResult, isScanning, setIsScanning, balance, setBalance }}>
            {children}
        </TransactionContext.Provider>
    )
}