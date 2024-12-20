const { ethers } = require("ethers");
const cron = require("node-cron");
require("dotenv").config();

// Load environment variables
const { INFURA_API_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

// ABI of the contract (include only the functions you interact with)
const abi = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "depositTokens",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_tokenContract",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "OwnableInvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "OwnableUnauthorizedAccount",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "ReentrancyGuardReentrantCall",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address[]",
                    "name": "recipients",
                    "type": "address[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "name": "transferTokensToBatch",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transferTokensToUser",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "withdrawTokens",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "tokenContract",
            "outputs": [
                {
                    "internalType": "contract ERC20",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
];

// Provider and Wallet setup
const provider = new ethers.JsonRpcProvider(INFURA_API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Recipients and amounts for transfer
const recipients = ["0x552E0f7494e0bF24D81Bb07512C5C4226A0AEE49", "0xa3BB0A6BA269F991b058365Dd0e626de2f2110Cf"]; // Replace with actual addresses
const amounts = [ethers.parseUnits("10", 18), ethers.parseUnits("20", 18)]; // Replace with amounts in token units


// Function to execute the transfer
async function transferTokensToBatch() {
    try {
        console.log("Triggering transferTokensToBatch...");

        const tx = await contract.transferTokensToBatch(recipients, amounts);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt.transactionHash);
    } catch (error) {
        console.error("Error executing transferTokensToBatch:", error);
    }
}

// Run the function 5 minutes after the script starts
setTimeout(() => {
    console.log("Executing task 5 minutes after script starts...");
    transferTokensToBatch();

    // Schedule it to repeat every day at the same time
    const now = new Date();
    const nextRunHour = now.getHours();
    const nextRunMinute = (now.getMinutes() + 5) % 60;

    cron.schedule(`${nextRunMinute} ${nextRunHour} * * *`, () => {
        console.log("Executing daily scheduled task...");
        transferTokensToBatch();
    });

    console.log(`Daily cron job scheduled for ${nextRunHour}:${nextRunMinute} every day.`);
}, 5 * 60 * 1000); // 5 minutes in milliseconds